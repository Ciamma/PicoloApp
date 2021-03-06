import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { SettingsGameComponent } from './settings-game/settings-game.component';
import { TheGameComponent } from './the-game/the-game.component';

const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: 'config', component: SettingsGameComponent },
  { path: 'the-game', component: TheGameComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
