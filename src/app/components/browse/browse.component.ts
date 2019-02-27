import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SongResult } from 'src/app/interfaces/song-result.interface';

import $ from '../../jQuery';

enum SortType {
  NEWEST,
  OLDEST,
  SONG_NAME,
  SONG_NAME_REVERSE,
  ARTIST_NAME,
  ARTIST_NAME_REVERSE,
  ALBUM_NAME,
  ALBUM_NAME_REVERSE
}

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

  currentResults: SongResult[];
  loading = true;
  sortType: SortType = SortType.NEWEST;
  viewMode: 'details' | 'grid' | 'compact' = 'details';

  constructor(private api: ApiService) {

  }

  ngOnInit() {
    this.loadLatestData();
  }

  ngAfterViewInit() {
    [
      this.uiDetailBtn.nativeElement,
      this.uiGridBtn.nativeElement,
      this.uiCompactBtn.nativeElement,
      this.uiRandomBtn.nativeElement
    ].forEach(element => {
      $(element).popup();
    });

    $(this.uiSortDropdown.nativeElement).dropdown({
      onChange: (value: number, text: string) => this.sortType = value
    });

    this.setSort(this.sortType);
  }

  async randomize() {
    this.currentResults = [];
    this.loading = true;
    const result = await this.api.getRandom();
    this.currentResults = result.songs;
    this.loading = false;
  }

  setSort(value: SortType) {
    $(this.uiSortDropdown.nativeElement).dropdown('set selected', value);
  }

  async loadLatestData() {
    this.currentResults = [];
    const result = await this.api.getLatest();
    this.currentResults = result.songs;
    this.loading = false;
  }

}
