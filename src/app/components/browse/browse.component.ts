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
  @ViewChild('uiDetailBtn') uiDetailBtn: ElementRef;
  @ViewChild('uiGridBtn') uiGridBtn: ElementRef;
  @ViewChild('uiRandomBtn') uiRandomBtn: ElementRef;
  @ViewChild('uiSortDropdown') uiSortDropdown: ElementRef;

  currentResults: SongResult[];
  sortType: SortType = SortType.NEWEST;
  viewMode: 'details' | 'grid' = 'details';

  constructor(private api: ApiService) {

  }

  ngOnInit() {
    this.loadLatestData();
  }

  ngAfterViewInit() {
    [
      this.uiDetailBtn.nativeElement,
      this.uiGridBtn.nativeElement,
      this.uiRandomBtn.nativeElement
    ].forEach(element => {
      $(element).popup();
    });

    $(this.uiSortDropdown.nativeElement).dropdown({
      onChange: (value: number, text: string) => this.sortType = value
    });

    this.setSort(this.sortType);
  }

  setSort(value: SortType) {
    $(this.uiSortDropdown.nativeElement).dropdown('set selected', value);
  }

  async loadLatestData() {
    const result = await this.api.getLatest();
    this.currentResults = result.songs;
    console.log(result);
  }

}
