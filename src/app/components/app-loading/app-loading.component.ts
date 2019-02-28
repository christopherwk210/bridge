import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Vivus } from '../../shared/globals';

@Component({
  selector: 'app-app-loading',
  templateUrl: './app-loading.component.html',
  styleUrls: ['./app-loading.component.scss']
})
export class AppLoadingComponent implements AfterViewInit {
  @ViewChild('logo') logo: ElementRef;
  @Output() done: EventEmitter<boolean> = new EventEmitter();

  logoVivus: any;

  constructor() { }

  ngAfterViewInit() {
    this.logoVivus = new Vivus(
      this.logo.nativeElement, {
        duration: 120,
        animTimingFunction: Vivus.EASE
      },
      () => {
        this.done.emit(true);
      }
    );
  }

}
