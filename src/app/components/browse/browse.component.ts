import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SongResult } from '../../shared/interfaces/song-result.interface';
import { SortType, sortTypeReadable } from '../../shared/sort-type';
import * as sortFunctions from '../../shared/song-result-sorts';

import { $ } from '../../shared/globals';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit, AfterViewInit {
  @ViewChild('uiCompactBtn') uiCompactBtn: ElementRef;
  @ViewChild('uiDetailBtn') uiDetailBtn: ElementRef;
  @ViewChild('uiGridBtn') uiGridBtn: ElementRef;
  @ViewChild('uiRandomBtn') uiRandomBtn: ElementRef;
  @ViewChild('uiSortDropdown') uiSortDropdown: ElementRef;
  @ViewChild('uiNewestBtn') uiNewestBtn: ElementRef;

  loading: boolean;
  sortTypeReadables = sortTypeReadable;

  constructor(private api: ApiService, public settingsService: SettingsService) {
  }

  ngOnInit() {
    if (!this.settingsService.browseCurrentSongResults || !this.settingsService.browseCurrentSongResults.length) this.loadLatestData();
  }

  ngAfterViewInit() {
    [
      this.uiDetailBtn.nativeElement,
      this.uiGridBtn.nativeElement,
      this.uiCompactBtn.nativeElement,
      this.uiRandomBtn.nativeElement,
      this.uiNewestBtn.nativeElement
    ].forEach(element => {
      $(element).popup();
    });

    $(this.uiSortDropdown.nativeElement).dropdown({
      onChange: (value: string, text: string) => {
        const actualValue = parseInt(value);
        this.settingsService.browseSortType = actualValue;
        this.sortResults(actualValue);
      }
    });

    this.setSort(this.settingsService.browseSortType);
  }

  sortResults(sortType: SortType) {
    switch (sortType) {
      case SortType.NEWEST: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByNewest); break;
      case SortType.OLDEST: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByOldest); break;
      case SortType.SONG_NAME_ASC: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByNameAscending); break;
      case SortType.SONG_NAME_DES: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByNameDescending); break;
      case SortType.ARTIST_NAME_ASC: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByArtistNameAscending); break;
      case SortType.ARTIST_NAME_DES: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByArtistNameDescending); break;
      case SortType.ALBUM_NAME_ASC: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByAlbumNameAscending); break;
      case SortType.ALBUM_NAME_DES: this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByAlbumNameDescending); break;
      case SortType.DIFFUCULTY_ASC:
        this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByGuitarDifficultyAscending); break;
      case SortType.DIFFUCULTY_DES:
        this.settingsService.browseCurrentSongResults.sort(sortFunctions.sortByGuitarDifficultyDescending); break;
    }
  }

  async randomize() {
    this.loading = true;
    this.settingsService.browseCurrentSongResults = [];
    const result = await this.api.getRandom();
    this.settingsService.browseCurrentSongResults = result.songs;
    this.sortResults(this.settingsService.browseSortType);
    this.loading = false;
  }

  setSort(value: SortType) {
    $(this.uiSortDropdown.nativeElement).dropdown('set selected', value);
  }

  async loadLatestData() {
    this.loading = true;
    this.settingsService.browseCurrentSongResults = [];
    const result = await this.api.getLatest();
    this.settingsService.browseCurrentSongResults = result.songs;
    this.sortResults(this.settingsService.browseSortType);
    this.loading = false;
  }

  handleDownloadClicked(song: SongResult) { console.log(song); }
  handleDetailClicked(song: SongResult) { console.log(song); }

}
