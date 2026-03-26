import type { Exercise, NoteName, PianoKeyFingering, Variation } from "@/domain/types";

export const CURRENT_SEED_VERSION = 9;

const NOTE_ORDER: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Helper to build 2-octave piano scale fingering from note sequence and finger patterns
function pianoScale(
  id: string,
  name: string,
  notes: NoteName[],
  rhFingers: number[],
  lhFingers: number[],
  tempo = 80
): Exercise {
  // notes is the ascending scale (e.g. 8 notes including the top note which equals the root)
  // rhFingers/lhFingers are 15-note 2-octave ascending patterns
  //
  // We assign chromatic-order octaves: start at octave 1 on the root note,
  // and bump the octave each time a note's chromatic index is <= the previous note's.
  const scaleLen = notes.length - 1; // 7 for major/minor

  function buildKeys(fingers: number[]): PianoKeyFingering[] {
    const map = new Map<string, number>();
    let currentOctave = 1;
    let prevChromaticIdx = NOTE_ORDER.indexOf(notes[0]!);

    for (let i = 0; i < fingers.length; i++) {
      const note = notes[i % scaleLen]!;
      const chromaticIdx = NOTE_ORDER.indexOf(note);

      if (i > 0 && chromaticIdx <= prevChromaticIdx) {
        currentOctave++;
      }
      prevChromaticIdx = chromaticIdx;

      const key = `${note}-${currentOctave}`;
      if (!map.has(key)) map.set(key, fingers[i]!);
    }

    const keys: PianoKeyFingering[] = [];
    for (const [key, finger] of map) {
      const [note, oct] = key.split("-");
      keys.push({ note: note as NoteName, octave: Number(oct) as 1 | 2 | 3, finger });
    }
    return keys;
  }

  return {
    id,
    instrument: "piano",
    name,
    defaultTempo: tempo,
    fingering: {
      type: "piano",
      hands: [
        { hand: "RH", keys: buildKeys(rhFingers) },
        { hand: "LH", keys: buildKeys(lhFingers) },
      ],
    },
  };
}

// Helper to build 2-octave piano arpeggio fingering (7 notes: R-3-5-R-3-5-R)
function pianoArpeggio(
  id: string,
  name: string,
  notes: [NoteName, NoteName, NoteName],
  rhFingers: number[],
  lhFingers: number[],
  tempo = 72
): Exercise {
  function buildKeys(fingers: number[]): PianoKeyFingering[] {
    const keys: PianoKeyFingering[] = [];
    let currentOctave = 1;
    let prevChromaticIdx = NOTE_ORDER.indexOf(notes[0]);

    for (let i = 0; i < fingers.length; i++) {
      const note = notes[i % 3]!;
      const chromaticIdx = NOTE_ORDER.indexOf(note);
      if (i > 0 && chromaticIdx <= prevChromaticIdx) currentOctave++;
      prevChromaticIdx = chromaticIdx;
      keys.push({ note, octave: currentOctave, finger: fingers[i]! });
    }
    return keys;
  }

  return {
    id,
    instrument: "piano",
    name,
    defaultTempo: tempo,
    fingering: {
      type: "piano",
      hands: [
        { hand: "RH", keys: buildKeys(rhFingers) },
        { hand: "LH", keys: buildKeys(lhFingers) },
      ],
    },
  };
}

// Helper to build root-position piano triad (3 notes)
function pianoTriad(
  id: string,
  name: string,
  notes: [NoteName, NoteName, NoteName],
  rhFingers: [number, number, number],
  lhFingers: [number, number, number],
  tempo = 72
): Exercise {
  function buildKeys(fingers: number[]): PianoKeyFingering[] {
    const keys: PianoKeyFingering[] = [];
    let currentOctave = 1;
    let prevChromaticIdx = NOTE_ORDER.indexOf(notes[0]);

    for (let i = 0; i < 3; i++) {
      const note = notes[i]!;
      const chromaticIdx = NOTE_ORDER.indexOf(note);
      if (i > 0 && chromaticIdx <= prevChromaticIdx) currentOctave++;
      prevChromaticIdx = chromaticIdx;
      keys.push({ note, octave: currentOctave, finger: fingers[i]! });
    }
    return keys;
  }

  return {
    id,
    instrument: "piano",
    name,
    defaultTempo: tempo,
    fingering: {
      type: "piano",
      hands: [
        { hand: "RH", keys: buildKeys(rhFingers) },
        { hand: "LH", keys: buildKeys(lhFingers) },
      ],
    },
  };
}

