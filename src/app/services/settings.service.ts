import { Injectable } from '@angular/core';
import { SongResult } from '../shared/interfaces/song-result.interface';
import { SortType } from '../shared/sort-type';
import { RemoteService } from './remote.service';

type ViewMode = 'details' | 'grid' | 'compact';

interface LocalSettings {
  browseSortType: SortType;
  browseViewMode: ViewMode;
  chartLibraryDirectory: string;
  theme: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  readonly builtinThemes = ['Default', 'Dark'];

  localSettings: LocalSettings;

  browseCurrentSongResults: SongResult[] = [];
  browseCurrentSearchQuery = '';

  version: string;

  currentThemeLink: HTMLLinkElement;

  constructor(private remoteService: RemoteService) { }

  /**
   * Should be called once at start of application. Loads all local user settings
   * into memory, including version
   */
  async loadSettings() {
    const result = await this.remoteService.talkIPC('request-initial-load-response', 'request-initial-load');

    try {
      this.localSettings = JSON.parse(result.args[0]);
    } catch (e) {
      //
    }

    this.localSettings.chartLibraryDirectory = this.localSettings.chartLibraryDirectory || '';

    this.version = this.remoteService.sendIPCSync('request-version');

    return true;
  }

  /**
   * Sends current in-memory settings to be saved
   */
  saveSettings() {
    this.remoteService.sendIPCSync('save-settings', this.localSettings);
  }

  changeTheme(theme: string) {
    if (this.currentThemeLink) this.currentThemeLink.remove();
    if (theme === 'Default') return;

    const link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = `assets/themes/${theme}.css`;
    this.currentThemeLink = document.head.appendChild(link);
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

  get chartLibraryDirectory() { return this.localSettings.chartLibraryDirectory; }
  set chartLibraryDirectory(newValue: string) {
    this.localSettings.chartLibraryDirectory = newValue;
    this.saveSettings();
  }

  get theme() { return this.localSettings.theme; }
  set theme(newValue: string) {
    this.localSettings.theme = newValue;
    this.changeTheme(newValue);
    this.saveSettings();
  }
}
