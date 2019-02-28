import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  currentRoute = '';

  constructor(public router: Router) {
    router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.currentRoute = val.url.replace('/', '');
      }
    });
  }

  ngOnInit() {
  }

}
