import { Component, OnInit } from '@angular/core';
import { RemoteService } from 'src/app/services/remote.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  githubLink = 'https://github.com/christopherwk210/bridge';
  itchLink = 'https://topherlicious.itch.io/bridge';

  constructor(private remoteService: RemoteService) { }

  ngOnInit() {
  }

  toggleDevTools() {
    const toolsOpened = this.remoteService.currentWindow.webContents.isDevToolsOpened();

    if (toolsOpened) {
      this.remoteService.currentWindow.webContents.closeDevTools();
    } else {
      this.remoteService.currentWindow.webContents.openDevTools();
    }
  }

  openURL(url: string) {
    this.remoteService.remote.shell.openExternal(url);
  }
}
