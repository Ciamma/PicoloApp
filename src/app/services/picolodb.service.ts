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

  async storeQualitaDoppie(qualita: Map<String, Set<String>>) {
    var res = Object.fromEntries(qualita);
    for (let key of qualita.keys())
      res[String(key)] = Array.from(qualita.get(key))
    this.storage.setItemJson("qualitaDoppie", res);
  }

  async getQualitaDoppie() {
    var res: Map<String, Set<String>> = new Map<String, Set<String>>();
    let data = await this.storage.getItemJson("qualitaDoppie");
    for (let key of Object.keys(data)) {
      res.set(key, new Set(data[key]));
    }
    //console.log('doppi: ', res)
    return res;
  }

  async checkStorage() {
    let frasi = await this.storage.getItemJson("frasi");
    let virus = await this.storage.getItemJson("virus");
    let qualita = await this.storage.getItemJson("qualita");
    return (frasi === null || virus == null || qualita == null);
  }

  async verifyDB() {
    let statusDB = await this.checkStorage();
    let data = await this.storage.getString("dataUpdate");
    let dataServer = await this.getLastUpdateData();
    if (statusDB) {
      this.toastCreate("Prendo il database online, aggiornamento...", "light");
      let frasi = await this.storage.getItemJson("frasi");
      let virus = await this.storage.getItemJson("virus");
      let qualita = await this.storage.getItemJson("qualita");
      return this.upgradeDB();
    } else if (data === undefined || Date.parse(data.value) < Date.parse(dataServer)) {
      this.toastCreate("Nuova versione Db, aggiornamento...", "secondary");
      let frasi = await this.storage.getItemJson("frasi");
      let virus = await this.storage.getItemJson("virus");
      let qualita = await this.storage.getItemJson("qualita");
      return this.upgradeDB();
    }
    else {
      this.toastCreate("Hai la versione più recente del batabase", "success");
    }
  }

  async checkUpdate() {
    let data = await this.storage.getString("dataUpdate");
    console.log(Date.parse(data.value), Date.parse(await this.getLastUpdateData()), Date.parse(data.value) < Date.parse(await this.getLastUpdateData()))
    return data.value === null || data.value === undefined || data.value === 'null' || data.value === 'undefined' || Date.parse(data.value) < Date.parse(await this.getLastUpdateData());
  }

  async upgradeDB() {
    let data = await this.getLastUpdateData();
    await this.getOnline("frasi");
    await this.getOnline("virus");
    await this.getOnline("qualita");
    this.storage.setItem("dataUpdate", data);
    this.toastCreate("Aggiornamento Completato", "success");
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
        case "":
          this.storage.setItemJson
      }
    });
  }


}