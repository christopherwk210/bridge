import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowseComponent } from './components/browse/browse.component';
import { DownloadsComponent } from './components/downloads/downloads.component';
import { LibraryComponent } from './components/library/library.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AboutComponent } from './components/about/about.component';

const routes: Routes = [
  {
    component: BrowseComponent,
    path: ''
  },
  {
    component: DownloadsComponent,
    path: 'downloads'
  },
  {
    component: LibraryComponent,
    path: 'library'
  },
  {
    component: SettingsComponent,
    path: 'settings'
  },
  {
    component: AboutComponent,
    path: 'about'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
