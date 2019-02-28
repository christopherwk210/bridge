import { Component, AfterViewInit } from '@angular/core';
import { RemoteService } from './services/remote.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  appLoading = true;
  hideLoader = false;

  constructor(private remoteService: RemoteService)  {
  }

  onLoad() {
    this.appLoading = false;
    setTimeout(() => this.hideLoader = true, 1200);
  }

  ngAfterViewInit() {
    this.remoteService.currentWindow.show();
  }
}
