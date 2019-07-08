import { Injectable } from '@angular/core';
import * as electron from 'electron';
import * as nodefs from 'fs';
import * as nodepath from 'path';
import * as nodeutil from 'util';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {
  electron: typeof electron;
  remote: typeof electron.remote;
  ipcRenderer: typeof electron.ipcRenderer;
  fs: typeof nodefs;
  path: typeof nodepath;
  util: typeof nodeutil;

  constructor() {
    this.electron = this.require('electron');
    this.remote = this.electron.remote;
    this.ipcRenderer = this.electron.ipcRenderer;
    this.fs = this.require('fs');
    this.path = this.require('path');
    this.util = this.require('util');

    this.util.promisify(this.fs.readFile);
  }

  get currentWindow() {
    return this.remote.getCurrentWindow();
  }

  require(content: string) {
    // tslint:disable-next-line
    return eval(`nodeRequire('${content}')`);
  }

  sendIPC(channel: string, ...args: any[]) {
    this.ipcRenderer.send(channel, ...args);
  }

  sendIPCSync(channel: string, ...args: any[]): any {
    return this.ipcRenderer.sendSync(channel, ...args);
  }

  talkIPC(responseChannel: string, sendChannel: string, ...args: any[]): Promise<{ event: electron.IpcMessageEvent, args: any[] }> {
    return new Promise(resolve => {
      this.ipcRenderer.once(responseChannel, (e: electron.IpcMessageEvent, ...responseArgs: any[]) => {
        resolve({
          event: e,
          args: responseArgs
        });
      });

      this.sendIPC(sendChannel, args);
    });
  }

  /**
   * Async wrapper for showOpenDialog
   */
  showOpenDialog(options: electron.OpenDialogOptions): Promise<string[]> {
    return new Promise(resolve => {
      this.remote.dialog.showOpenDialog(this.currentWindow, options, (paths) => {
        resolve( paths );
      });
    });
  }

  get readFile() {
    return this.util.promisify(this.fs.readFile);
  }
}
