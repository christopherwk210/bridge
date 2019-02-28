import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { BrowseComponent } from './components/browse/browse.component';
import { ChartItemComponent } from './components/chart-item/chart-item.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    BrowseComponent,
    ChartItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
