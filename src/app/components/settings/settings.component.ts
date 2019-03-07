import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { RemoteService } from 'src/app/services/remote.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(public settingService: SettingsService, private remoteService: RemoteService) { }

  ngOnInit() {
  }

  async getLibraryDirectory() {
    const result = await this.remoteService.showOpenDialog({
      title: 'Choose library folder',
      buttonLabel: 'This is where my charts are!',
      defaultPath: this.settingService.chartLibraryDirectory || '',
      properties: ['openDirectory']
    });

    if (result) {
      this.settingService.chartLibraryDirectory = result[0];
    }
  }

}
