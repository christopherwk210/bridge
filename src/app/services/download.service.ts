import { Injectable, NgZone } from '@angular/core';
import { RemoteService } from './remote.service';
import { Download, DownloadState } from '../shared/interfaces/download.interface';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  currentDownloads: Download[] = [];

  constructor(private remoteService: RemoteService, private zone: NgZone) { }

  listenForUpdates() {
    this.remoteService.ipcRenderer.on('download-started', (e, args) => this.handleDownloadStarted(args));
    this.remoteService.ipcRenderer.on('download-updated', (e, args) => this.handleDownloadUpdated(args));
  }

  handleDownloadStarted(download: Download) {
    this.zone.run(() => {
      this.currentDownloads.push(download);
    });
  }

  handleDownloadUpdated(download: Download) {
    this.zone.run(() => {
      const currentDownload = this.currentDownloads.find(download1 => download1.id == download.id);
      if (currentDownload != undefined) {
        currentDownload.state = download.state;
        switch(currentDownload.state) {
          case DownloadState.download:
            currentDownload.downloaded = download.downloaded;
            currentDownload.percent = this.downloadPercent(currentDownload);
            break;
          case DownloadState.extractFailed:
          case DownloadState.transferFailed:
            console.log('failed: ', download.errorMessage);
            break;
          case DownloadState.finished:
            console.log(`Downloaded "${currentDownload.artist} - ${currentDownload.song} (${currentDownload.charter})"`);
            break;
        }
      }
    });
  }

  removeDownload(downloadID: number) {
    this.currentDownloads = this.currentDownloads.filter(download => download.id != downloadID);
  }

  downloadPercent(download: Download) {
    if (!download.fileSize) return 99.9;
    return Math.ceil((download.downloaded / parseInt(download.fileSize)) * 100);
  }
}
