import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, OnInit } from '@angular/core';
import { Vivus } from '../../shared/globals';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-app-loading',
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss']
})
export class AppLoadingComponent implements AfterViewInit, OnInit {
  @ViewChild('logo', { static: true }) logo: ElementRef;
  @Output() done: EventEmitter<boolean> = new EventEmitter();
  logoVivus: any;

  loadedAssetCount = 0;
  totalAssets = 2;

  constructor(private settingService: SettingsService) { }

  loadedAsset() {
    if (++this.loadedAssetCount === this.totalAssets) this.done.emit(true);
  }

  async ngOnInit() {
    await this.settingService.loadSettings();
    this.loadedAsset();
  }

  ngAfterViewInit() {
    this.logoVivus = new Vivus(
      this.logo.nativeElement, {
        duration: 120,
        animTimingFunction: Vivus.EASE
      },

      // Having the logo animation count as an item to load ensures
      // that the animation will complete every time before entry
      // is granted, in case the app loads before the animation is finished
      // (which is not likely for users with large libraries)
      () => setTimeout(() => this.loadedAsset(), 400)
    );
  }

}
