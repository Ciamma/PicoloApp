export class Frase {
    frase: String;
    tag: String;

    constructor(frase: String, tag: String) {
        this.frase = frase;
        this.tag = tag;
    }
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
}

