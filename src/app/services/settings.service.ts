import { Injectable } from '@angular/core';
import { SongResult } from '../shared/interfaces/song-result.interface';
import { SortType } from '../shared/sort-type';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  browseCurrentSongResults: SongResult[];
  browseSortType: SortType;
  browseViewMode: 'details' | 'grid' | 'compact';

  constructor() { }

  async loadSettings() {
    this.browseCurrentSongResults = [];
    this.browseSortType = SortType.NEWEST;
    this.browseViewMode = 'details';
    return true;
  }
}
