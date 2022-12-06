export class Frase {
    frase: String;
    tag: String;

    constructor(frase: String, tag: String) {
        this.frase = frase;
        this.tag = tag;
    }
    getTipoFrase(): String {
        switch (true) {
            case this.tag.includes("random"):
                return "random";
            case this.tag.includes("game"):
                return "game";
            default:
                return "sfida";
        }
    }
    isTimerable(): boolean { return this.tag.includes("timer"); }
}

export class Virus {
    virus: String;
    virus_f: String;

    constructor(virus: String, fine: String) {
        this.virus = virus;
        this.virus_f = fine;
    }
}

export class Quality {
    nome: String;
    listQ: string[];
    constructor(name: String, listQ?: string[]) {
        this.nome = name;
        this.listQ = (listQ ? listQ : []);
    }
}

export class Sips {
    tipo: string;
    listaSorsi: number[];
    constructor(tipo: string, listaSorsi?: number[]) {
        this.tipo = tipo;
        this.listaSorsi = (listaSorsi ? listaSorsi : []);
    }

    getRandomSip(): number { return this.listaSorsi[Math.floor(Math.random() * this.listaSorsi.length)]; }
}

export class ListaQualita { // lista delle qualità
    qualita: Quality[];
    qualitaUsate: Map<String, Set<String>>;  // qualità usate durante una sessione di gioco
    qualitaNonDoppie: String[]  // qualità che non devono essere contate come usate

    constructor(qualita?: Quality[], qualitaUsate?: Map<String, Set<String>>) {
        this.qualita = qualita;
        this.qualitaUsate = qualitaUsate;
        this.qualitaNonDoppie = ['azioni', 'azioni_plurale', 'azioni_secondaPersona'];
    }
    setQualita(qualita: Quality[]): void { this.qualita = qualita; }
    setQualitaUsate(listafatte: Map<String, Set<String>>): void {
        this.qualitaUsate = listafatte !== null ? listafatte : new Map<String, Set<String>>();
    }
    getRandomicElement(categoria: String): String { // prendo un elemento randomico e lo aggiungo alle quaità usate
        let qualitaPescabili = this.getQualitaPescabili(categoria);
        // console.log("intersezione qualità: ", qualitaPescabili);
        let elemento = qualitaPescabili[Math.floor(Math.random() * qualitaPescabili.length)];
        this.addElementUsato(elemento, categoria);
        return elemento;
    }
    getQualitaPescabili(categoria: String): String[] { // lista delle qualita usabili
        let qualitaCercata = this.qualita.find(q => q.nome === categoria);
        let qualitaDoppia = this.qualitaUsate.has(categoria) ? this.qualitaUsate.get(categoria) : undefined;
        //console.log("qualitaCercata: ", qualitaCercata, ", qualitaDoppia: ", qualitaDoppia);
        if (qualitaCercata !== undefined && qualitaCercata.listQ.length > 0) {
            if (qualitaDoppia !== undefined && qualitaDoppia.size > 0 && !this.qualitaNonDoppie.includes(categoria))
                return qualitaCercata.listQ.filter(q => !qualitaDoppia.has(q));
            else {
                return qualitaCercata.listQ;
            }
        }
    }
    addElementUsato(qualità: String, categoria: String): void {
        this.qualitaUsate.has(categoria) ? this.qualitaUsate.get(categoria).add(qualità) : this.qualitaUsate.set(categoria, new Set([qualità]));
        this.clearListaUsata(categoria);
    }
    clearListaUsata(categoria: String): void {
        let q = this.qualita.find(q => q.nome === categoria).listQ;
        let qq = this.qualitaUsate.get(categoria);
        q.length <= qq.size ? qq.clear() : null;
    }
}

export class Listone { // lista di frasi o di virus
    tipo: boolean; // true per frasi, false per virus
    lista: Set<Frase | Virus>; //lista frasi_tot o virus_tot
    listaFatte: Set<Frase | Virus>;  // frasi o virus fatti durante una sessione di gioco
    listaVirusInCorso: Map<Number, Virus[]>;  // lista dei virus in corso

