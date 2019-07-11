import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {
  constructor(private remoteService: RemoteService) {}

  getLibraryItems(skip: number, limit: number): Promise<any[]> {
    return new Promise(resolve => {
      this.remoteService.talkIPC('library-get-items-response', 'library-get-items', skip, limit).then(res => {
        resolve(res.args[0]);
      });
    });
  }

  addLibraryItem(document): Promise<boolean> {
    return new Promise(resolve => {
      this.remoteService.talkIPC('library-add-item-response', 'library-add-item', document).then(res => {
        resolve(res.args[0]);
      });
    });
  }

  clearLibrary(): Promise<boolean> {
    return new Promise(resolve => {
      this.remoteService.talkIPC('library-clear-response', 'library-clear').then(res => {
        resolve(res.args[0]);
      });
    });
  }
}
