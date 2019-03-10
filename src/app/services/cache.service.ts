import { Injectable } from '@angular/core';
import { RemoteService } from './remote.service';
import { SongResult } from '../shared/interfaces/song-result.interface';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  constructor(private remoteService: RemoteService) { }

  async saveSongsImagesToCache(songs: SongResult[]): Promise<SongResult[]> {
    const updatedSongs = await this.remoteService.talkIPC('cache-images-saved', 'cache-save-images', songs);
    return updatedSongs.args[0];
  }
}
