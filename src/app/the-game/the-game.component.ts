import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { ModalPlayersComponent } from '../modal-players/modal-players.component';
import { ModalTimerComponent } from '../modal-timer/modal-timer.component';
import { ModalVirusComponent } from '../modal-virus/modal-virus.component';
import { PicolodbService } from '../services/picolodb.service';
import { Frase, Quality, Sips, Virus } from '../services/picolomodels';
import { checkSets, frasiFiltrateNumeroGiocatori, intersecate, randomizer, randomTurno } from '../services/picoloutils';

@Component({
  selector: 'app-the-game',
  templateUrl: './the-game.component.html',
  styleUrls: ['./the-game.component.scss'],
})
export class TheGameComponent implements OnInit {

  frasi_tot: Set<Frase>; // tutte le frasi possibili
  frasiFatte: Set<Frase>;  // frasi fatte durante una sessione di gioco
  virusFatti: Set<Virus>; // virus fatti durante una sessione di gioco
  virus_tot: Set<Virus>; // tutti i virus
  listaVirus: Map<Number, Set<Virus>>;  // lista dei virus in corso.
  virusTurni: Set<number>; // lista dei turni in cui si verificheranno virus
  qualita: Quality[];
  qualitaUsate: Map<String, Set<String>>;  // qualità usate durante una sessione di gioco
  listaGiocatori: Set<string>;  // lista dei giocatori che partecipano
  maledizioniConcluse: String[];  // permette di visualizzare le maledizioni concluse(array di appoggio)
  tipoFrase: String;  //il tipo della frase
  frase: String;  // frase che viene stampata
  turni: number;  //i turni che sono stati definiti nel setup
  turnoCorrente: number; //il turno corrente
  difficolta: number; // difficoltà gioco
  sips: Set<Sips>; // lista dei sorsi
  TEST: number;  /* indica il livello di cose da printare: 
                        0-nulla
                        1- minimo(turno,frase)
                        2- medio(turno, frase, sostituzioni, virus conclusi, virus in corso)
                        3- massimo(turno, frase, virus conclusi, virus in corso, parole sostituite, liste e insiemi) */


  constructor(private navCtrl: NavController, private modalCtrl: ModalController, private toast: ToastController,
    private route: ActivatedRoute, private db: PicolodbService) {
    this.route.queryParams.subscribe(params => {
      this.listaGiocatori = new Set(params["giocatori"]);
      this.turni = JSON.parse(params["turni"]);
      this.difficolta = params["liv"];
    });
    this.frasi_tot = this.frasiFatte = new Set<Frase>();
    this.virus_tot = this.virusFatti = new Set<Virus>();
    this.listaVirus = new Map<Number, Set<Virus>>();
    this.virusTurni = new Set<number>();
    this.qualita = [];
    this.qualitaUsate = new Map<String, Set<String>>();
    this.sips = new Set<Sips>();
    this.TEST = 0;
    this.setSips(this.difficolta);
  }

  ngOnInit() {
    this.maledizioniConcluse = [];
    let virusPossibili = Math.round(this.turni / 100) * 20;
    for (let i = 0; i <= virusPossibili; i++) {
      this.virusTurni.add(randomizer(this.turni));
    }
    this.TEST > 2 ? console.log("Turni in cui compariranno i virus: ", Array.from(this.virusTurni).sort((n1, n2) => n1 - n2)) : null;
    this.turnoCorrente = 1;
    this.primoTurno();
  }

  async ionViewWillEnter() {
    let status = await this.db.checkStorage();
    if (!status) {
      this.frasi_tot = await this.db.getFrasiStorage();
      this.virus_tot = await this.db.getVirusStorage();
      this.qualita = await this.db.getQualitaStorage();
    } else {
      this.frasi_tot = await this.db.getFrasiFromAsset();
      this.virus_tot = await this.db.getVirusFromAsset();
      this.qualita = await this.db.getQualitaFromAsset();
    }
    if (this.listaGiocatori.size < 3)
      frasiFiltrateNumeroGiocatori(this.frasi_tot);
    this.TEST > 2 ? console.log("Da JSON - lista frasi: ", this.frasi_tot, ", lista virus: ", this.listaVirus, ", lista qualità: ", this.qualita) : null;
    this.setSips(this.difficolta);
    this.turnoCorrente = 1;
  }

  ionViewWillLeave() {
    this.sips.clear();
    this.turnoCorrente = 0;
  }

  setSips(livello: number) {
    if (livello == 1) {
      this.sips.add(new Sips("micro_sorsi", [1, 2]));
      this.sips.add(new Sips("sorsi", [2, 3, 4]));
      this.sips.add(new Sips("super_sorsi", [3, 4]));
    } else if (livello == 2) {
      this.sips.add(new Sips("micro_sorsi", [1, 2]));
      this.sips.add(new Sips("sorsi", [2, 3, 4]));
      this.sips.add(new Sips("super_sorsi", [5, 6, 7]));
    } else if (livello == 3) {
      this.sips.add(new Sips("micro_sorsi", [2, 3]));
      this.sips.add(new Sips("sorsi", [3, 4]));
      this.sips.add(new Sips("super_sorsi", [5, 6, 7]));
    }
    this.TEST > 2 ? console.log("lista sorsi: ", this.sips) : null;
  }

