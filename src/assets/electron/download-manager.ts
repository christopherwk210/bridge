import * as needle from 'needle';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as extract from 'extract-zip';
import { AddNewDownloadData, Download, DownloadState } from '../../app/shared/interfaces/download.interface';
let sanitize = require('sanitize-filename');

// Asyncification
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);

class DownloadManager {
  onStartCallback: (currentDownload: Download) => void;
  onUpdateCallback: (currentDownload: Download) => void;
  private requests = {};
  private lastID = 0;
  private libraryFolder: string;

  private updateState(download: Download, newState: DownloadState) {
    download.state = newState;
    this.onUpdateCallback(download);
  }

  async addDownload(data: AddNewDownloadData, tempFolder: string) {
    this.libraryFolder = data.destination;

    let currentDownload: Download = {
      id: ++this.lastID,
      state: DownloadState.waitingForResponse,
      url: data.link,
      song: data.song,
      artist: data.artist,
      charter: data.charter,
      isArchive: data.isArchive,
      fileName: '',
      fileType: '',
      fileSize: '',
      downloaded: 0,
      percent: 0,
      tempFolder: path.join(tempFolder, this.sanitizeFilename(`${data.artist} - ${data.song} (${data.charter})`))
    };

    this.onStartCallback(currentDownload);

    this.requestDownload(currentDownload);
  }

  private requestDownload(currentDownload: Download, cookieHeader?: string) {
    const req = needle.get(currentDownload.url, {
      follow_max: 10,
      headers: (cookieHeader ? { 'Cookie': cookieHeader } : undefined)
    });

    req.on('header', (statusCode, headers: Headers) => {
      if (statusCode != 200) {
        currentDownload.errorMessage = `Failed to download chart: request to [${currentDownload.url}] returned status code ${statusCode}.`;
        this.updateState(currentDownload, DownloadState.failedToRespond);
        return;
      }

      currentDownload.fileType = headers['content-type'];
      if (currentDownload.fileType.startsWith('text/html')) {
        console.log('REQUEST RETURNED HTML');
        this.handleHTMLResponse(req, currentDownload, headers['set-cookie']);
      } else {
        console.log(`REQUEST RETURNED FILE DOWNLOAD (x-goog-hash=[${headers['x-goog-hash']}])`);
        currentDownload.fileName = this.getDownloadFileName(currentDownload.url, headers);
        currentDownload.fileType = headers['content-type'];
        currentDownload.fileSize = headers['content-length'];
        this.updateState(currentDownload, DownloadState.download);
        this.handleDownloadResponse(req, currentDownload, headers);
      }
    });
  }

  private getDownloadFileName(url: string, headers: Headers) {
    if (headers['server'] && headers['server'] === 'cloudflare') {
      // Cloudflare specific jazz
      return this.sanitizeFilename(decodeURIComponent(path.basename(url)));
    } else {
      // GDrive specific jazz
      const filenameRegex = /filename="(.*?)"/g;
      let results = filenameRegex.exec(headers['content-disposition']);
      if (results == null) {
        console.log(`Warning: couldn't find filename in content-disposition header: [${headers['content-disposition']}]`);
        return 'unknownFilename';
      } else {
        return this.sanitizeFilename(results[1]);
      }
    }
  }

  private handleHTMLResponse(req: NodeJS.ReadableStream, currentDownload: Download, cookieHeader: string) {
    // The response returned the google drive "couldn't scan for viruses" page
    let virusScanHTML = '';
    req.on('data', data => virusScanHTML += data);
    req.on('done', (err) => {
      if (err) {
        currentDownload.errorMessage = `Failed to download chart: couldn't load the google HTML response: ${err}`;
        this.updateState(currentDownload, DownloadState.downloadFailed);
      } else {
        const confirmTokenRegex = /confirm=([0-9A-Za-z]+)&/g;
        const confirmTokenResults = confirmTokenRegex.exec(virusScanHTML);
        if (confirmTokenResults == null) {
          currentDownload.errorMessage = `Failed to download chart: invalid HTML response; couldn't find confirm token.`;
          this.updateState(currentDownload, DownloadState.downloadFailed);
        } else {
          const confirmToken = confirmTokenResults[1];
          const downloadID = currentDownload.url.substr(currentDownload.url.indexOf('id=') + 'id='.length);
          currentDownload.url = `https://drive.google.com/uc?confirm=${confirmToken}&id=${downloadID}`;
          console.log(`NEW LINK: ${currentDownload.url}`);
          console.log(`COOKIE HEADER: [${cookieHeader}]`);
          this.requestDownload(currentDownload, cookieHeader);
        }
      }
    });
  }