// Major scale note patterns (ascending, 8 notes including octave)
const C_MAJ: NoteName[] = ["C", "D", "E", "F", "G", "A", "B", "C"];
const Db_MAJ: NoteName[] = ["C#", "D#", "F", "F#", "G#", "A#", "C", "C#"];
const D_MAJ: NoteName[] = ["D", "E", "F#", "G", "A", "B", "C#", "D"];
const Eb_MAJ: NoteName[] = ["D#", "F", "G", "G#", "A#", "C", "D", "D#"];
const E_MAJ: NoteName[] = ["E", "F#", "G#", "A", "B", "C#", "D#", "E"];
const F_MAJ: NoteName[] = ["F", "G", "A", "A#", "C", "D", "E", "F"];
const Gb_MAJ: NoteName[] = ["F#", "G#", "A#", "B", "C#", "D#", "F", "F#"];
const G_MAJ: NoteName[] = ["G", "A", "B", "C", "D", "E", "F#", "G"];
const Ab_MAJ: NoteName[] = ["G#", "A#", "C", "C#", "D#", "F", "G", "G#"];
const A_MAJ: NoteName[] = ["A", "B", "C#", "D", "E", "F#", "G#", "A"];
const Bb_MAJ: NoteName[] = ["A#", "C", "D", "D#", "F", "G", "A", "A#"];
const B_MAJ: NoteName[] = ["B", "C#", "D#", "E", "F#", "G#", "A#", "B"];

// Natural minor scale note patterns
const A_MIN: NoteName[] = ["A", "B", "C", "D", "E", "F", "G", "A"];
const Bb_MIN: NoteName[] = ["A#", "C", "C#", "D#", "F", "F#", "G#", "A#"];
const B_MIN: NoteName[] = ["B", "C#", "D", "E", "F#", "G", "A", "B"];
const C_MIN: NoteName[] = ["C", "D", "D#", "F", "G", "G#", "A#", "C"];
const Cs_MIN: NoteName[] = ["C#", "D#", "E", "F#", "G#", "A", "B", "C#"];
const D_MIN: NoteName[] = ["D", "E", "F", "G", "A", "A#", "C", "D"];
const Eb_MIN: NoteName[] = ["D#", "F", "F#", "G#", "A#", "B", "C#", "D#"];
const E_MIN: NoteName[] = ["E", "F#", "G", "A", "B", "C", "D", "E"];
const F_MIN: NoteName[] = ["F", "G", "G#", "A#", "C", "C#", "D#", "F"];
const Fs_MIN: NoteName[] = ["F#", "G#", "A", "B", "C#", "D", "E", "F#"];
const G_MIN: NoteName[] = ["G", "A", "A#", "C", "D", "D#", "F", "G"];
const Gs_MIN: NoteName[] = ["G#", "A#", "B", "C#", "D#", "E", "F#", "G#"];

// Harmonic minor (raised 7th)
const A_HARM: NoteName[] = ["A", "B", "C", "D", "E", "F", "G#", "A"];
const Bb_HARM: NoteName[] = ["A#", "C", "C#", "D#", "F", "F#", "A", "A#"];
const B_HARM: NoteName[] = ["B", "C#", "D", "E", "F#", "G", "A#", "B"];
const C_HARM: NoteName[] = ["C", "D", "D#", "F", "G", "G#", "B", "C"];
const Cs_HARM: NoteName[] = ["C#", "D#", "E", "F#", "G#", "A", "C", "C#"];
const D_HARM: NoteName[] = ["D", "E", "F", "G", "A", "A#", "C#", "D"];
const Eb_HARM: NoteName[] = ["D#", "F", "F#", "G#", "A#", "B", "D", "D#"];
const E_HARM: NoteName[] = ["E", "F#", "G", "A", "B", "C", "D#", "E"];
const F_HARM: NoteName[] = ["F", "G", "G#", "A#", "C", "C#", "E", "F"];
const Fs_HARM: NoteName[] = ["F#", "G#", "A", "B", "C#", "D", "F", "F#"];
const G_HARM: NoteName[] = ["G", "A", "A#", "C", "D", "D#", "F#", "G"];
const Gs_HARM: NoteName[] = ["G#", "A#", "B", "C#", "D#", "E", "G", "G#"];

