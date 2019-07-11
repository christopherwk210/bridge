import { Component, OnInit, HostListener } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RemoteService } from '../../services/remote.service';
import { LibraryService } from '../../services/library.service';
import * as ini from 'ini';

interface SimpleResult {
  directory: boolean;
  name: string;
  path: string;
  dirname: string;
}

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  charts: any[];
  scanning = false;

  skip = 0;
  limit = 10;
  max = false;

  scrollBottomPadding = 50;
  canLoadScroll = true;

  constructor(public settingsService: SettingsService, private remoteService: RemoteService, private libraryService: LibraryService) {
    this.getNextSongBatch();
  }

  ngOnInit() {
  }

  @HostListener('scroll', ['$event'])
  handleScroll(e: Event) {
    const element = e.target as HTMLElement;
    if (!this.max && this.canLoadScroll && element.scrollTop + element.offsetHeight > element.scrollHeight - this.scrollBottomPadding) {
      this.canLoadScroll = false;
      this.getNextSongBatch().then(() => {
        this.canLoadScroll = true;
      });
    }
  }

  async getNextSongBatch() {
    const songs = await this.libraryService.getLibraryItems(this.skip, this.limit);

    if (songs.length === 0) return;

    if (songs.length < this.limit) {
      this.max = true;
    } else if (songs.length === this.limit) {
      this.skip += this.limit;
    }

    if (!this.charts) this.charts = [];

    this.charts.push(...songs);
  }

  async scanLibrary() {
    const shouldContinue = await new Promise(resolve => {
      this.remoteService.remote.dialog.showMessageBox(
        this.remoteService.currentWindow,
        {
          buttons: ['oh jeez take me back', 'yolo let\'s do iiit'],
          cancelId: 0,
          // tslint:disable-next-line: max-line-length
          message: 'WARNING: This is beta feature, and currently only serves to display your library. It may take some time to scan your library. Continue?',
          title: 'Hold up',
          type: 'question'
        },
        res => resolve(res === 1)
      );
    });

    if (!shouldContinue) return;
    this.scanning = true;

    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });

    const charts = {};

    // Step 1: File Scan
    const result = await this.remoteService.talkIPC('scan-complete', 'scan-library', this.settingsService.chartLibraryDirectory);
    const simpleResults: SimpleResult[] = result.args[0].simpleResults;

    // Step 2: Folder Organization
    for (const simpleResult of simpleResults) {
      if (!simpleResult.directory) {
        if (!charts[simpleResult.dirname]) charts[simpleResult.dirname] = [];
        charts[simpleResult.dirname].push(simpleResult.name);
      }
    }

    // Step 3: Parse songs
    const parsedData = [];
    for (const folder of Object.keys(charts)) {
      const files: string[] = charts[folder];
      if (files.includes('song.ini')) {
        const iniPath = this.remoteService.path.join(folder, 'song.ini');
        const iniData = await this.remoteService.readFile(iniPath, 'utf8');
        const parsedIniData = ini.parse(iniData);
        const pushData = parsedIniData['Song'] || parsedIniData['song'] || parsedIniData;

        pushData.localPath = folder;

        parsedData.push(pushData);
      }
    }

    // Step 4: Convert parsed result into song results and store
    for (const song of parsedData) {
      const songResult = {
        LOCALDATA: true,
        name: song['name'],
        album: song['album'],
        artist: song['artist'],
        charter: song['charter'],
        genre: song['genre'],
        length: song['length'],
        effectiveLength: song['effectiveLength'],
        year: song['year'],
        localPath: song.localPath
      };

      const addResult = await this.libraryService.addLibraryItem(songResult);
      if (!addResult) {
        console.log('Failed to add', songResult);
      }
    }

    this.getNextSongBatch();
    this.scanning = false;
  }

  openFolder(e) {
    this.remoteService.remote.shell.showItemInFolder(e.localPath);
  }

}