  private async handleDownloadResponse(req: NodeJS.ReadableStream, currentDownload: Download, headers: Headers) {
    // The response should be a file download
    this.requests[currentDownload.id] = req;

    const tempFolderExists = await this.access(currentDownload.tempFolder, fs.constants.F_OK);
    if (!tempFolderExists) {
      try {
        await mkdir(currentDownload.tempFolder);
      } catch (err) {
        currentDownload.errorMessage = `Failed to download chart: failed to create temporary directory: ${err}`;
        this.updateState(currentDownload, DownloadState.downloadFailed);
        return;
      }
    }
    const filePath = path.join(currentDownload.tempFolder, currentDownload.fileName);
    req.pipe(fs.createWriteStream(filePath));

    req.on('data', chunk => {
      currentDownload.downloaded += chunk.length;
      this.onUpdateCallback(currentDownload);
    });

    req.on('end', async () => {
      if (currentDownload.isArchive) {
        this.updateState(currentDownload, DownloadState.extract);
        await this.extractDownload(currentDownload);
      }

      if (currentDownload.state != DownloadState.extractFailed) {
        this.updateState(currentDownload, DownloadState.transfer);
        this.transferDownload(currentDownload);
      }
    });
  }

  cancelDownload(id: string) { //TODO: add ui to call this?
    this.requests[id].destroy(); // This won't work with needle requests
  }

  private async extractDownload(download: Download) {
    const source = path.join(download.tempFolder, download.fileName);
    return new Promise<void>((resolve) => {
      extract(source, { dir: download.tempFolder }, async (err) => {
        if (err) {
          //TODO: this fails too often with valid .zip/.rar files
          download.errorMessage = `Failed to extract the downloaded file: ${err}`;
          this.updateState(download, DownloadState.extractFailed);
        } else {
          try {
            await unlink(source);
          } catch (err) {
            download.errorMessage = `Failed to extract the downloaded file: ${err}`;
            this.updateState(download, DownloadState.extractFailed);
          }
        }

        resolve();
      });
    });
  }

  private async transferDownload(download: Download) {
    try {
      const destinationFolder = path.join(this.libraryFolder, path.basename(download.tempFolder));

      // Create the destination folder if it doesn't exist
      const destFolderExists = await this.access(destinationFolder, fs.constants.F_OK);
      if (!destFolderExists) {
        await mkdir(destinationFolder);
      }

      let files = (download.isArchive ? await readdir(download.tempFolder) : [download.fileName]);
      // If the chart folder is in the archive folder, rather than the chart files
      const isFolderArchive = (files.length < 2 && !fs.lstatSync(path.join(download.tempFolder, files[0])).isFile());
      if (download.isArchive && isFolderArchive) {
        download.tempFolder = path.join(download.tempFolder, files[0]);
        files = await readdir(download.tempFolder);
      }

      // Copy the files from the temporary directory to the destination
      for (const file of files) {
        await copyFile(path.join(download.tempFolder, file), path.join(destinationFolder, file));
        await unlink(path.join(download.tempFolder, file));
      }

      // Delete the extracted folder from the temporary directory
      if (isFolderArchive) {
        await rmdir(download.tempFolder);
      }

      this.updateState(download, DownloadState.finished);
    } catch (err) {
      download.errorMessage = `Copying the downloaded file to the target directory failed: ${err}`;
      this.updateState(download, DownloadState.transferFailed);
    }
  }

  private access(pathLike: fs.PathLike, mode: number) {
    return new Promise(resolve => {
      fs.access(pathLike, mode, error => {
        resolve(!error);
      });
    });
  }

  private sanitizeFilename(filename: string): string {
    const newName = sanitize(filename, {
      replacement: ((invalidChar: string) => {
        switch (invalidChar) {
          case '/': return '-';
          case '\\': return '-';
          case '"': return "'";
          default: return '_'; //TODO: add more cases for replacing invalid characters
        }
      })
    });
    return newName;
  }
}

export const downloadManager = new DownloadManager();
