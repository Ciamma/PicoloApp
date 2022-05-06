import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular';
import { Frase, Quality, Virus } from './picolomodels';



@Injectable({
  providedIn: 'root'
})
export class PicolodbService {
  urlFrasi: String;
  urlVirus: String;
  urlQuality: String;

  endpoint: string;


  constructor(public http: HttpClient, private toast: ToastController) {
    this.urlFrasi = "../../assets/frasi.json";
    this.urlVirus = "../../assets/virus.json";
    this.urlQuality = "../../assets/qualita.json";
  }

  async toastCreate(message: string) {
    const notify = await this.toast.create({
      message: message, //message
      duration: 500  //durata
    });
    notify.present();
  }

  getFrasi(): Set<Frase> {
    var res = new Set<Frase>();
    fetch("../../assets/frasi.json").then(res => res.json()).then(json => {
      //console.log("OUTPUT: ", json);
      for (var i of json) {
        let f = new Frase(i.frase, i.tag);
        res.add(f);
      }
      //console.log("OUTPUT FRASI: ", res);
    });
    return res;
  }

  getVirus(): Set<Virus> {
    var res = new Set<Virus>();
    fetch("../../assets/virus.json").then(res => res.json()).then(json => {
      //console.log("OUTPUT: ", json);
      for (var i of json) {
        let v = new Virus(i.virus, i.virus_f);
        res.add(v);
      }
      //console.log("OUTPUT FRASI: ", res);
    });
    return res;
  }

  getQualita(): Quality[] {
    var res: Quality[] = [];
    fetch("../../assets/qualita.json").then(res => res.json()).then(json => {
      //console.log("OUTPUT: ", json);
      for (var i of json) {
        let q = new Quality(i.nome, i.listQ);
        res.push(q);
      }
      //console.log("OUTPUT QuUALITà: ", res);
    });
    return res;
  }

  creaImpostazioni() {
    return async () => {
      await Filesystem.writeFile({
        path: '../../assets/settings.json',
        data: "This is a test"
      });
      console.log("impostazioni creata");
    };
  }
}

