import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { ModalPlayersComponent } from '../modal-players/modal-players.component';
import { ModalTimerComponent } from '../modal-timer/modal-timer.component';
import { ModalVirusComponent } from '../modal-virus/modal-virus.component';
import { PicolodbService } from '../services/picolodb.service';
import { Frase, Quality, Sips, Virus } from '../services/picolomodels';
import { checkSets, intersecate, randomizer, randomTurno } from '../services/picoloutils';

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
  }

  ngOnInit() {
    this.frasi_tot = this.db.getFrasi();
    this.virus_tot = this.db.getVirus();
    this.qualita = this.db.getQualita();
    this.setSips(this.difficolta);
    this.maledizioniConcluse = []; // ['Gigi non è più il re dei pollici', 'Cabbo non soffre più della sindrome di Tourette'];
    let virusPossibili = Math.round(this.turni / 100) * 20;
    for (let i = 0; i <= virusPossibili; i++) {
      this.virusTurni.add(randomizer(this.turni));
    }
    console.log(Array.from(this.virusTurni).sort((n1, n2) => n1 - n2));
    this.listaVirus[4] = new Set<Virus>();
    this.listaVirus[4].add(new Virus("sono un virus", "sono un virus concluso"));
    this.turnoCorrente = 1;
    this.primoTurno();
  }

  ionViewWillEnter() {
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
      // console.log(this.sips);
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
  }

  findWord(tipo: string, doppioni?: Set<String>): string {
    if (tipo.includes("giocatore")) {
      let listaPlayerPescabile = Array.from(this.listaGiocatori).filter(p => !doppioni.has(p));
      return listaPlayerPescabile[randomizer(listaPlayerPescabile.length)];
    }
    else {  // devo sostituire una qualità
      let qualitaPescabii = [];
      let qualita = this.qualita.filter(q => q.nome === tipo);
      //console.log("qualita: ", qualita);
      if (qualita.length === 0)
        return "";
      if (this.qualitaUsate[tipo].size > 0) { // devo filtrare la lista con i doppioni già usati
        qualitaPescabii = qualita[0].listQ.filter(q => !this.qualitaUsate.get(tipo).has(q));
      } else {
        qualitaPescabii = qualita[0].listQ;
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
    console.log(frase);
    let giocatoriScelti = new Set<String>();
    const regex = /\{(.*?)\}/g;
    const cont = new Set(frase.match(regex));
    let change = "";
    while (cont.size > 0) {
      cont.forEach(sub => {
        cont.delete(sub);
        let subb = sub.replace("{", "").replace("}", "").trim();
        //console.log("da cambiare: ", subb);
        if (sub.includes("giocatore")) {
          change = this.findWord(subb, giocatoriScelti);
          // console.log("giocatore scelto: ", change);
          if (giocatoriScelti.size == this.listaGiocatori.size)
            giocatoriScelti.clear();
          giocatoriScelti.add(change);
          frase = frase.replace(sub, change);
          if (frase_f != undefined && frase_f.includes(sub))
            frase_f = frase_f.replace(sub, change);
        }
        else if (sub.includes("sorsi")) {
          change = this.configureSips(subb);
          // console.log("sorsi scelto: ", change);
          frase = frase.replace(sub, String(change));
          if (frase_f != undefined && frase_f.includes(sub))
            frase_f = frase_f.replace(sub, change);
        } else {
          //let qualitaCercata = this.qualita.filter(q => q.nome === subb)[0].listQ;
          if (this.qualitaUsate.get(subb) == undefined)
            this.qualitaUsate[subb] = new Set<String>();
          change = this.findWord(subb);
          //console.log("qualita scelta: ", change);
          frase = frase.replace(sub, change);
          if (frase_f != undefined && frase_f.includes(sub))
            frase_f = frase_f.replace(sub, change);
          //console.log("qualità totali: ", this.qualita, ", qualità cercata: ", qualitaCercata);

        }
      });
    }
    if (frase_f != undefined)
      this.setVirus(frase, frase_f);
    return frase;
  }

  setVirus(frase: String, frase_f: String) {
    let turniVirus = randomTurno(this.turnoCorrente, this.turni);
    if (!Object.values(this.listaVirus).includes(turniVirus))
      this.listaVirus[turniVirus] = new Set<Virus>();
    let v: Virus = new Virus(frase, frase_f);
    this.listaVirus[turniVirus].add(v);
    console.log(this.listaVirus);
  }

  virusConclusi() {
    if (this.turnoCorrente in this.listaVirus) {
      let listaVirus = this.listaVirus[this.turnoCorrente];
      //console.log("listavirus: ", listaVirus);
      listaVirus.forEach(v => {
        this.maledizioniConcluse.push(v.virus_f);
        this.listaVirus[this.turnoCorrente].delete(v);
      });
    }
  }

  chooseFrase(virus?: boolean) {
    // console.log("listaVirus: ", this.listaVirus);
    let lista_virus = intersecate(this.virus_tot, this.virusFatti);
    let lista_frasi = intersecate(this.frasi_tot, this.frasiFatte);
    //console.log("virus_tot: ", this.virus_tot, ", virusFatti: ", this.virusFatti, ", lista_virus: ", lista_virus);
    //console.log("frasi_tot: ", this.frasi_tot, ", frasiFatte: ", this.frasiFatte, ", lista_frasi: ", lista_frasi);
    if (virus && this.viewAllVirus().length < 4) {
      let casual = randomizer(lista_virus.size);
      this.virusFatti.add(Array.from(lista_virus)[casual]);
      //console.log("virus fatti: ", this.virusFatti);
      this.frase = this.substitute(Array.from(lista_virus)[casual].virus, Array.from(lista_virus)[casual].virus_f);
      this.tipoFrase = "virus";
    } else {
      let casual = randomizer(lista_frasi.size);
      this.frasiFatte.add(Array.from(lista_frasi)[casual]);
      //console.log("frasi fatte: ", this.frasiFatte);
      this.frase = this.substitute(Array.from(lista_frasi)[casual].frase);
      this.tipoFrase = Array.from(lista_frasi)[casual].tag;
    }
    checkSets(this.frasi_tot, this.frasiFatte);
    checkSets(this.virus_tot, this.virusFatti);
    this.virusConclusi();
    //console.log("virus conclusi in questo turno: ", this.maledizioniConcluse);
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
    console.log("--------------------------------------------------");
    console.log('turno corrente: ' + this.turnoCorrente)
    this.maledizioniConcluse = [];
    if (this.turnoCorrente < this.turni) {
      if (this.virusTurni.has(this.turnoCorrente)) {
        this.chooseFrase(true);
      } else {
        this.chooseFrase();
      }
      this.turnoCorrente += 1;
    } else if (this.turnoCorrente === this.turni) {
      this.frase = "That's All Falks. Alla Prossima";
      this.tipoFrase = "benvenuto";
      this.turnoCorrente += 1;
    } else {
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
    //console.log('lista che passo alla modale: ', virusDaMostrare);
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
      breakpoints: (mod === "virus" ? [0, 0.3, 0.5, 0.8] : undefined),
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
      breakpoints: [0, 0.5, 0.8],
      initialBreakpoint: 0.5
    });
    await modal.present();
  }

  async toastCreate() {
    await this.toast.create({
      message: 'Song deleted', //message
      duration: 2500  //durata
    });
    //da aggiungere il present
  }
}
