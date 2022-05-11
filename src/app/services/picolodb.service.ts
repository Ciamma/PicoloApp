import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http } from '@capacitor-community/http';
import { ToastController } from '@ionic/angular';
import { PicoloStorageService } from './picolo-storage.service';
import { Frase, Quality, Virus } from './picolomodels';



@Injectable({
  providedIn: 'root'
})
export class PicolodbService {
  urlFrasi: String;
  urlVirus: String;
  urlQuality: String;

  endpoint: string;


  constructor(public http: HttpClient, private toast: ToastController, private storage: PicoloStorageService) {
    this.urlFrasi = "../../assets/frasi.json";
    this.urlVirus = "../../assets/virus.json";
    this.urlQuality = "../../assets/qualita.json";
  }

  async toastCreate(message: string,) {
    const notify = await this.toast.create({
      message: message, //message
      duration: 500  //durata
    });
    notify.present();
  }

  getFrasiFromAsset(): Set<Frase> {
    var res = new Set<Frase>();
    fetch("../../assets/frasi.json").then(res => res.json()).then(json => {
      for (var i of json) {
        let f = new Frase(i.frase, i.tag);
        res.add(f);
      }
    });
    return res;
  }

  getVirusFromAsset(): Set<Virus> {
    var res = new Set<Virus>();
    fetch("../../assets/virus.json").then(res => res.json()).then(json => {
      for (var i of json) {
        let v = new Virus(i.virus, i.virus_f);
        res.add(v);
      }
    });
    return res;
  }

  getQualitaFromAsset(): Quality[] {
    var res: Quality[] = [];
    fetch("../../assets/qualita.json").then(res => res.json()).then(json => {
      for (var i of json) {
        let q = new Quality(i.nome, i.listQ);
        res.push(q);
      }
    });
    return res;
  }

  async getFrasiStorage() {
    var res = new Set<Frase>();
    let data = await this.storage.getItemJson("frasi");
    for (var i of data) {
      let f = new Frase(i.frase, i.tag);
      res.add(f);
    }
    return res;
  }

  async getVirusStorage() {
    var res = new Set<Virus>();
    let data = await this.storage.getItemJson("virus");
    for (var i of data) {
      let f = new Virus(i.virus, i.virus_f);
      res.add(f);
    }
    return res;
  }

  async getQualitaStorage() {
    var res: Quality[] = [];
    let data = await this.storage.getItemJson("qualita");
    for (var i of data) {
      let q = new Quality(i.nome, i.listQ);
      res.push(q);
    }
    return res;
  }

  async checkStorage() {
    let frasi = await this.storage.getItemJson("frasi");
    let virus = await this.storage.getItemJson("virus");
    let qualita = await this.storage.getItemJson("qualita");
    return (frasi == null || virus == null || qualita == null);
  }

  async verifyDB() {
    let frasi = await this.storage.getItemJson("frasi");
    let virus = await this.storage.getItemJson("virus");
    let qualita = await this.storage.getItemJson("qualita");
    let statusDB = await this.checkStorage();
    let data = await this.storage.getString("dataUpdate");
    let dataServer = await this.getLastUpdateData();
    if (statusDB) {
      this.toastCreate("Prendo il database online, aggiornamento...");
      return this.upgradeDB(true, frasi, virus, qualita);
    } else if (data.value !== dataServer || data == null) {
      this.toastCreate("Nuova versione Db, aggiornamento...");
      return this.upgradeDB(false, dataServer, frasi, virus, qualita);
    }
    else {
      this.toastCreate("Hai la versione più recente del batabase");
    }
  }
  async upgradeDB(firstTime: boolean, dataServer: string, frasi?: any, virus?: any, qualita?: any) {
    if (firstTime) {
      frasi == null ? await this.getOnline("frasi") : null;
      virus == null ? await this.getOnline("virus") : null;
      qualita == null ? await this.getOnline("qualita") : null;
    }
    else {
      await this.getOnline("frasi");
      await this.getOnline("virus");
      await this.getOnline("qualita");
      //todo DEVO AGGIORNARE LA DATA
    }
    this.storage.setItem("dataUpdate", dataServer);
    this.toastCreate("Aggiornamento Completato");
  }
  async getLastUpdateData() {
    let url: string = "https://picoloservice.herokuapp.com/";
    return Http.request({
      method: "GET",
      url: url
    }).then(res => {
      return res.data.data;
    });
  }
  async getOnline(substring: string) {
    let url: string = "https://picoloservice.herokuapp.com/ppp".replace('ppp', substring);
    await Http.request({
      method: "GET",
      url: url
    }).then(res => {
      switch (substring) {
        case "frasi":
          this.storage.setItemJson("frasi", res.data);
        // let frasi = this.storage.getItemJson("frasi");
        // console.log('frasi salvate nel db check: ', frasi);

        case "virus":
          this.storage.setItemJson("virus", res.data);
          // let virus = this.storage.getItemJson("virus");
          // console.log('virus salvati nel db check: ', virus);

        case "qualita":
          this.storage.setItemJson("qualita", res.data);
        // let qualita = this.storage.getItemJson("qualita");
        // console.log('qualita salvate nel db check: ', qualita);
      }
    });
  }


}