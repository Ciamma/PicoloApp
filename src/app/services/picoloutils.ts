import { Frase } from "./picolomodels";

export function randomizer(length: number): number {
    return Math.floor(Math.random() * length);
}

export function randomizerBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function frasiFiltrateNumeroGiocatori(lista: Set<Frase>) {
    return Array.from(lista).filter(p => !p.tag.includes("3Players"));
}

export function isEmpty(structure: any[]): boolean {
    return structure.length === 0;
}

export function intersecate(listaPartenza: Set<any>, listaDoppioni: Set<any>): Set<any> {
    return new Set(Array.from(listaPartenza).filter(x => !listaDoppioni.has(x)));
}

export function checkSets(listaPartenza: Set<any>, listaDoppioni: Set<any>) {
    if (listaPartenza.size === listaDoppioni.size)
        listaDoppioni.clear();
}

export function randomTurno(turnoCorrente: number, turni: number): number {
    let turniRimanenti: number = turni - turnoCorrente;
    let virusLungo = turnoCorrente + 12;
    if (turniRimanenti < virusLungo) {
        return randomizerBetween(turnoCorrente + 1, turni);
    } else
        return randomizerBetween(turnoCorrente + 5, turnoCorrente + 12);
}