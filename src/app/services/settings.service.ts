import { Injectable } from '@angular/core';
import { SongResult } from '../shared/interfaces/song-result.interface';
import { SortType } from '../shared/sort-type';
import { RemoteService } from './remote.service';
import { CacheService } from './cache.service';

type ViewMode = 'details' | 'grid' | 'compact';

interface LocalSettings {
  browseSortType: SortType;
  browseViewMode: ViewMode;
  chartLibraryDirectory: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  localSettings: LocalSettings;

  private localbrowseCurrentSongResults: SongResult[] = [];
  browseCurrentSearchQuery = '';

  downloadsCurrent: any[] = [];

  version: string;

  constructor(private remoteService: RemoteService, private cacheService: CacheService) { }

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

  private async checkForImages(songs: SongResult[]) {
    const songsWithImages = songs.filter(song => !!song.directLinks['album.png']);
    const updatedSongs = await this.cacheService.saveSongsImagesToCache(songsWithImages);

    this.localbrowseCurrentSongResults = this.localbrowseCurrentSongResults.map(song => {
      const updatedSong = updatedSongs.find(searchedUpdatedSong => searchedUpdatedSong.id === song.id);
      return updatedSong ? updatedSong : song;
    });
  }

  appendCurrentSongResults(newSongs: SongResult[]) {
    this.localbrowseCurrentSongResults.push(...newSongs);
    this.checkForImages(newSongs);
  }
  get browseCurrentSongResults() { return this.localbrowseCurrentSongResults; }
  set browseCurrentSongResults(newSongs: SongResult[]) {
    this.localbrowseCurrentSongResults = newSongs;
    this.checkForImages(newSongs);
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
}
