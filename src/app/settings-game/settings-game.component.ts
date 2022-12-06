import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-settings-game',
  templateUrl: './settings-game.component.html',
  styleUrls: ['./settings-game.component.scss'],
})
export class SettingsGameComponent implements OnInit {

  formUtente: FormGroup;
  listaGiocatori;
  difficolta: number;
  turni: number;
  drodraghi: boolean;
  TEST: boolean;

  constructor(private navCtrl: NavController, private form: FormBuilder, private platform: Platform, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    //console.log('qp: ', this.route.queryParams);
    this.TEST = false;
    this.formUtente = this.form.group({
      'giocatore': ["", [Validators.required, Validators.maxLength(15)]],
    });
    this.listaGiocatori = this.TEST ? ["Ricky", "Gigi", "Liuk"] : [];
    this.difficolta = this.TEST ? 2 : 1;
    this.drodraghi = this.TEST ? true : false;
    this.setNumeroTurni();
    //console.log(this.drodraghi);
    this.platform.backButton.subscribeWithPriority(9999, () => {
      this.listaGiocatori = [];
      this.navCtrl.navigateForward(['home']);
    });
  }

  async ionViewWillEnter() {
    if (this.route.snapshot.queryParams["giocatori"]) {
      this.route.queryParams.subscribe(params => {
        console.log('params settings: ', params["giocatori"]);
        this.listaGiocatori = [...params["giocatori"]];
      });
    }
    this.platform.backButton.subscribeWithPriority(9999, () => {
      this.listaGiocatori = [];
      this.navCtrl.navigateForward(['home']);
    });
  }

  async ionViewWillLeave() {
  }

  goToPage() {
    this.setNumeroTurni();
    //console.log(this.turni);
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

  nomeMaiuscolo(nome: string) {
    return nome.charAt(0).toUpperCase() + nome.slice(1);
  }

  modalitaDrodraga() {
    this.drodraghi = this.drodraghi ? true : false;
    // this.difficolta = 2;
    //console.log("drodraghi: ", this.drodraghi);
  }

  addGiocatore() {
    let giocatore = this.formUtente.get('giocatore').value;
    if (this.stringaValida(giocatore))
      this.listaGiocatori.push(this.nomeMaiuscolo(giocatore));
    this.formUtente.get('giocatore').reset();
  }

  deleteGiocatore(i: String) {
    this.listaGiocatori = this.listaGiocatori.filter(p => p != i);
  }

  aggiornaDifficolta(aggiorna) {
    this.difficolta = aggiorna.detail.value;
    //console.log(this.difficolta);
  }

  setNumeroTurni() {
    if (this.drodraghi)
      this.turni = 5000;
    else {
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

}
