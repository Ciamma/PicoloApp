import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Frase, Quality, Virus } from './picolomodels';



@Injectable({
  providedIn: 'root'
})
export class PicolodbService {
  urlFrasi: String;
  urlVirus: String;
  urlQuality: String;


  constructor(public http: HttpClient) {
    this.urlFrasi = "../../assets/frasi.json";
    this.urlVirus = "../../assets/virus.json";
    this.urlQuality = "../../assets/qualita.json";
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

}


