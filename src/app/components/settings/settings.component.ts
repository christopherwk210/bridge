import { Component, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { SettingsService } from 'src/app/services/settings.service';
import { RemoteService } from 'src/app/services/remote.service';
import { $ } from '../../shared/globals';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, AfterViewInit {
  @ViewChild('uiThemeDropdown') themeDropdown: ElementRef;

  cacheSize = 'Calculating...';

  constructor(public settingService: SettingsService, private remoteService: RemoteService, private zone: NgZone) { }

  async ngOnInit() {
    const size = await this.getCacheSize();
    this.cacheSize = Math.round(size / 1000000) + ' MB';
  }

  ngAfterViewInit() {
    $(this.themeDropdown.nativeElement).dropdown({
      onChange: (value: string, text: string) => {
        this.settingService.theme = text;
      }
    });
  }

  getCacheSize(): Promise<number> {
    return new Promise(resolve => {
      this.remoteService.remote.session.defaultSession.getCacheSize(size => {
        resolve(size);
      });
    });
  }

  clearCache() {
    this.cacheSize = 'Please wait...';
    this.remoteService.remote.session.defaultSession.clearCache(() => {
      // Remote service callbacks are executed outside of zone, which Angular can't see
      this.zone.run(() => this.cacheSize = 'Cleared!');
    });
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

  openLibraryDirectory() {
    this.remoteService.remote.shell.showItemInFolder(this.settingService.chartLibraryDirectory);
  }
}
