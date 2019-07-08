import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RemoteService } from '../../services/remote.service';
import { SongResult } from '../../shared/interfaces/song-result.interface';
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

  constructor(public settingsService: SettingsService, private remoteService: RemoteService) {
    if (this.settingsService.chartLibraryScan) this.charts = this.settingsService.chartLibraryScan;
  }

  ngOnInit() {
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

    // Step 4: Convert parsed result into song results
    this.charts = parsedData.map(song => {
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

      return songResult;
    });

    // Save settings
    this.settingsService.chartLibraryScan = this.charts;

    this.scanning = false;
  }

  openFolder(e) {
    this.remoteService.remote.shell.showItemInFolder(e.localPath);
  }

}
