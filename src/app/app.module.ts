import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';
import { RemoteService } from './services/remote.service';
import { SettingsService } from './services/settings.service';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { BrowseComponent } from './components/browse/browse.component';
import { ChartItemComponent } from './components/chart-item/chart-item.component';
import { AppLoadingComponent } from './components/app-loading/app-loading.component';
import { DownloadsComponent } from './components/downloads/downloads.component';
import { LibraryComponent } from './components/library/library.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    BrowseComponent,
    ChartItemComponent,
    AppLoadingComponent,
    DownloadsComponent,
    LibraryComponent,
    SettingsComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    ApiService,
    RemoteService,
    SettingsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
