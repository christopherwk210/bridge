import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SongResult } from 'src/app/interfaces/song-result.interface';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {
  currentResults: SongResult[];
  viewMode: 'details' | 'grid' = 'details';

  constructor(private api: ApiService) {

  }

  ngOnInit() {
    this.loadLatestData();
  }

  async loadLatestData() {
    const result = await this.api.getLatest();
    this.currentResults = result.songs;
    console.log(result);
  }

}
