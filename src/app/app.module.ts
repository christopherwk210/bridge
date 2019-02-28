import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { ApiService } from './services/api.service';
import { RemoteService } from './services/remote.service';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { BrowseComponent } from './components/browse/browse.component';
import { ChartItemComponent } from './components/chart-item/chart-item.component';
import { AppLoadingComponent } from './components/app-loading/app-loading.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    BrowseComponent,
    ChartItemComponent,
    AppLoadingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    ApiService,
    RemoteService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
