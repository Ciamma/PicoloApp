import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-settings-game',
  templateUrl: './settings-game.component.html',
  styleUrls: ['./settings-game.component.scss'],
})
export class SettingsGameComponent implements OnInit {

  formUtente: FormGroup;
  listaGiocatori;
  difficolta: number;
  turni: number = 10;
  drodraghi: boolean;
  constructor(private navCtrl: NavController, private form: FormBuilder) {
  }

  ngOnInit(): void {
    this.formUtente = this.form.group({
      'giocatore': ["", [Validators.required, Validators.maxLength(15)]],
    });
    this.listaGiocatori = ['Gigi', 'Liuk', "Ricky"];
    this.difficolta = 1;
    this.turni = 10;
    this.drodraghi = false;
  }

  goToPage() {
    if (!this.drodraghi) {
      this.setNumeroTurni();
    }

    let navigationExtras: NavigationExtras = {
      queryParams: {
        giocatori: this.listaGiocatori,
        turni: this.turni,
        liv: this.difficolta
      }
    }
    this.navCtrl.navigateForward(['the-game'], navigationExtras);
  }

  stringaValida(s: String): boolean {
    return s !== undefined || s !== ' ';
  }

  modalitaDrodraga() {
    this.drodraghi = !this.drodraghi;
    this.turni = 3000;
  }

  addGiocatore() {
    let giocatore = this.formUtente.get('giocatore').value;
    if (this.stringaValida(giocatore))
      this.listaGiocatori.push(giocatore);
    this.formUtente.get('giocatore').reset();
  }

  deleteGiocatore(i: String) {
    this.listaGiocatori = this.listaGiocatori.filter(p => p != i);
  }

  aggiornaDifficolta(aggiorna) {
    this.difficolta = aggiorna.detail.value;
    console.log(this.difficolta);
  }

  setNumeroTurni() {
    switch (this.difficolta) {
      case 1:
        this.turni = this.listaGiocatori.length * 5;
        break;
      case 2:
        this.turni = this.listaGiocatori.length * 8;
        break;
      case 3:
        this.turni = this.listaGiocatori.length * 10;
      default:
        break;
    }
  }

}
