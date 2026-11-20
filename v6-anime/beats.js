// Shared timing for the three versions, measured on the user's ElevenLabs voice track (audio/voce.wav, 32.7 s).
export const DUR = 34.0;
export const CODE = 'B2601M2FCQ7OBC';     // the character after the 7 is the letter O
// voice phrases [start, end, text] — also the .srt
export const SUBS = [
  [0.00, 2.40, 'GTA 6 è uscito da poche ore…'],
  [2.45, 4.40, '…e io ci gioco GRATIS.'],
  [4.45, 7.10, 'Ti spiego come. Ho aperto un conto con Buddy,'],
  [7.15, 11.00, 'ho messo il codice di un amico… e mi sono arrivati 80 €!'],
  [11.05, 13.75, 'GTA costa 79,99 €.'],
  [13.85, 16.00, 'Mi avanza pure un centesimo.'],
  [16.05, 19.75, 'Ora tocca a te! Registrati con il codice amico che vedi sullo schermo:'],
  [19.80, 23.35, 'ricevi 80 € e GTA è praticamente gratis.'],
  [23.40, 27.05, 'E non è finita: per ogni amico che inviti, altri 50 €.'],
  [27.10, 29.80, 'Cinquanta! Cinquanta! Cinquanta!'],
  [29.85, 33.95, 'Condizioni e info? Le trovi nel link in bio.'],
];
// word / phrase onsets (seconds)
export const T = {
  gta: 0.00, uscito: 0.75, ioGioco: 2.58, gratis: 3.81, spiego: 4.52, aperto: 5.75, buddy: 6.55,
  codice: 7.26, amico: 8.10, arrivati: 8.82, ottanta: 9.93, gtaCosta: 11.13, prezzo: 12.29, risata: 13.92,
  avanza: 14.34, centesimo: 15.15, tocca: 16.07, registrati: 17.24, schermo: 19.0, ricevi: 19.85, ottanta2: 20.49,
  eGta: 21.34, praticamente: 22.10, gratis2: 22.60, nonFinita: 23.46, ogniAmico: 24.52, altri50: 25.72, cinquanta0: 26.35,
  c1: 27.45, c2: 28.35, c3: 29.15, condizioni: 29.93, linkBio: 31.33, bio: 32.10,
};
// voice loudness at 30 fps (0..1), for mouth flaps: fetched once by the page
export let MOUTH = [];
export const loadMouth = () => fetch('mouth.json').then(r => r.json()).then(a => { MOUTH = a; });
export const mouthAt = t => { const i = Math.floor(t * 30); return MOUTH[i] || 0; };
