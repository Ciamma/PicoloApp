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

  nomeMaiuscolo(nome: string) {
    return nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
  }

  addGiocatore() {
    let giocatore = this.formUtente.get('giocatore').value;
    if (this.stringaValida(giocatore))
      this.listaGiocatori.add(this.nomeMaiuscolo(giocatore));
    this.formUtente.get('giocatore').reset();
  }

  deleteGiocatore(i: String) {
    this.listaGiocatori.delete(i);
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
