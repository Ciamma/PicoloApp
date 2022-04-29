import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePage } from './home/home.page';
import { ModalPlayersComponent } from './modal-players/modal-players.component';
import { ModalTimerComponent } from './modal-timer/modal-timer.component';
import { ModalVirusComponent } from './modal-virus/modal-virus.component';
import { PicolodbService } from './services/picolodb.service';
import { SettingsGameComponent } from './settings-game/settings-game.component';
import { TheGameComponent } from './the-game/the-game.component';



@NgModule({
  declarations: [AppComponent, HomePage, SettingsGameComponent, TheGameComponent, ModalPlayersComponent, ModalVirusComponent, ModalTimerComponent],
  entryComponents: [],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, PicolodbService],
  bootstrap: [AppComponent],
})
export class AppModule {}
