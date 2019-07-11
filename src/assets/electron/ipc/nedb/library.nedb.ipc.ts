import { BrowserWindow } from 'electron';
import { IpcMainHandler, IpcMainHandlerClass, IpcMessageEvent } from '../../shared/ipc-main-handler';
import { libraryStore } from '../../nedb';

@IpcMainHandler({
  event: 'library-get-items'
})
export class LibraryGetItems implements IpcMainHandlerClass {
  browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  async action(event: IpcMessageEvent, data) {
    const result = await this.getLibraryItems(data[0], data[1]);
    this.browserWindow.webContents.send('library-get-items-response', result);
  }

  getLibraryItems(skip: number, limit: number): Promise<any[]> {
    return new Promise(resolve => {
      libraryStore.find({}).skip(skip).limit(limit).exec((err, docs) => {
        if (err) {
          console.log(err);
          resolve(null);
        } else {
          resolve(docs);
        }
      });
    });
  }
}

@IpcMainHandler({
  event: 'library-add-item'
})
export class LibraryAddItem implements IpcMainHandlerClass {
  browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  async action(event: IpcMessageEvent, data) {
    const result = await this.addLibraryItem(data[0]);
    this.browserWindow.webContents.send('library-add-item-response', result);
  }

  addLibraryItem(doc): Promise<boolean> {
    return new Promise(resolve => {
      libraryStore.insert(doc, err => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

@IpcMainHandler({
  event: 'library-clear'
})
export class LibraryClear implements IpcMainHandlerClass {
  browserWindow: BrowserWindow;

  constructor(browserWindow: BrowserWindow) {
    this.browserWindow = browserWindow;
  }

  async action(event: IpcMessageEvent, data) {
    const result = await this.clearLibrary();
    this.browserWindow.webContents.send('library-clear-response', result);
  }

  clearLibrary(): Promise<boolean> {
    return new Promise(resolve => {
      libraryStore.remove({}, { multi: true }, err => {
        if (err) {
          console.log(err);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
