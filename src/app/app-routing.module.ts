import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowseComponent } from './components/browse/browse.component';

const routes: Routes = [
  {
    component: BrowseComponent,
    path: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
