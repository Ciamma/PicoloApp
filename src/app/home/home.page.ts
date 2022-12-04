import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ModalRegoleComponent } from '../modal-regole/modal-regole.component';
import { PicolodbService } from '../services/picolodb.service';
import { Frase } from '../services/picolomodels';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  statusDB: string;
  updateAvailable: boolean;
  buttonDisabled: boolean;

  prova: Set<Frase>;
  constructor(private modalCtrl: ModalController, private db: PicolodbService, private router: Router) {
    this.statusDB = 'Caricamento...';
  }
  ngOnInit() {
    //this.upgradeDB();
    this.checkUpdate();
  }

  async ionViewWillEnter() {
    this.checkUpdate();
  }

  ionViewWillLeave() {
    this.updateAvailable = false;
  }

  goToPage() {
    this.router.navigate(['config']);
  }

  async rules() {
    const modal = await this.modalCtrl.create({
      component: ModalRegoleComponent,
      componentProps: {},
      breakpoints: [0.83, 1.0],
      initialBreakpoint: 0.83
    });
    await modal.present();
  }

  async checkUpdate() {
    this.updateAvailable = await this.db.checkStorage();  //per vedere se è il primo aggiornamento o i dati sono inconsistenti
    if (this.updateAvailable) {
      this.statusDB = "Aggiornamento necessario. Caricamento..."
      this.updateAvailable = false;
      await this.db.upgradeDB();
      this.statusDB = "Aggiornamento completato"
    }
    else {
      this.updateAvailable = await this.db.checkUpdate();
      console.log("update:", this.updateAvailable)
      if (this.updateAvailable)
        this.statusDB = "Aggiornamento disponibile"
      else
        this.statusDB = "Tutto ok"
      console.log("update:", this.updateAvailable)
    }
  }

  async updateDB() {
    this.buttonDisabled = true;
    await this.db.upgradeDB();
    this.buttonDisabled = false;
    this.updateAvailable = false;
    this.statusDB = "Aggiornamento completato"
  }


  // async upgradeDB() {
  //   await this.db.verifyDB();
  //   let status = await this.db.checkStorage();
  //   if (!status) {
  //     this.statusDB = 'Online';
  //   } else {
  //     this.statusDB = 'Locale';
  //   }
  // }
}