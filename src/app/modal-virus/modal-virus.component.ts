import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-virus',
  templateUrl: './modal-virus.component.html',
  styleUrls: ['./modal-virus.component.scss'],
})
export class ModalVirusComponent implements OnInit {

  virusDaMostrare;

  constructor(private modalCtrl: ModalController) {
    //console.log('listaVirus dal game: ' + this.virusDaMostrare);
  }

  ngOnInit() {
  }

  isEmpty(): boolean {
    return this.virusDaMostrare.length === 0;
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

}
