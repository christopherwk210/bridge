import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { DownloadService } from '../../services/download.service';

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {

  constructor(public settingsService: SettingsService, public downloadService: DownloadService) { }

  ngOnInit() {
  }

  clearDownload(id: number) {
    this.downloadService.removeFinishedDownload(id);
  }

}