  findWord(tipo: string, doppioni?: Set<String>): string {
    if (tipo.includes("giocatore")) {
      let listaPlayerPescabile = Array.from(this.listaGiocatori).filter(p => !doppioni.has(p));
      return listaPlayerPescabile[randomizer(listaPlayerPescabile.length)];
    }
    else {  // devo sostituire una qualità
      let qualitaPescabii = [];
      let qualita = this.qualita.filter(q => q.nome === tipo);
      this.TEST > 1 ? console.log("lista qualità da sostituire: ", qualita) : null;
      if (qualita.length === 0)
        return "";
      if (this.qualitaUsate[tipo].size > 0) { // devo filtrare la lista con i doppioni già usati
        qualitaPescabii = qualita[0].listQ.filter(q => !this.qualitaUsate[tipo].has(q));
        this.TEST > 2 ? console.log("lista qualità da sostituire dopo filtraggio: ", qualitaPescabii) : null;
      } else {
        qualitaPescabii = qualita[0].listQ;
        this.TEST > 2 ? console.log("prima volta che scelgo un elemento di questa qualità") : null;
      }
      return qualitaPescabii[randomizer(qualitaPescabii.length)];
    }
  }

  configureSips(tipo: String): string {
    let type = Array.from(this.sips).filter(p => p.tipo == tipo);
    let sorsiPossibili = type[0].listaSorsi;
    return String(sorsiPossibili[randomizer(sorsiPossibili.length)]);
  }

  substitute(frase: String, frase_f?: String) {
    this.TEST > 0 ? console.log("frase senza sostituzioni: ", frase) : null;
    let giocatoriScelti = new Set<String>();
    const regex = /\{(.*?)\}/g;
    let cont = new Set(frase.match(regex));
    let change = "";
    while (cont.size > 0) {
      cont.forEach(sub => {
        cont.delete(sub);
        let subb = sub.replace("{", "").replace("}", "").trim();
        if (subb.includes("parola"))
          subb = "parola";
        this.TEST > 1 ? console.log("qualità da cambiare: ", subb) : null;
        if (sub.includes("giocatore")) {
          change = this.findWord(subb, giocatoriScelti);
          this.TEST > 1 ? console.log("giocatore scelto: ", change) : null;
          if (giocatoriScelti.size == this.listaGiocatori.size)
            giocatoriScelti.clear();
          giocatoriScelti.add(change);
          frase = frase.replace(sub, change);
          if (frase_f != undefined && frase_f.includes(sub))
            frase_f = frase_f.replace(sub, change);
        }
        else if (sub.includes("sorsi")) {
          change = this.configureSips(subb);
          this.TEST > 1 ? console.log("sorsi scelto: ", change) : null;
          frase = frase.replace(sub, String(change));
          if (change === "1")
            frase = frase.replace("sorsi", "sorso");
        } else {
          if (subb in this.qualitaUsate === false) {
            this.TEST > 2 ? console.log("qualità mai usata") : null;
            this.qualitaUsate[subb] = new Set<String>();
          }
          change = this.findWord(subb);
          this.TEST > 1 ? console.log("qualita scelta: ", change) : null;
          this.qualitaUsate[subb].add(change);
          if (this.qualitaUsate[subb].size === this.qualita.filter(q => q.nome === subb)[0].listQ.length)
            this.qualitaUsate[subb].clear();
          this.TEST > 2 ? console.log("qualità totali: ", this.qualita, ", lista qualità cercata: ", this.qualitaUsate[subb]) : null;
          frase = frase.replace(sub, change);
          if (frase_f != undefined && frase_f.includes(sub))
            frase_f = frase_f.replace(sub, change);
        }
      });
      cont = new Set(frase.match(regex));
    }
    if (frase_f != undefined)
      this.setVirus(frase, frase_f);
    this.TEST > 0 ? console.log("frase printata: ", frase) : null;
    return frase;
  }

  setVirus(frase: String, frase_f: String) {
    let turniVirus = randomTurno(this.turnoCorrente, this.turni);
    if (!Object.values(this.listaVirus).includes(turniVirus))
      this.listaVirus[turniVirus] = new Set<Virus>();
    let v: Virus = new Virus(frase, frase_f);
    this.listaVirus[turniVirus].add(v);
    this.TEST > 2 ? console.log("lista virus aggiornata: ", this.listaVirus) : null;
  }