    constructor(tipo: boolean, lista?: Set<Frase | Virus>, listafatte?: Set<Frase | Virus>) {
        this.tipo = tipo;
        this.lista = lista !== undefined ? lista : null;
        this.listaFatte = listafatte !== undefined ? listafatte : new Set<Frase | Virus>();
        !this.tipo ? this.listaVirusInCorso = new Map<Number, Virus[]>() : null;
    }
    setLista(lista: Set<Frase | Virus>): void { this.lista = lista; }
    setListaFatte(listafatte: Set<Frase | Virus>): void { this.listaFatte = listafatte; }
    getVirusInCorso(): String[] { // ritorna tutti i virus in circolazione
        let res: String[] = [];
        this.listaVirusInCorso.forEach((v: Virus[], k: Number) => v.forEach((v: Virus) => res.push(v.virus)));
        return res;
    }
    setVirusInCorso(turno: number, virus: Virus): void {
        this.listaVirusInCorso.has(turno) ? this.listaVirusInCorso.get(turno).push(virus) : this.listaVirusInCorso.set(turno, [virus]);
        //console.log("virus in corso: ", this.listaVirusInCorso);
    }
    getVirusFiniti(turno: number): String[] { // ritorna tutte le frasi conclusive dei virus conclusi 
        let res: String[] = [];
        this.listaVirusInCorso.has(turno) ? this.listaVirusInCorso.get(turno).forEach((v: Virus) => res.push(v.virus_f)) : null;
        this.listaVirusInCorso.delete(turno);
        return res;
    }
    getDatiPescabili(): (Virus | Frase)[] { // lista delle qualita usabili
        return [...this.lista].filter(d => !this.listaFatte.has(d));
    }
    getRandomElem(): Frase | Virus {
        var lista = this.getDatiPescabili();
        return lista[Math.floor(Math.random() * this.lista.size)];
    }
    isTurnoVirus(): boolean {
        let percentage = Math.floor(Math.random() * 100) + 1;
        return percentage > 75 && this.listaVirusInCorso.size < 4 ? true : false;
    }
    noMoreThanTwoPlayers(): void {
        [...this.lista].filter((e: Frase | Virus) => e instanceof Frase ? !e.frase.includes("giocatore2") : !e.virus.includes("giocatore2"));
    }


}

export class ListaGiocatori {
    listaGiocatori: Set<String>;  // lista dei giocatori che partecipano
    listaGiocatoriFrase: String[]; //giocatori scelti per una frase(per non ripetere più volte lo stesso giocatore)

    constructor(players: Set<String>) {
        this.listaGiocatori = players;
        this.listaGiocatoriFrase = [];
    }
    setListaGiocatori(playerList: Set<String>) {
        playerList.forEach(p => {
            this.listaGiocatori.has(p) ? null : this.addGiocatore(p);
        });
    }
    addGiocatore(player: String): void {
        console.log(this.listaGiocatori);
        this.listaGiocatori.add(player);
    }
    removeGiocatore(player: String): void {
        this.listaGiocatori.has(player) ? this.listaGiocatori.delete(player) : this.listaGiocatori;
    }
    numeroGiocatori(): number {
        return this.listaGiocatori.size;
    }
    resetListaDoppi(): void {
        this.listaGiocatoriFrase.length = 0;
    }
    addGiocatoreFrase(player: String): void {
        this.listaGiocatoriFrase.push(player);
        console.log(this.listaGiocatori);
        this.listaGiocatori.size === this.listaGiocatoriFrase.length ? this.resetListaDoppi() : null;
    }

    getRandomPlayer(): String {
        const giocatoriPescabili = [...this.listaGiocatori].filter(x => !this.listaGiocatoriFrase.includes(x));
        const giocatore = giocatoriPescabili[Math.floor(Math.random() * giocatoriPescabili.length)];
        this.addGiocatore(giocatore);
        return giocatore;
    }
}

