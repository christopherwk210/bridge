import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';

interface RemoteDownload {
  id: number;
  fileName: string;
  fileType: string;
  fileSize?: string;
  downloaded: number;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(private remoteService: RemoteService) { }

  listenForUpdates() {
    this.remoteService.ipcRenderer.on('downloads-updated', (e, args) => this.handleUpdate(args));
  }

  handleUpdate(remoteDownloads: RemoteDownload[]) {
    console.log(remoteDownloads);
  }
}