// Melodic minor (raised 6th and 7th ascending)
const A_MELOD: NoteName[] = ["A", "B", "C", "D", "E", "F#", "G#", "A"];
const Bb_MELOD: NoteName[] = ["A#", "C", "C#", "D#", "F", "G", "A", "A#"];
const B_MELOD: NoteName[] = ["B", "C#", "D", "E", "F#", "G#", "A#", "B"];
const C_MELOD: NoteName[] = ["C", "D", "D#", "F", "G", "A", "B", "C"];
const Cs_MELOD: NoteName[] = ["C#", "D#", "E", "F#", "G#", "A#", "C", "C#"];
const D_MELOD: NoteName[] = ["D", "E", "F", "G", "A", "B", "C#", "D"];
const Eb_MELOD: NoteName[] = ["D#", "F", "F#", "G#", "A#", "C", "D", "D#"];
const E_MELOD: NoteName[] = ["E", "F#", "G", "A", "B", "C#", "D#", "E"];
const F_MELOD: NoteName[] = ["F", "G", "G#", "A#", "C", "D", "E", "F"];
const Fs_MELOD: NoteName[] = ["F#", "G#", "A", "B", "C#", "D#", "F", "F#"];
const G_MELOD: NoteName[] = ["G", "A", "A#", "C", "D", "E", "F#", "G"];
const Gs_MELOD: NoteName[] = ["G#", "A#", "B", "C#", "D#", "F", "G", "G#"];

// === 2-octave fingerings (15 notes: 7+7+1) ===
// From pianoscales.org — 1-octave patterns extended to 2 octaves

// Major scale fingerings
const RH_C = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_C = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Db = [2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2];
const LH_Db = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_D = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_D = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Eb = [3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3];
const LH_Eb = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_E = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_E = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_F = [1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4];
const LH_F = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Gb = [2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2];
const LH_Gb = [4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4];
const RH_G = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_G = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Ab = [3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3];
const LH_Ab = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_A = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_A = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Bb = [2, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4];
const LH_Bb = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_B = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_B = [4, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1];

// Natural minor fingerings (from pianoscales.org)
const RH_Am = RH_C;
const LH_Am = LH_C;
const RH_Bbm = [2, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4];
const LH_Bbm = [2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2];
const RH_Bm = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_Bm = [4, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1];
const RH_Cm = RH_C;
const LH_Cm = LH_C;
const RH_Csm = [3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3];
const LH_Csm = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_Dm = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_Dm = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Ebm = [3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3];
const LH_Ebm = [2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2];
const RH_Em = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_Em = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Fm = [1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4];
const LH_Fm = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Fsm = [2, 3, 1, 2, 3, 1, 2, 2, 3, 1, 2, 3, 1, 2, 3];
const LH_Fsm = [4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4];
const RH_Gm = [1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 5];
const LH_Gm = [5, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1];
const RH_Gsm = [3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3];
const LH_Gsm = [3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3];

// Harmonic minor fingerings (from pianoscales.org)
const RH_AHarm = RH_C;
const LH_AHarm = LH_C;
const RH_BbHarm = RH_Bbm;
const LH_BbHarm = LH_Bbm;
const RH_BHarm = RH_Bm;
const LH_BHarm = LH_Bm;
const RH_CHarm = RH_C;
const LH_CHarm = LH_C;
const RH_CsHarm = [3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3];
const LH_CsHarm = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];
const RH_DHarm = RH_Dm;
const LH_DHarm = LH_Dm;
const RH_EbHarm = [3, 1, 2, 3, 4, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3];
const LH_EbHarm = [2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3, 2];
const RH_EHarm = RH_Em;
const LH_EHarm = LH_Em;
const RH_FHarm = RH_Fm;
const LH_FHarm = LH_Fm;
const RH_FsHarm = [2, 3, 1, 2, 3, 1, 2, 2, 3, 1, 2, 3, 1, 2, 3];
const LH_FsHarm = LH_Fsm;
const RH_GHarm = RH_Gm;
const LH_GHarm = LH_Gm;
const RH_GsHarm = [2, 3, 1, 2, 3, 1, 2, 2, 3, 1, 2, 3, 1, 2, 3];
const LH_GsHarm = [3, 2, 1, 4, 3, 2, 1, 3, 2, 1, 4, 3, 2, 1, 3];

