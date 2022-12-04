export function randomizer(length: number): number {
    return Math.floor(Math.random() * length);
}

export function randomizerBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomTurno(turnoCorrente: number, turni: number): number {
    let turniRimanenti: number = turni - turnoCorrente;
    let virusLungo = turnoCorrente + 12;
    if (turniRimanenti < virusLungo) {
        return randomizerBetween(turnoCorrente + 1, turni);
    } else
        return randomizerBetween(turnoCorrente + 5, turnoCorrente + 12);
}

export function raffinaCategoria(subb: string): string {
    let res: string = subb.replace(/[0-9]/g, "");
    return res;
}

