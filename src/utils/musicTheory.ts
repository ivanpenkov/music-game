import { Interval, Note, GameSettings, ActivePlaybackDirection, Question } from '../types/music';

export const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const BLACK_KEY_INDICES = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

export const BASE_INTERVALS: Interval[] = [
  {
    id: 'm2',
    name: 'Minor 2nd',
    shortName: 'm2',
    semitones: 1,
    altName: 'Half Step / Semitone',
    mnemonic: 'Jaws Theme / Pink Panther'
  },
  {
    id: 'M2',
    name: 'Major 2nd',
    shortName: 'M2',
    semitones: 2,
    altName: 'Whole Step',
    mnemonic: 'Happy Birthday / Frère Jacques'
  },
  {
    id: 'm3',
    name: 'Minor 3rd',
    shortName: 'm3',
    semitones: 3,
    mnemonic: 'Greensleeves / Smoke on the Water'
  },
  {
    id: 'M3',
    name: 'Major 3rd',
    shortName: 'M3',
    semitones: 4,
    mnemonic: 'When the Saints / Kumbaya'
  },
  {
    id: 'P4',
    name: 'Perfect 4th',
    shortName: 'P4',
    semitones: 5,
    mnemonic: 'Here Comes the Bride / Amazing Grace'
  },
  {
    id: 'TT',
    name: 'Dim 5th / Aug 4th',
    shortName: 'TT (d5 / A4)',
    semitones: 6,
    altName: 'Tritone',
    mnemonic: 'The Simpsons / Maria (West Side Story)'
  },
  {
    id: 'P5',
    name: 'Perfect 5th',
    shortName: 'P5',
    semitones: 7,
    mnemonic: 'Star Wars / Twinkle Twinkle Little Star'
  },
  {
    id: 'm6',
    name: 'Minor 6th',
    shortName: 'm6',
    semitones: 8,
    mnemonic: 'The Entertainer / Love Story'
  },
  {
    id: 'M6',
    name: 'Major 6th',
    shortName: 'M6',
    semitones: 9,
    mnemonic: 'NBC Chimes / My Bonnie Lies Over the Ocean'
  },
  {
    id: 'm7',
    name: 'Minor 7th',
    shortName: 'm7',
    semitones: 10,
    mnemonic: 'Star Trek Theme / Somewhere (West Side Story)'
  },
  {
    id: 'M7',
    name: 'Major 7th',
    shortName: 'M7',
    semitones: 11,
    mnemonic: 'Take On Me / Superman Theme'
  },
  {
    id: 'P8',
    name: 'Perfect Octave',
    shortName: 'P8',
    semitones: 12,
    altName: 'Octave',
    mnemonic: 'Somewhere Over the Rainbow'
  }
];

/**
 * Convert MIDI number to Note object
 */
export function midiToNote(midi: number): Note {
  const pitchIndex = ((midi % 12) + 12) % 12;
  const pitchClass = PITCH_CLASSES[pitchIndex];
  const octave = Math.floor(midi / 12) - 1;
  const frequency = 440 * Math.pow(2, (midi - 69) / 12);
  const isBlack = BLACK_KEY_INDICES.includes(pitchIndex);

  return {
    midi,
    name: `${pitchClass}${octave}`,
    frequency,
    octave,
    pitchClass,
    isBlack
  };
}

/**
 * Resolve active playback direction according to user setting.
 * When set to 'random', distributes evenly between ascending, descending, and harmonic.
 */
export function resolveDirection(direction: GameSettings['playbackDirection']): ActivePlaybackDirection {
  if (direction === 'random') {
    const roll = Math.random();
    if (roll < 0.34) return 'harmonic';
    if (roll < 0.67) return 'ascending';
    return 'descending';
  }
  return direction;
}

/**
 * Generate a new interval question
 */
export function generateQuestion(settings: GameSettings, customIntervals?: Interval[]): Question {
  const pool = (customIntervals && customIntervals.length > 0)
    ? customIntervals
    : settings.includeOctave
      ? BASE_INTERVALS
      : BASE_INTERVALS.filter(i => i.semitones < 12);

  const selectedInterval = pool[Math.floor(Math.random() * pool.length)];
  const resolvedDirection = resolveDirection(settings.playbackDirection);

  let baseMidi: number;
  if (settings.rootNoteMode === 'fixed') {
    baseMidi = 60; // Middle C (C4)
  } else {
    // Random root within comfortable range C3 (48) to G4 (67)
    // Keep within bounds so top note doesn't exceed G5 (79)
    const minMidi = 48;
    const maxMidi = 67;
    baseMidi = Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
  }

  let note1Midi: number;
  let note2Midi: number;

  if (resolvedDirection === 'descending') {
    // Starts high, then drops by interval
    note1Midi = baseMidi + selectedInterval.semitones;
    note2Midi = baseMidi;
  } else {
    // Ascending and Harmonic both start at baseMidi and target baseMidi + semitones
    note1Midi = baseMidi;
    note2Midi = baseMidi + selectedInterval.semitones;
  }

  const rootNote = midiToNote(note1Midi);
  const targetNote = midiToNote(note2Midi);

  return {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rootNote,
    targetNote,
    interval: selectedInterval,
    direction: resolvedDirection,
    timestamp: Date.now()
  };
}

/**
 * Get standard 2-octave piano range for visualizer (C3 = 48 to C5 = 72) or C3 to E5
 */
export function getPianoVisualizerRange(notesToInclude: Note[] = []): Note[] {
  let minMidi = 48; // C3
  let maxMidi = 72; // C5

  for (const n of notesToInclude) {
    if (n.midi < minMidi) minMidi = Math.floor(n.midi / 12) * 12; // lower C
    if (n.midi > maxMidi) maxMidi = Math.ceil((n.midi + 1) / 12) * 12; // upper C
  }

  // Cap range reasonably for UI display
  minMidi = Math.max(36, minMidi);
  maxMidi = Math.min(84, maxMidi);

  const keys: Note[] = [];
  for (let m = minMidi; m <= maxMidi; m++) {
    keys.push(midiToNote(m));
  }
  return keys;
}

