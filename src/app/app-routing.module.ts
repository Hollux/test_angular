import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SoloGameComponent } from './features/solo_game/solo_game.component';
import { HomepageComponent } from './features/homepage/homepage.component';

const routes: Routes = [
  { path: 'soloparty', component: SoloGameComponent },
  { path: '', component: HomepageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
