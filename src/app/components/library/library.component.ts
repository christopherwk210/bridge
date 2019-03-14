import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { RemoteService } from '../../services/remote.service';

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

  constructor(public settingsService: SettingsService, private remoteService: RemoteService) { }

  ngOnInit() {
  }

  async scanLibrary() {
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

    console.log(charts);
  }

}
