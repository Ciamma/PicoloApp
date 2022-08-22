import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-regole',
  templateUrl: './modal-regole.component.html',
  styleUrls: ['./modal-regole.component.scss'],
})
export class ModalRegoleComponent implements OnInit {

  listaRegole: string[];

  constructor() { }

  ngOnInit() {
    this.listaRegole = [];
    this.listaRegole.push(
      'non avrai altro narratore oltre Me',
      'ci si può ritirare quando si vuole(non ci si deve sentire male)',
      ' puoi usarmi quando vuoi(feste, celebrazioni,...)',
      'questo gioco è stato pensato per bere in armonia... Niente litigi',
      'uno shot equivale a due sorsi, ma qualora vogliate può essere anche più sorsi',
      "l'alchool è sacro e non si annacqua",
      "il gioco è stato creato per essere casuale, non ci sono ripicche verso alcun giocatore",
      'ogni scappatoia vale, ma deve essere approvata da tutti',
      'Non desiderare di non voler giocare mai più',
      'Divertitevi, ma non sentitevi male'
    )
  }

}
