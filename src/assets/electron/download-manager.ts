import * as request from 'request';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as extract from 'extract-zip';
import { AddNewDownloadData, Download, DownloadState, UpdateDownloadData } from '../../app/shared/interfaces/download.interface';
let sanitize = require('sanitize-filename');

// Asyncification
const mkdir = util.promisify(fs.mkdir);
const rmdir = util.promisify(fs.rmdir);
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);
const readdir = util.promisify(fs.readdir);

class DownloadManager {
  onStartCallback: (currentDownload: Download) => void;
  onUpdateCallback: (data: UpdateDownloadData) => void;
  private requests = {};
  private lastID = 0;

  private updateState(download: Download, newState: DownloadState, errorMessage?: string) {
    download.state = newState;
    if (errorMessage == undefined) {
      this.onUpdateCallback(download);
    } else {
      this.onUpdateCallback(Object.assign({ errorMessage }, download));
    }
  }

  addDownload(data: AddNewDownloadData, tempFolder: string) {
    const req = request.get(data.link);
    const downloadID = ++this.lastID;
    let currentDownload: Download;

    req.on('response', res => {
      const filenameRegex = /filename="([^"]+)"/g;

      this.requests[downloadID] = req;

      let fileName: string;
      if (res.headers['server'] && res.headers['server'] === 'cloudflare') {
        // Cloudflare specific jazz
        fileName = this.sanitizeFilename(decodeURIComponent(path.basename(data.link)));
      } else {
        // GDrive specific jazz
        fileName = this.sanitizeFilename(filenameRegex.exec(res.headers['content-disposition'])[1]);
      }

      const writeStream = fs.createWriteStream(
        path.join(tempFolder, fileName)
      );
      req.pipe(writeStream);

      currentDownload = {
        id: downloadID,
        state: DownloadState.download,
        url: data.link,
        song: data.song,
        artist: data.artist,
        charter: data.charter,
        isArchive: data.isArchive,
        fileName: fileName,
        fileType: res.headers['content-type'],
        fileSize: res.headers['content-length'],
        downloaded: 0,
        percent: 0
      };

      this.onStartCallback(currentDownload);
    });

    req.on('data', chunk => {
      currentDownload.downloaded += chunk.length;
      this.onUpdateCallback(currentDownload);
    });

    req.on('end', async () => {
      if (currentDownload.isArchive) {
        this.updateState(currentDownload, DownloadState.extract);
        await this.extractDownload(currentDownload, tempFolder);
      }

      if (currentDownload.state != DownloadState.extractFailed) {
        this.updateState(currentDownload, DownloadState.transfer);
        if (currentDownload.isArchive) {
          this.transferArchive(currentDownload, tempFolder, data.destination);
        } else {
          this.transferDownload(currentDownload, tempFolder, data.destination);
        }
      }
    });
  }

  cancelDownload(id: string) { //TODO: add ui to call this?
    this.requests[id].destroy();
  }

  async extractDownload(download: Download, tempFolder: string) {
    const source = path.join(tempFolder, download.fileName);
    const destination = path.join(tempFolder, String(download.id));
    return new Promise<void>((resolve) => {
      extract(source, { dir: destination }, (err) => {
        if (err) {
          this.updateState(download, DownloadState.extractFailed, `Failed to extract the downloaded file: ${err}`);
        }
        resolve();
      });
    });
  }

  async transferArchive(download: Download, tempFolder: string, destination: string) {
    let tempFolderPath = path.join(tempFolder, String(download.id));
    const destinationFolder = path.join(destination, this.sanitizeFilename(`${download.artist} - ${download.song} (${download.charter})`));

    // Check if the destination folder exists
    const destinationFolderExists = await this.access(destinationFolder, fs.constants.F_OK);

    try {
      if (destinationFolderExists) {
        this.updateState(download, DownloadState.transferFailed, 'A folder for this chart already exists in the target directory.');
        return;
      } else {
        // Create the destination folder if it doesn't exist
        await mkdir(destinationFolder);
      }

      // Copy the files from the temporary directory to the destination
      let files = await readdir(tempFolderPath);
      // If the chart folder is in the archive folder, rather than the chart files
      const isFolderArchive = (files.length < 2 && !fs.lstatSync(path.join(tempFolderPath, files[0])).isFile());
      if (isFolderArchive) {
        tempFolderPath = path.join(tempFolderPath, files[0]);
        files = await readdir(tempFolderPath);
      }
      for (const file of files) {
        await copyFile(path.join(tempFolderPath, file), path.join(destinationFolder, file));
        await unlink(path.join(tempFolderPath, file));
      }

      // Delete the folder from the temporary directory
      if (isFolderArchive) {
        await rmdir(tempFolderPath);
      }
      await rmdir(path.join(tempFolder, String(download.id)));

      this.updateState(download, DownloadState.finished);
    } catch (error) {
      this.updateState(download, DownloadState.transferFailed, `Copying the downloaded file to the target directory failed: ${error}`);
    }
  }

  async transferDownload(download: Download, tempFolder: string, destination: string) {
    const tempFilePath = path.join(tempFolder, download.fileName);
    const destinationFolder = path.join(destination, this.sanitizeFilename(`${download.artist} - ${download.song} (${download.charter})`));
    const destinationFile = path.join(destinationFolder, download.fileName);

    // Check if the destination folder exists
    const destinationFolderExists = await this.access(destinationFolder, fs.constants.F_OK);

    try {
      if (destinationFolderExists) {
        // Check if the destination file already exists somehow
        const destinationFileExists = await this.access(destinationFile, fs.constants.F_OK);

        // Short circuit if it does exist
        if (destinationFileExists) {
          this.updateState(download, DownloadState.transferFailed, 'The downloaded file already exists in the target directory.');
          return;
        }
      } else {
        // Create the destination folder if it doesn't exist
        await mkdir(destinationFolder);
      }

      // Copy the file from the temporary directory to the destination
      await copyFile(tempFilePath, destinationFile);

      // Delete the file from the temporary directory
      await unlink(tempFilePath);

      this.updateState(download, DownloadState.finished);
    } catch (error) {
      this.updateState(download, DownloadState.transferFailed, `Copying the downloaded file to the target directory failed: ${error}`);
    }
  }

  access(pathLike: fs.PathLike, mode: number) {
    return new Promise(resolve => {
      fs.access(pathLike, mode, error => {
        resolve(!error);
      });
    });
  }

  sanitizeFilename(filename: string): string {
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
