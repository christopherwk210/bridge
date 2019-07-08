import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RemoteService } from '../../services/remote.service';
import { DownloadService } from '../../services/download.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  currentRoute = '';

  constructor(public router: Router, private remoteService: RemoteService, public downloadService: DownloadService) {
    router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.currentRoute = val.url.replace('/', '');
      }
    });
  }

  ngOnInit() {
  }

  minus() {
    this.remoteService.currentWindow.minimize();
  }

  plus() {
    this.remoteService.currentWindow.maximize();
  }

  x() {
    this.remoteService.remote.app.quit();
  }

}
