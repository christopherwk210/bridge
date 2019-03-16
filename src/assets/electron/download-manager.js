const request = require('request');
const fs = require('fs');
const path = require('path');

class DownloadManager {
  /**
   * @param {Function} onUpdate Callback called whenever a download is added, updated, or finished
   */
  constructor(onUpdate) {
    this.onUpdateCallback = onUpdate;
    this.currentDownloads = [];
    this.requests = {};
    this.lastID = 0;
  }

  addDownload(url, outputDestination) {
    let currentDownload = {};
    let writeStream;
    const req = request.get(url);

    req.on('response', res => {
      const filenameRegex = /filename="([^"]+)"/g;

      currentDownload.id = ++this.lastID;

      this.requests[currentDownload.id] = req;

      if (res.headers['server'] && res.headers['server'] === 'cloudflare') {
        // Cloudflare specific jazz
        // currentDownload.fileName = 'temp' + currentDownload.id;
        currentDownload.fileName = decodeURIComponent( path.basename(url) );
      } else {
        // GDrive specific jazz
        currentDownload.fileName = filenameRegex.exec(res.headers['content-disposition'])[1];
      }

      currentDownload.fileType = res.headers['content-type'];
      currentDownload.fileSize = res.headers['content-length'];
      currentDownload.downloaded = 0;

      writeStream = fs.createWriteStream(
        path.join(outputDestination, currentDownload.fileName)
      );
      req.pipe(writeStream);

      this.currentDownloads.push(currentDownload);

      this.onUpdateCallback(this.currentDownloads);
    });

    req.on('data', chunk => {
      currentDownload.downloaded += chunk.length;
      this.onUpdateCallback(this.currentDownloads);
    });

    req.on('end', () => {
      this.currentDownloads = this.currentDownloads.filter(download => download.id !== currentDownload.id);
      this.onUpdateCallback(this.currentDownloads);
    });
  }

  cancelDownload(id) {
    this.requests[id].destroy();
  }
}

module.exports = DownloadManager;
