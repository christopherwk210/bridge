import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SongResult } from '../../shared/interfaces/song-result.interface';
import { SortType, sortTypeReadable } from '../../shared/sort-type';

import $ from '../../shared/jQuery';

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

  loading = true;
  currentResults: SongResult[];
  viewMode: 'details' | 'grid' | 'compact' = 'details';

  sortType: SortType = SortType.NEWEST;
  sortTypeReadable = sortTypeReadable;

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
      this.uiRandomBtn.nativeElement,
      this.uiNewestBtn.nativeElement
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