  virusConclusi() {
    if (this.turnoCorrente in this.listaVirus) {
      let listaVirus = this.listaVirus[this.turnoCorrente];
      this.TEST > 2 ? console.log("listavirus: ", listaVirus) : null;
      listaVirus.forEach(v => {
        this.maledizioniConcluse.push(v.virus_f);
        this.listaVirus[this.turnoCorrente].delete(v);
      });
    }
    this.TEST > 0 ? console.log("virus conclusi in questo turno: ", this.maledizioniConcluse) : null;
  }

  chooseFrase(virus?: boolean) {
    this.TEST > 2 ? console.log("listaVirus: ", this.listaVirus) : null;
    let lista_virus = intersecate(this.virus_tot, this.virusFatti);
    let lista_frasi = intersecate(this.frasi_tot, this.frasiFatte);
    this.TEST > 2 ? console.log("virus_tot: ", this.virus_tot, ", virusFatti: ", this.virusFatti, ", lista_virus: ", lista_virus) : null;
    this.TEST > 2 ? console.log("frasi_tot: ", this.frasi_tot, ", frasiFatte: ", this.frasiFatte, ", lista_frasi: ", lista_frasi) : null;
    if (virus && this.viewAllVirus().length < 4) {
      let casual = randomizer(lista_virus.size);
      this.virusFatti.add(Array.from(lista_virus)[casual]);
      this.TEST > 2 ? console.log("lista virus fatti: ", this.virusFatti) : null;
      this.frase = this.substitute(Array.from(lista_virus)[casual].virus, Array.from(lista_virus)[casual].virus_f);
      this.tipoFrase = "virus";
    } else {
      let casual = randomizer(lista_frasi.size);
      this.frasiFatte.add(Array.from(lista_frasi)[casual]);
      this.TEST > 2 ? console.log("lista frasi fatte: ", this.frasiFatte) : null;
      this.frase = this.substitute(Array.from(lista_frasi)[casual].frase);
      this.tipoFrase = Array.from(lista_frasi)[casual].tag;
    }
    checkSets(this.frasi_tot, this.frasiFatte);
    checkSets(this.virus_tot, this.virusFatti);
    this.virusConclusi();
    this.changeBackground();
  }

  changeBackground() {
    if (this.tipoFrase.includes("random") || this.tipoFrase.includes("games"))
      return "simple";
    else if (this.tipoFrase.includes("sfide"))
      return "danger";
    else if (this.tipoFrase.includes("virus"))
      return "virus";
    else
      return "benvenuto";
  }

  primoTurno() {
    this.tipoFrase = "benvenuto";
    this.frase = this.substitute('Benvenuti giocatori, per cominciare alla grande brindiamo alla vostra... Alla salute!!');
  }

  newTurn() {
    this.TEST > 0 ? console.log("--------------------------------------------------") : null;
    this.TEST > 0 ? console.log('turno corrente: ' + this.turnoCorrente) : null;
    this.maledizioniConcluse = [];
    if (this.turnoCorrente < this.turni) {
      if (this.virusTurni.has(this.turnoCorrente)) {
        this.chooseFrase(true);
      } else {
        this.chooseFrase();
      }
      this.turnoCorrente += 1;
    } else if (this.turnoCorrente === this.turni) {
      this.TEST > 0 ? console.log("fine partita") : null;
      this.frase = "That's All Folks. Alla Prossima";
      this.tipoFrase = "benvenuto";
      this.turnoCorrente += 1;
    } else {
      this.TEST > 2 ? console.log("torno alle impostazioni") : null;
      let navigationExtras: NavigationExtras = {
        queryParams: {
          giocatori: this.listaGiocatori,
        }
      }
      this.turnoCorrente = 0;
      this.navCtrl.navigateForward(['config'], navigationExtras);
    }
  }

  viewAllVirus(): String[] {
    let virusDaMostrare = [];
    Object.values(this.listaVirus).forEach(l => { l.forEach(v => virusDaMostrare.push(v.virus)) });
    this.TEST > 2 ? console.log('lista che passo alla modale-virus: ', virusDaMostrare) : null;
    return virusDaMostrare;
  }

  async modal(mod: String) {
    const modal = await this.modalCtrl.create({
      component: (mod === "virus" ? ModalVirusComponent : ModalPlayersComponent),
      componentProps: {
        listaGiocatori: (mod === "virus" ? undefined : this.listaGiocatori),
        turni: (mod === "virus" ? undefined : this.turni),
        virusDaMostrare: (mod === "virus" ? this.viewAllVirus() : undefined),
      },
      breakpoints: (mod === "virus" ? [0.3, 0.5, 0.8] : undefined),
      initialBreakpoint: (mod === 'virus' ? 0.3 : 1)
    });
    if (mod === 'virus') { }
    else {
      modal.onDidDismiss()
        .then((data) => {
          this.listaGiocatori = data['data'];
        });
    }
    await modal.present();
  }

  async timer() {
    const modal = await this.modalCtrl.create({
      component: ModalTimerComponent,
      componentProps: {},
      breakpoints: [0.4, 0.5, 0.8],
      initialBreakpoint: 0.8
    });
    await modal.present();
  }
}
