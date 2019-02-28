import { Component, OnInit, Input } from '@angular/core';
import { SongResult } from '../../shared/interfaces/song-result.interface';

@Component({
  selector: 'app-chart-item',
  templateUrl: './chart-item.component.html',
  styleUrls: ['./chart-item.component.scss']
})
export class ChartItemComponent implements OnInit {
  @Input() mode: 'compact' | 'details' | 'grid';
  @Input() data: SongResult[];

  constructor() { }

  ngOnInit() {
  }

  formatSeconds(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;

    const prettySeconds = `0${seconds}`.slice(-2);

    return `${minutes}:${prettySeconds}`;
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    const prettyDate = date.toLocaleString('en-US');
    return prettyDate;
  }

  determineDifficulties(difficulty: number) {
    const result = [];

    if ((difficulty | 1) === difficulty) result.push('Easy');
    if ((difficulty | 2) === difficulty) result.push('Medium');
    if ((difficulty | 4) === difficulty) result.push('Hard');
    if ((difficulty | 8) === difficulty) result.push('Expert');

    return result;
  }
}
