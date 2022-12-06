import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController, ToastController, Platform } from '@ionic/angular';
import { ModalPlayersComponent } from '../modal-players/modal-players.component';
import { ModalTimerComponent } from '../modal-timer/modal-timer.component';
import { ModalVirusComponent } from '../modal-virus/modal-virus.component';
import { PicolodbService } from '../services/picolodb.service';
import { Frase, Sips, Virus, Listone, ListaQualita, ListaGiocatori } from '../services/picolomodels';
import { raffinaCategoria, randomizer, randomTurno } from '../services/picoloutils';

@Component({
  selector: 'app-the-game',
  templateUrl: './the-game.component.html',
  styleUrls: ['./the-game.component.scss'],
})
export class TheGameComponent implements OnInit {

  frasi: Listone;  // vedi classe listone
  virus: Listone;
  qualita: ListaQualita; // vedi classe ListaQualita
  listaGiocatori: ListaGiocatori;  // lista dei giocatori che partecipano
  maledizioniConcluse: String[];  // permette di visualizzare le maledizioni concluse(array di appoggio)
  tipoFrase: String;  //il tipo della frase
  frase: String;  // frase che viene stampata
  turni: number;  //i turni che sono stati definiti nel setup
  turnoCorrente: number; //il turno corrente
  difficolta: number; // difficoltà gioco
  sips: Sips[]; // lista dei sorsi
  TEST: number;  /* indica il livello di cose da printare: 
                        0- nulla
                        1- minimo(turno,frase)
                        2- medio(turno, frase, sostituzioni, virus conclusi, virus in corso)
                        3- massimo(turno, frase, virus conclusi, virus in corso, parole sostituite, liste e insiemi) */


  constructor(private navCtrl: NavController, private modalCtrl: ModalController, private platform: Platform, private toast: ToastController,
    private route: ActivatedRoute, private db: PicolodbService) {
    this.route.queryParams.subscribe(params => {
      // console.log('params theGame: ', params);
      this.listaGiocatori = new ListaGiocatori(new Set(params["giocatori"]));
      this.turni = JSON.parse(params["turni"]);
      this.difficolta = params["liv"];
    });
    this.frasi = new Listone(true);
    this.virus = new Listone(false);
    this.qualita = new ListaQualita();
    this.sips = [];
    this.TEST = 1;
    this.platform.backButton.subscribeWithPriority(100, async () => {
    })
  }

  ngOnInit() {
    this.maledizioniConcluse = [];
    this.setSips(this.difficolta);
    this.frase = "";
    this.turnoCorrente = 0;
    this.newTurn();
  }

  async toastCreate(message: string, color?: string) {
    const notify = await this.toast.create({
      message: message, //message
      position: 'middle',
      color: color ? color : "primary",
      cssClass: "backtoast",
      duration: 600  //durata
    });
    notify.present();
  }

  async ionViewWillEnter() {
    this.setSips(this.difficolta);
    let status = await this.db.checkStorage();
    if (!status) {
      this.frasi.setLista(await this.db.getFrasiStorage());
      this.virus.setLista(await this.db.getVirusStorage());
      this.qualita.setQualita(await this.db.getQualitaStorage());
    } else {
      this.frasi.setLista(await this.db.getFrasiFromAsset());
      this.virus.setLista(await this.db.getVirusFromAsset());
      this.qualita.setQualita(await this.db.getQualitaFromAsset());
    }
    this.qualita.setQualitaUsate(await this.db.getQualitaDoppie());
    if (this.listaGiocatori.numeroGiocatori() < 3) {
      this.frasi.noMoreThanTwoPlayers();
      this.virus.noMoreThanTwoPlayers();
    }
    this.TEST > 2 ? console.log("Da JSON - lista frasi: ", this.frasi.lista, ", lista virus: ", this.virus.lista, ", lista qualità: ", this.qualita.qualita) : null;
  }
  onBackButtonClicked(): void {
    this.db.storeQualitaDoppie(this.qualita.qualitaUsate);
    var arrayGiocatori = Array.from(this.listaGiocatori.listaGiocatori);
    //console.log(arrayGiocatori);

    let navigationExtras: NavigationExtras = {
      queryParams: {
        giocatori: arrayGiocatori,
      }
    }
    this.turnoCorrente = 0;
    this.navCtrl.navigateForward(['config'], navigationExtras);
  }
  ionViewWillLeave() {
    this.sips = [];
    this.turnoCorrente = 0;
    this.TurnoInizialeFinale("inizio");
    this.virus.listaVirusInCorso.clear();
  }
  setSips(livello: number) {
    this.sips.length = 0;
    if (livello == 1) {
      this.sips.push(new Sips("micro_sorsi", [1, 2]));
      this.sips.push(new Sips("sorsi", [2, 3, 4]));
      this.sips.push(new Sips("super_sorsi", [3, 4]));
    } else if (livello == 2) {
      this.sips.push(new Sips("micro_sorsi", [1, 2]));
      this.sips.push(new Sips("sorsi", [2, 3, 4]));
      this.sips.push(new Sips("super_sorsi", [5, 6, 7]));
    } else if (livello == 3) {
      this.sips.push(new Sips("micro_sorsi", [2, 3]));
      this.sips.push(new Sips("sorsi", [3, 4]));
      this.sips.push(new Sips("super_sorsi", [5, 6, 7]));
    }
    this.TEST > 2 ? console.log("lista sorsi: ", this.sips) : null;
  }

