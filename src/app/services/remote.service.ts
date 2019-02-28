import { Injectable } from '@angular/core';
import { remote } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {
  remote: typeof remote;

  constructor() {
    this.remote = this.require('electron').remote;
  }

  require(content: string) {
    // tslint:disable-next-line
    return eval(`nodeRequire('${content}')`);
  }

  get currentWindow() {
    return this.remote.getCurrentWindow();
  }
}
