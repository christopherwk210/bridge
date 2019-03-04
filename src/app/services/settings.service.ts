import { Injectable } from '@angular/core';
import { SongResult } from '../shared/interfaces/song-result.interface';
import { SortType } from '../shared/sort-type';
import { RemoteService } from './remote.service';

type ViewMode = 'details' | 'grid' | 'compact';

interface LocalSettings {
  browseSortType: SortType;
  browseViewMode: ViewMode;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  localSettings: LocalSettings;

  browseCurrentSongResults: SongResult[];
  browseCurrentSearchQuery: string;

  chartLibraryDirectory: string;

  constructor(private remoteService: RemoteService) { }

  async loadSettings() {
    const result = await this.remoteService.talkIPC('request-initial-load-response', 'request-initial-load');

    try {
      this.localSettings = JSON.parse(result.args[0]);
    } catch (e) {
      //
    }

    // Initialize browse defaults
    this.browseCurrentSongResults = [];
    this.browseCurrentSearchQuery = '';
    return true;
  }

  saveSettings() {
    this.remoteService.sendIPCSync('save-settings', this.localSettings);
  }

  get browseSortType() { return this.localSettings.browseSortType; }
  set browseSortType(newValue: SortType) {
    this.localSettings.browseSortType = newValue;
    this.saveSettings();
  }

  get browseViewMode() { return this.localSettings.browseViewMode; }
  set browseViewMode(newValue: ViewMode) {
    this.localSettings.browseViewMode = newValue;
    this.saveSettings();
  }
}