  findWord(tipo: string, doppioni?: Set<String>): String {
    switch (true) {
      case tipo.includes("giocatore"):
        return this.listaGiocatori.getRandomPlayer();
      default: // qualità
        let res = this.qualita.getRandomicElement(tipo);
        this.TEST > 1 ? console.log("qualità scelta: ", res) : null;
        return res !== "undefined" ? res : "";
    }
  }
  substitute(frase: String, frase_f?: String): String {
    this.TEST > 0 ? console.log("frase senza sostituzioni: ", frase) : null;
    let giocatoriScelti = new Set<String>();
    const regex = /\{(.*?)\}/g;
    let cont: String[] = frase.match(regex);
    while (cont !== null && cont.length > 0) {   // fino a quando non ci sono sostituzioni da fare
      let change: String = "";
      cont.forEach(sub => {
        delete cont[cont.indexOf(sub)];
        let subb = sub.replace("{", "").replace("}", "").trim();
        subb = subb.includes("parola") ? "parola" : subb;
        this.TEST > 1 ? console.log("qualità da cambiare: ", subb) : null;
        switch (true) {
          case subb.includes("giocatore"):
            change = this.findWord(subb, giocatoriScelti);
            this.TEST > 1 ? console.log("giocatore scelto: ", change) : null;
            this.listaGiocatori.addGiocatoreFrase(change);
            break;
          case subb.includes("sors"):
            change = String(this.sips.find(p => p.tipo === subb).getRandomSip());
            this.TEST > 1 ? console.log("sorsi scelto: ", change) : null;
            break;
          default:
            subb = raffinaCategoria(subb);
            change = this.findWord(subb);
            this.TEST > 1 ? console.log("qualita scelta: ", change) : null;
            break;
        }
        frase = frase.replace(String(sub), String(change));
        change === "1" ? frase = frase.replace("sorsi", "sorso") : null;
        frase_f != undefined && frase_f.includes(String(sub)) ? frase_f = frase_f.replace(String(sub), String(change)) : null;
      });
      cont = frase.match(regex);
      if (cont === null) break;
    }
    frase_f !== undefined ? this.setVirus(frase, frase_f) : null;
    this.listaGiocatori.resetListaDoppi();
    return frase;
  }
  setVirus(frase: String, frase_f: String) {
    let turniVirus = randomTurno(this.turnoCorrente, this.turni);
    let v: Virus = new Virus(frase, frase_f);
    this.virus.setVirusInCorso(turniVirus, v);
    this.TEST > 2 ? console.log("lista virus aggiornata: ", this.virus.listaVirusInCorso) : null;
  }
  chooseFrase(virus?: boolean) {
    this.TEST > 0 ? console.log("listaVirus: ", this.virus.listaVirusInCorso) : null;
    if (virus) {
      let v = this.virus.getRandomElem() as Virus;
      this.TEST > 2 ? console.log("lista virus fatti: ", this.virus.listaFatte) : null;
      this.frase = this.substitute(v.virus, v.virus_f);
      this.tipoFrase = "virus";
    } else {
      let f = this.frasi.getRandomElem() as Frase;
      this.TEST > 2 ? console.log("lista frasi fatte: ", this.frasi.listaFatte) : null;
      this.frase = this.substitute(f.frase);
      //this.frase = this.substitute("{giocatore} finisce il bicchiere {persona_finisce_bicchiere}");
      this.tipoFrase = f.getTipoFrase();
    }
  }
  changeBackground() {
    if (this.tipoFrase.includes("random") || this.tipoFrase.includes("game"))
      return "simple";
    else if (this.tipoFrase.includes("sfida"))
      return "danger";
    else if (this.tipoFrase.includes("virus"))
      return "virus";
    else
      return "benvenuto";
  }
  TurnoInizialeFinale(tipo: String) {
    switch (tipo) {
      case "inizio":
        this.frase = 'Benvenuti giocatori, per cominciare alla grande brindiamo alla vostra... Alla Salute!!';
        break;
      case "fine":
        this.frase = "That's All Folks. Alla Prossima";
        break;
    }
    this.tipoFrase = "benvenuto";
  }
  newTurn() {
    this.TEST > 0 ? console.log("--------------------------------------------------") : null;
    this.TEST > 0 ? console.log('turno corrente: ' + this.turnoCorrente) : null;
    this.maledizioniConcluse = this.virus.getVirusFiniti(this.turnoCorrente);
    this.TEST > 0 ? console.log("virus conclusi in questo turno: ", this.maledizioniConcluse) : null;
    this.frase.includes("Benvenuti") ? this.turnoCorrente = 1 : null; 
    switch (true) {
      case this.turnoCorrente === 0:
        this.turnoCorrente += 1;
        this.TurnoInizialeFinale("inizio");
        break;
      case this.turnoCorrente < this.turni:
        this.turnoCorrente += 1;
        const virusTime = this.virus.isTurnoVirus();
        virusTime ? this.chooseFrase(true) : this.chooseFrase();
        break;
      case this.turnoCorrente === this.turni:
        this.turnoCorrente += 1;
        this.TEST > 0 ? console.log("fine partita") : null;
        this.TurnoInizialeFinale("fine");
        break;
      case this.turnoCorrente > this.turni:
        this.TEST > 2 ? console.log("torno alle impostazioni") : null;
        this.db.storeQualitaDoppie(this.qualita.qualitaUsate);
        var arrayGiocatori = Array.from(this.listaGiocatori.listaGiocatori);
        // console.log("giocatori che passo alla modale: ", this.listaGiocatori.listaGiocatori);
        let navigationExtras: NavigationExtras = {
          queryParams: {
            giocatori: arrayGiocatori,
          }
        }
        this.navCtrl.navigateForward(['config'], navigationExtras);
        break;
    }
    this.changeBackground();
  }
  async modal(mod: String) {
    let virusDaMostrare = this.virus.getVirusInCorso();
    this.TEST > 2 ? console.log("virus modale: ", virusDaMostrare) : null;
    const modal = await this.modalCtrl.create({
      component: (mod === "virus" ? ModalVirusComponent : ModalPlayersComponent),
      componentProps: {
        listaGiocatori: (mod === "virus" ? undefined : new Set(this.listaGiocatori.listaGiocatori)),
        turni: (mod === "virus" ? undefined : this.turni),
        virusDaMostrare: (mod === "virus" ? virusDaMostrare : undefined),
      },
      breakpoints: (mod === "virus" ? [0.3, 0.5, 0.8] : undefined),
      initialBreakpoint: (mod === 'virus' ? 0.3 : 1)
    });
    if (mod === 'virus') { }
    else {
      modal.onDidDismiss()
        .then((data) => {
          this.listaGiocatori.setListaGiocatori(data['data']);
          if (this.turni !== 3000 && this.turnoCorrente < this.turni) {
            const turniAggiornati = this.setNumeroTurni(this.listaGiocatori.numeroGiocatori(), this.difficolta);
            //console.log("turni aggiornati: ", turniAggiornati, ", turno corrente: ", this.turnoCorrente);
            this.turni = turniAggiornati > this.turnoCorrente ? turniAggiornati : this.turni;
            this.TEST > 2 ? console.log("turni aggiornati: ", this.turni, ", lista giocatori: ", this.listaGiocatori.numeroGiocatori(), 'difficolta: ', this.difficolta) : null;
          }
        });
    }
    await modal.present();
  }
  setNumeroTurni(numeroGiocatori: number, difficolta: number): number {
    if (difficolta == 1)
      return numeroGiocatori * 5;
    else if (difficolta == 2)
      return numeroGiocatori * 8;
    else if (difficolta == 3)
      return numeroGiocatori * 10;
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