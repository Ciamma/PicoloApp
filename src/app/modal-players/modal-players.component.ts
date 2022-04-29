import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-players',
  templateUrl: './modal-players.component.html',
  styleUrls: ['./modal-players.component.scss'],
})
export class ModalPlayersComponent implements OnInit {

  listaGiocatori;
  turni;
  difficolta: number;
  formUtente: FormGroup;

  constructor(private form: FormBuilder, private modalCtrl: ModalController) { }

  ngOnInit() {
    this.difficolta = this.turni / this.listaGiocatori.length;
    this.formUtente = this.form.group({
      'giocatore': ["", [Validators.required, Validators.maxLength(15)]],
    });
  }

  dismissModal() {
    this.modalCtrl.dismiss(this.listaGiocatori);
  }

  stringaValida(s: String): boolean {
    return s !== undefined || s !== ' ';
  }

  addGiocatore() {
    let giocatore = this.formUtente.get('giocatore').value;
    // console.log(giocatore);
    if (this.stringaValida(giocatore))
      this.listaGiocatori.add(giocatore);
    // console.log(this.listaGiocatori);
    this.formUtente.get('giocatore').reset();
  }

  deleteGiocatore(i: String) {
    this.listaGiocatori = this.listaGiocatori.filter(p => p != i);
    console.log("dopo eliminazione: ", this.listaGiocatori);
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