export const EXERCISES: Exercise[] = [
  // === MAJOR SCALES (circle of fifths, alternating) ===
  pianoScale("piano-c-major-scale", "C Major Scale", C_MAJ, RH_C, LH_C, 88),
  pianoScale("piano-g-major-scale", "G Major Scale", G_MAJ, RH_G, LH_G, 84),
  pianoScale("piano-f-major-scale", "F Major Scale", F_MAJ, RH_F, LH_F, 84),
  pianoScale("piano-d-major-scale", "D Major Scale", D_MAJ, RH_D, LH_D, 80),
  pianoScale("piano-bb-major-scale", "B♭ Major Scale", Bb_MAJ, RH_Bb, LH_Bb, 76),
  pianoScale("piano-a-major-scale", "A Major Scale", A_MAJ, RH_A, LH_A, 80),
  pianoScale("piano-eb-major-scale", "E♭ Major Scale", Eb_MAJ, RH_Eb, LH_Eb, 76),
  pianoScale("piano-e-major-scale", "E Major Scale", E_MAJ, RH_E, LH_E, 80),
  pianoScale("piano-ab-major-scale", "A♭ Major Scale", Ab_MAJ, RH_Ab, LH_Ab, 76),
  pianoScale("piano-b-major-scale", "B Major Scale", B_MAJ, RH_B, LH_B, 76),
  pianoScale("piano-db-major-scale", "D♭ Major Scale", Db_MAJ, RH_Db, LH_Db, 72),
  pianoScale("piano-gb-major-scale", "F♯/G♭ Major Scale", Gb_MAJ, RH_Gb, LH_Gb, 72),

  // === MAJOR ARPEGGIOS (circle of fifths) ===
  // White-key root: RH 1-2-3-1-2-3-5, LH 5-3-2-1-3-2-1
  // Black-key root: RH 2-1-2-4-1-2-4, LH 2-1-4-2-1-4-2
  pianoArpeggio(
    "piano-c-major-arpeggio",
    "C Major Arpeggio",
    ["C", "E", "G"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-g-major-arpeggio",
    "G Major Arpeggio",
    ["G", "B", "D"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-f-major-arpeggio",
    "F Major Arpeggio",
    ["F", "A", "C"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 4, 2, 1, 4, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-d-major-arpeggio",
    "D Major Arpeggio",
    ["D", "F#", "A"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-bb-major-arpeggio",
    "B♭ Major Arpeggio",
    ["A#", "D", "F"],
    [2, 1, 2, 4, 1, 2, 4],
    [3, 2, 1, 3, 2, 1, 3],
    72
  ),
  pianoArpeggio(
    "piano-a-major-arpeggio",
    "A Major Arpeggio",
    ["A", "C#", "E"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-eb-major-arpeggio",
    "E♭ Major Arpeggio",
    ["D#", "G", "A#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    72
  ),
  pianoArpeggio(
    "piano-e-major-arpeggio",
    "E Major Arpeggio",
    ["E", "G#", "B"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-ab-major-arpeggio",
    "A♭ Major Arpeggio",
    ["G#", "C", "D#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    72
  ),
  pianoArpeggio(
    "piano-b-major-arpeggio",
    "B Major Arpeggio",
    ["B", "D#", "F#"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    68
  ),
  pianoArpeggio(
    "piano-db-major-arpeggio",
    "D♭ Major Arpeggio",
    ["C#", "F", "G#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),
  pianoArpeggio(
    "piano-gb-major-arpeggio",
    "F♯/G♭ Major Arpeggio",
    ["F#", "A#", "C#"],
    [2, 4, 1, 2, 4, 1, 2],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),

  // === MINOR ARPEGGIOS (circle of fifths) ===
  pianoArpeggio(
    "piano-a-minor-arpeggio",
    "A Minor Arpeggio",
    ["A", "C", "E"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-e-minor-arpeggio",
    "E Minor Arpeggio",
    ["E", "G", "B"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-d-minor-arpeggio",
    "D Minor Arpeggio",
    ["D", "F", "A"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    76
  ),
  pianoArpeggio(
    "piano-b-minor-arpeggio",
    "B Minor Arpeggio",
    ["B", "D", "F#"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-g-minor-arpeggio",
    "G Minor Arpeggio",
    ["G", "A#", "D"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-fs-minor-arpeggio",
    "F♯ Minor Arpeggio",
    ["F#", "A", "C#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),
  pianoArpeggio(
    "piano-c-minor-arpeggio",
    "C Minor Arpeggio",
    ["C", "D#", "G"],
    [1, 2, 3, 1, 2, 3, 5],
    [5, 3, 2, 1, 3, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-cs-minor-arpeggio",
    "C♯ Minor Arpeggio",
    ["C#", "E", "G#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),
  pianoArpeggio(
    "piano-f-minor-arpeggio",
    "F Minor Arpeggio",
    ["F", "G#", "C"],
    [1, 2, 4, 1, 2, 4, 5],
    [5, 4, 2, 1, 4, 2, 1],
    72
  ),
  pianoArpeggio(
    "piano-gs-minor-arpeggio",
    "G♯ Minor Arpeggio",
    ["G#", "B", "D#"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),
  pianoArpeggio(
    "piano-bb-minor-arpeggio",
    "B♭ Minor Arpeggio",
    ["A#", "C#", "F"],
    [2, 1, 2, 4, 1, 2, 4],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),
  pianoArpeggio(
    "piano-eb-minor-arpeggio",
    "D♯/E♭ Minor Arpeggio",
    ["D#", "F#", "A#"],
    [2, 4, 1, 2, 4, 1, 2],
    [2, 1, 4, 2, 1, 4, 2],
    68
  ),

  // === MAJOR TRIADS (circle of fifths) ===
  pianoTriad("piano-c-major-triad", "C Major Triad", ["C", "E", "G"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-g-major-triad", "G Major Triad", ["G", "B", "D"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-f-major-triad", "F Major Triad", ["F", "A", "C"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-d-major-triad", "D Major Triad", ["D", "F#", "A"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-bb-major-triad", "B♭ Major Triad", ["A#", "D", "F"], [2, 4, 5], [5, 3, 1], 72),
  pianoTriad("piano-a-major-triad", "A Major Triad", ["A", "C#", "E"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-eb-major-triad", "E♭ Major Triad", ["D#", "G", "A#"], [2, 4, 5], [5, 3, 1], 72),
  pianoTriad("piano-e-major-triad", "E Major Triad", ["E", "G#", "B"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-ab-major-triad", "A♭ Major Triad", ["G#", "C", "D#"], [2, 4, 5], [5, 3, 1], 72),
  pianoTriad("piano-b-major-triad", "B Major Triad", ["B", "D#", "F#"], [1, 3, 5], [5, 3, 1], 68),
  pianoTriad("piano-db-major-triad", "D♭ Major Triad", ["C#", "F", "G#"], [2, 3, 5], [5, 3, 1], 68),
  pianoTriad(
    "piano-gb-major-triad",
    "F♯/G♭ Major Triad",
    ["F#", "A#", "C#"],
    [2, 4, 5],
    [5, 3, 1],
    68
  ),

  // === MINOR TRIADS (circle of fifths) ===
  pianoTriad("piano-a-minor-triad", "A Minor Triad", ["A", "C", "E"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-e-minor-triad", "E Minor Triad", ["E", "G", "B"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-d-minor-triad", "D Minor Triad", ["D", "F", "A"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-b-minor-triad", "B Minor Triad", ["B", "D", "F#"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-g-minor-triad", "G Minor Triad", ["G", "A#", "D"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-fs-minor-triad", "F♯ Minor Triad", ["F#", "A", "C#"], [2, 3, 5], [5, 3, 1], 68),
  pianoTriad("piano-c-minor-triad", "C Minor Triad", ["C", "D#", "G"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-cs-minor-triad", "C♯ Minor Triad", ["C#", "E", "G#"], [2, 3, 5], [5, 3, 1], 68),
  pianoTriad("piano-f-minor-triad", "F Minor Triad", ["F", "G#", "C"], [1, 3, 5], [5, 3, 1], 72),
  pianoTriad("piano-gs-minor-triad", "G♯ Minor Triad", ["G#", "B", "D#"], [2, 4, 5], [5, 3, 1], 68),
  pianoTriad("piano-bb-minor-triad", "B♭ Minor Triad", ["A#", "C#", "F"], [2, 4, 5], [5, 3, 1], 68),
  pianoTriad(
    "piano-eb-minor-triad",
    "D♯/E♭ Minor Triad",
    ["D#", "F#", "A#"],
    [2, 4, 5],
    [5, 3, 1],
    68
  ),

  // === NATURAL MINOR SCALES (circle of fifths, alternating) ===
  pianoScale("piano-a-natural-minor-scale", "A Natural Minor Scale", A_MIN, RH_Am, LH_Am, 84),
  pianoScale("piano-e-natural-minor-scale", "E Natural Minor Scale", E_MIN, RH_Em, LH_Em, 80),
  pianoScale("piano-d-natural-minor-scale", "D Natural Minor Scale", D_MIN, RH_Dm, LH_Dm, 84),
  pianoScale("piano-b-natural-minor-scale", "B Natural Minor Scale", B_MIN, RH_Bm, LH_Bm, 76),
  pianoScale("piano-g-natural-minor-scale", "G Natural Minor Scale", G_MIN, RH_Gm, LH_Gm, 80),
  pianoScale("piano-fs-natural-minor-scale", "F♯ Natural Minor Scale", Fs_MIN, RH_Fsm, LH_Fsm, 72),
  pianoScale("piano-c-natural-minor-scale", "C Natural Minor Scale", C_MIN, RH_Cm, LH_Cm, 80),
  pianoScale("piano-cs-natural-minor-scale", "C♯ Natural Minor Scale", Cs_MIN, RH_Csm, LH_Csm, 72),
  pianoScale("piano-f-natural-minor-scale", "F Natural Minor Scale", F_MIN, RH_Fm, LH_Fm, 76),
  pianoScale("piano-gs-natural-minor-scale", "G♯ Natural Minor Scale", Gs_MIN, RH_Gsm, LH_Gsm, 72),
  pianoScale("piano-bb-natural-minor-scale", "B♭ Natural Minor Scale", Bb_MIN, RH_Bbm, LH_Bbm, 72),
  pianoScale(
    "piano-eb-natural-minor-scale",
    "D♯/E♭ Natural Minor Scale",
    Eb_MIN,
    RH_Ebm,
    LH_Ebm,
    72
  ),

  // === HARMONIC MINOR SCALES (circle of fifths, alternating) ===
  pianoScale(
    "piano-a-harmonic-minor-scale",
    "A Harmonic Minor Scale",
    A_HARM,
    RH_AHarm,
    LH_AHarm,
    80
  ),
  pianoScale(
    "piano-e-harmonic-minor-scale",
    "E Harmonic Minor Scale",
    E_HARM,
    RH_EHarm,
    LH_EHarm,
    76
  ),
  pianoScale(
    "piano-d-harmonic-minor-scale",
    "D Harmonic Minor Scale",
    D_HARM,
    RH_DHarm,
    LH_DHarm,
    80
  ),
  pianoScale(
    "piano-b-harmonic-minor-scale",
    "B Harmonic Minor Scale",
    B_HARM,
    RH_BHarm,
    LH_BHarm,
    72
  ),
  pianoScale(
    "piano-g-harmonic-minor-scale",
    "G Harmonic Minor Scale",
    G_HARM,
    RH_GHarm,
    LH_GHarm,
    76
  ),
  pianoScale(
    "piano-fs-harmonic-minor-scale",
    "F♯ Harmonic Minor Scale",
    Fs_HARM,
    RH_FsHarm,
    LH_FsHarm,
    68
  ),
  pianoScale(
    "piano-c-harmonic-minor-scale",
    "C Harmonic Minor Scale",
    C_HARM,
    RH_CHarm,
    LH_CHarm,
    76
  ),
  pianoScale(
    "piano-cs-harmonic-minor-scale",
    "C♯ Harmonic Minor Scale",
    Cs_HARM,
    RH_CsHarm,
    LH_CsHarm,
    68
  ),
  pianoScale(
    "piano-f-harmonic-minor-scale",
    "F Harmonic Minor Scale",
    F_HARM,
    RH_FHarm,
    LH_FHarm,
    72
  ),
  pianoScale(
    "piano-gs-harmonic-minor-scale",
    "G♯ Harmonic Minor Scale",
    Gs_HARM,
    RH_GsHarm,
    LH_GsHarm,
    68
  ),
  pianoScale(
    "piano-bb-harmonic-minor-scale",
    "B♭ Harmonic Minor Scale",
    Bb_HARM,
    RH_BbHarm,
    LH_BbHarm,
    68
  ),
  pianoScale(
    "piano-eb-harmonic-minor-scale",
    "D♯/E♭ Harmonic Minor Scale",
    Eb_HARM,
    RH_EbHarm,
    LH_EbHarm,
    68
  ),

  // === MELODIC MINOR SCALES (circle of fifths, alternating) ===
  pianoScale("piano-a-melodic-minor-scale", "A Melodic Minor Scale", A_MELOD, RH_Am, LH_Am, 80),
  pianoScale("piano-e-melodic-minor-scale", "E Melodic Minor Scale", E_MELOD, RH_Em, LH_Em, 76),
  pianoScale("piano-d-melodic-minor-scale", "D Melodic Minor Scale", D_MELOD, RH_Dm, LH_Dm, 80),
  pianoScale("piano-b-melodic-minor-scale", "B Melodic Minor Scale", B_MELOD, RH_Bm, LH_Bm, 72),
  pianoScale("piano-g-melodic-minor-scale", "G Melodic Minor Scale", G_MELOD, RH_Gm, LH_Gm, 76),
  pianoScale(
    "piano-fs-melodic-minor-scale",
    "F♯ Melodic Minor Scale",
    Fs_MELOD,
    RH_Fsm,
    LH_Fsm,
    68
  ),
  pianoScale("piano-c-melodic-minor-scale", "C Melodic Minor Scale", C_MELOD, RH_Cm, LH_Cm, 76),
  pianoScale(
    "piano-cs-melodic-minor-scale",
    "C♯ Melodic Minor Scale",
    Cs_MELOD,
    RH_Csm,
    LH_Csm,
    68
  ),
  pianoScale("piano-f-melodic-minor-scale", "F Melodic Minor Scale", F_MELOD, RH_Fm, LH_Fm, 72),
  pianoScale(
    "piano-gs-melodic-minor-scale",
    "G♯ Melodic Minor Scale",
    Gs_MELOD,
    RH_Gsm,
    LH_Gsm,
    68
  ),
  pianoScale(
    "piano-bb-melodic-minor-scale",
    "B♭ Melodic Minor Scale",
    Bb_MELOD,
    RH_Bbm,
    LH_Bbm,
    68
  ),
  pianoScale(
    "piano-eb-melodic-minor-scale",
    "D♯/E♭ Melodic Minor Scale",
    Eb_MELOD,
    RH_Ebm,
    LH_Ebm,
    68
  ),

  // === GUITAR EXERCISES ===
  {
    id: "guitar-e-minor-pentatonic",
    instrument: "guitar",
    name: "E Minor Pentatonic",
    defaultTempo: 94,
    fingering: {
      type: "guitar",
      positions: [
        { string: 6, fret: 0 },
        { string: 6, fret: 3, finger: 3 },
        { string: 5, fret: 0 },
        { string: 5, fret: 2, finger: 2 },
        { string: 4, fret: 0 },
        { string: 4, fret: 2, finger: 2 },
        { string: 3, fret: 0 },
        { string: 3, fret: 2, finger: 2 },
        { string: 2, fret: 0 },
        { string: 2, fret: 3, finger: 3 },
        { string: 1, fret: 0 },
        { string: 1, fret: 3, finger: 3 },
      ],
    },
  },
  {
    id: "guitar-open-chord-switches",
    instrument: "guitar",
    name: "Open Chord Switches",
    defaultTempo: 72,
    fingering: {
      type: "guitar",
      positions: [
        { string: 6, fret: 3, finger: 2 },
        { string: 5, fret: 2, finger: 1 },
        { string: 4, fret: 0 },
        { string: 3, fret: 0 },
        { string: 2, fret: 0 },
        { string: 1, fret: 3, finger: 3 },
      ],
    },
  },
  {
    id: "guitar-alternate-picking-1234",
    instrument: "guitar",
    name: "Alternate Picking 1-2-3-4",
    defaultTempo: 90,
    fingering: {
      type: "guitar",
      startFret: 1,
      positions: [
        { string: 6, fret: 1, finger: 1 },
        { string: 6, fret: 2, finger: 2 },
        { string: 6, fret: 3, finger: 3 },
        { string: 6, fret: 4, finger: 4 },
        { string: 5, fret: 1, finger: 1 },
        { string: 5, fret: 2, finger: 2 },
        { string: 5, fret: 3, finger: 3 },
        { string: 5, fret: 4, finger: 4 },
      ],
    },
  },
];

export const VARIATIONS: Variation[] = [
  { id: "straight", name: "Straight", description: "Even subdivisions" },
  { id: "staccato", name: "Staccato", description: "Short and detached" },
  { id: "accent-2-and-4", name: "Accent 2&4", description: "Accent backbeat" },
  { id: "crescendo", name: "Crescendo", description: "Get louder each pass" },
];
