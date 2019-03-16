import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { SettingsService } from 'src/app/services/settings.service';

import { SongResult } from '../../shared/interfaces/song-result.interface';
import { $ } from '../../shared/globals';
import { SortType, sortTypeReadable } from '../../shared/sort-type';
import * as sortFunctions from '../../shared/song-result-sorts';

import { ModalComponent } from '../modal/modal.component';
import { RemoteService } from 'src/app/services/remote.service';

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
  @ViewChild('modal') modal: ModalComponent;

  loading: boolean;
  sortTypeReadables = sortTypeReadable;

  constructor(
    private api: ApiService,
    public settingsService: SettingsService,
    private router: Router,
    private remoteService: RemoteService
  ) {}

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

        const tempResults = this.settingsService.browseCurrentSongResults.slice();
        this.settingsService.browseCurrentSongResults = [];

        setTimeout(() => {
          this.settingsService.browseCurrentSongResults = tempResults;
          this.sortResults(actualValue);
        });
      }
    });

    // If we aren't loading into unsorted data, force a sort on load
    if (this.settingsService.browseSortType !== - 1) {
      this.setSort(this.settingsService.browseSortType);
    }
  }

  handleBasicSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.settingsService.browseCurrentSearchQuery = e.target['value'];
      this.loadBasicSearch(this.settingsService.browseCurrentSearchQuery);
    }
  }

  sortResults(sortType: SortType) {
    this.settingsService.browseCurrentSongResults.sort( sortFunctions.getSortTypeFunction(sortType) );
  }

  setSort(value: SortType) {
    $(this.uiSortDropdown.nativeElement).dropdown('set selected', `${value}`);
  }

  async randomize() {
    await this.loadNewData('random');
  }

  async loadLatestData() {
    await this.loadNewData('latest');
  }

  async loadNewData(dataset: 'random' | 'latest') {

    // Reset to newest sorting if currently unsorted
    if (this.settingsService.browseSortType === -1) {
      this.settingsService.browseSortType = SortType.NEWEST;
      this.setSort(SortType.NEWEST);
    }

    // Reset our search query, loading state, and current list of songs
    this.settingsService.browseCurrentSearchQuery = '';
    this.loading = true;
    this.settingsService.browseCurrentSongResults = [];

    // Determine our dataset and request it
    let method;
    switch (dataset) {
      case 'random': method = 'getRandom'; break;
      case 'latest': method = 'getLatest'; break;
    }

    const result = await this.api[method]();

    // Save and sort the results
    this.settingsService.browseCurrentSongResults = result.songs;
    this.sortResults(this.settingsService.browseSortType);

    this.loading = false;
  }

  async loadBasicSearch(query: string) {
    this.loading = true;
    this.settingsService.browseCurrentSongResults = [];

    const result = await this.api.getBasicSearch(query);
    this.settingsService.browseCurrentSongResults = result.songs;

    $(this.uiSortDropdown.nativeElement).dropdown('clear');
    $(this.uiSortDropdown.nativeElement).dropdown('set text', 'Relevance');
    this.settingsService.browseSortType = -1;

    this.loading = false;
  }

  async handleDownloadClicked(song: SongResult) {
    console.log(song);
    if (!this.settingsService.chartLibraryDirectory) {
      const response = await this.modal.showModal([
        {
          class: 'ui cancel inverted button',
          text: 'Keep browsing'
        },
        {
          class: 'ui teal ok inverted button',
          text: 'Go to settings'
        }
      ]);

      if (response === 1) this.router.navigate(['/settings']);
    } else {
      if (song.directLinks.archive) {
        this.remoteService.sendIPC('add-new-download', song.directLinks.archive);
      } else {
        const albumArt = song.directLinks['album.jpg'] || song.directLinks['album.png'];
        const audio = song.directLinks['song.ogg'] || song.directLinks['song.mp3'];
        const guitarAudio = song.directLinks['guitar.ogg'] || song.directLinks['guitar.mp3'];

        if (albumArt) this.remoteService.sendIPC('add-new-download', albumArt);
        if (audio) this.remoteService.sendIPC('add-new-download', audio);
        if (guitarAudio) this.remoteService.sendIPC('add-new-download', guitarAudio);

        if (song.directLinks.chart) this.remoteService.sendIPC('add-new-download', song.directLinks.chart);
        if (song.directLinks.ini) this.remoteService.sendIPC('add-new-download', song.directLinks.ini);
      }
    }
  }

  handleDetailClicked(song: SongResult) { console.log(song); }
}
