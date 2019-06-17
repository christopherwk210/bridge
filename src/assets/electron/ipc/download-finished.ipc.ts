import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../shared/ipc-main-handler';
import { BrowserWindow } from 'electron';

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

// Asyncification
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);
const unlink = util.promisify(fs.unlink);

import { tempPath } from '../shared/paths';

@IpcMainHandler({
  event: 'download-finished'
})
export class DownloadFinished implements IpcMainHandlerClass {
  browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  /**
   * Wrapper for fs.access that resolves with the status as an inverted boolean
   */
  access(pathLike: fs.PathLike, mode: number) {
    return new Promise(resolve => {
      fs.access(pathLike, mode, error => {
        resolve(!error);
      });
    });
  }

  async action(event: IpcMessageEvent, data: any) {
    const tempFilePath = path.join(tempPath, data.remoteDownload.fileName);
    const destinationFolder = path.join(data.destination, `${data.remoteDownload.artist} - ${data.remoteDownload.song}`);
    const destinationFile = path.join(destinationFolder, data.remoteDownload.fileName);

    // Check if the destination folder exists
    const destinationFolderExists = await this.access(destinationFolder, fs.constants.F_OK);

    try {
      if (destinationFolderExists) {
        // Check if the destination file already exists somehow
        const destinationFileExists = await this.access(destinationFile, fs.constants.F_OK);

        // Short circuit if it does exist
        if (destinationFileExists) return this.browserWindow.webContents.send('transfer-failed', { data, msg: 'FILE_EXISTS' });
      } else {
        // Create the destination folder if it doesn't exists
        await mkdir(destinationFolder);
      }

      // Copy the file from the temporary directory to the destination
      await copyFile(tempFilePath, destinationFile);

      // Delete the file from the temporary directory
      await unlink(tempFilePath);

      this.browserWindow.webContents.send('transfer-completed', { data });
    } catch (error) {
      this.browserWindow.webContents.send('transfer-failed', { data });
    }
  }
}
