// Comprehensive music theory & interval arithmetic verification

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEY_INDICES = [1, 3, 6, 8, 10];

const BASE_INTERVALS = [
  { id: 'm2', name: 'Minor 2nd', semitones: 1 },
  { id: 'M2', name: 'Major 2nd', semitones: 2 },
  { id: 'm3', name: 'Minor 3rd', semitones: 3 },
  { id: 'M3', name: 'Major 3rd', semitones: 4 },
  { id: 'P4', name: 'Perfect 4th', semitones: 5 },
  { id: 'TT', name: 'Dim 5th / Aug 4th', semitones: 6 },
  { id: 'P5', name: 'Perfect 5th', semitones: 7 },
  { id: 'm6', name: 'Minor 6th', semitones: 8 },
  { id: 'M6', name: 'Major 6th', semitones: 9 },
  { id: 'm7', name: 'Minor 7th', semitones: 10 },
  { id: 'M7', name: 'Major 7th', semitones: 11 },
  { id: 'P8', name: 'Perfect Octave', semitones: 12 }
];

function midiToNote(midi) {
  const pitchIndex = ((midi % 12) + 12) % 12;
  const pitchClass = PITCH_CLASSES[pitchIndex];
  const octave = Math.floor(midi / 12) - 1;
  const frequency = 440 * Math.pow(2, (midi - 69) / 12);
  const isBlack = BLACK_KEY_INDICES.includes(pitchIndex);
  return { midi, name: `${pitchClass}${octave}`, frequency, octave, pitchClass, isBlack };
}

function assert(condition, message) {
  if (!condition) {
    console.error('FAIL:', message);
    process.exit(1);
  }
}

console.log('Testing Music Theory Core...');

// 1. Intervals count
assert(BASE_INTERVALS.length === 12, '12 chromatic intervals');

// 2. Semitone sequence
BASE_INTERVALS.forEach((interval, idx) => {
  assert(interval.semitones === idx + 1, `Interval ${interval.id} must be ${idx + 1} semitones`);
});

// 3. Middle C (60)
const c4 = midiToNote(60);
assert(c4.name === 'C4', '60 is C4');
assert(Math.round(c4.frequency) === 262, 'C4 is ~262Hz');

// 4. Concert A (69)
const a4 = midiToNote(69);
assert(a4.name === 'A4', '69 is A4');
assert(Math.round(a4.frequency) === 440, 'A4 is 440Hz');

// 5. Tritone (Diminished 5th / Augmented 4th) from C4
const tritoneFromC4 = midiToNote(60 + 6);
assert(tritoneFromC4.name === 'F#4', 'C4 + 6 semitones is F#4');
assert(tritoneFromC4.isBlack === true, 'F#4 is black key');

// 6. Perfect 5th from C4
const p5FromC4 = midiToNote(60 + 7);
assert(p5FromC4.name === 'G4', 'C4 + 7 semitones is G4');
assert(p5FromC4.isBlack === false, 'G4 is white key');

console.log('ALL TESTS PASSED SUCCESSFULLY! ✓');

