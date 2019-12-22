import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { DownloadService } from '../../services/download.service';
import { DownloadState } from 'src/app/shared/interfaces/download.interface';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {
  DownloadState = DownloadState

  constructor(public settingsService: SettingsService, public downloadService: DownloadService) { }

  ngOnInit() {
  }

  clearDownload(id: number) {
    this.downloadService.removeDownload(id);
  }

  clearDownloads() {
    this.downloadService.currentDownloads.forEach(download => {
      if (download.state == DownloadState.finished) {
        this.clearDownload(download.id);
      }
    });
  }
}
