import { Injectable, NgZone } from '@angular/core';
import { RemoteService } from './remote.service';
import { SettingsService } from './settings.service';

interface RemoteDownload {
  id: number;
  fileName: string;
  fileType: string;
  fileSize?: string;
  downloaded: number;
  artist: string;
  song: string;
}

interface Download {
  id: number;
  fileName: string;
  fileType: string;
  fileSize?: string;
  downloaded: number;
  percent?: number;
  done?: boolean;
  artist: string;
  song: string;
  transfer?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  currentDownloads: Download[] = [];

  constructor(private remoteService: RemoteService, private settingsService: SettingsService, private zone: NgZone) { }

  listenForUpdates() {
    this.remoteService.ipcRenderer.on('downloads-updated', (e, args) => this.handleUpdate(args));
    this.remoteService.ipcRenderer.on('transfer-failed', (e, args) => this.handleTransferFailed(args));
    this.remoteService.ipcRenderer.on('transfer-completed', (e, args) => this.handleTransferCompleted(args));
  }

  handleUpdate(remoteDownloads: RemoteDownload[]) {
    remoteDownloads.forEach(remoteDownload => {
      const index = this.currentDownloads.findIndex(download => download.id === remoteDownload.id);
      if (index > -1) {
        this.zone.run(() => {
          this.currentDownloads[index].downloaded = remoteDownload.downloaded;
          this.currentDownloads[index].percent = this.downloadPercent(this.currentDownloads[index]);

          // if (this.currentDownloads[index].percent === 100) this.handleFinishedDownload(this.currentDownloads[index]);
        });
      } else {
        const convertedDownload: Download = remoteDownload;
        convertedDownload.percent = 0;

        this.zone.run(() => {
          this.currentDownloads.push(convertedDownload);
        });
      }
    });

    this.zone.run(() => {
      this.currentDownloads = this.currentDownloads.map(download => {
        const remoteIndex = remoteDownloads.findIndex(remoteDownload => download.id === remoteDownload.id);
        if (remoteIndex === -1) {
          download.done = true;
          download.percent = 100;

          if (!download.transfer) this.handleFinishedDownload(download);
        }
        return download;
      });
    });
  }

  handleTransferFailed(response: { data: RemoteDownload, msg: string }) {
    console.log('failed: ', response);
  }

  handleTransferCompleted(response: { data: RemoteDownload }) {
    console.log('completed: ', response);
  }

  handleFinishedDownload(download: Download) {
    download.transfer = true;
    this.remoteService.sendIPC('download-finished', { remoteDownload: download, destination: this.settingsService.chartLibraryDirectory });
  }

  removeFinishedDownload(id: number) {
    this.currentDownloads = this.currentDownloads.filter(download => {
      if (download.id === id) {
        if (download.done || download.downloaded === parseInt(download.fileSize)) {
          return false;
        }
      }

      return true;
    });
  }

  downloadPercent(download: Download) {
    if (!download.fileSize) return download.done ? 100 : 99.9;
    return Math.ceil((download.downloaded / parseInt(download.fileSize)) * 100);
  }
}
