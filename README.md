# EarInterval - Interactive Ear Training Game

An interactive, high-precision ear training web application designed to master interval recognition. Built with React, TypeScript, Tailwind CSS, and the Web Audio API.

## Features

- **Dual Audio Engine (Zero External Audio Assets)**:
  - **Acoustic Grand Piano**: Physical multi-harmonic synthesis with mallet attack transients, unison string chorus, and realistic resonance decay.
  - **Warm Synthesizer**: Pure sine + warm triangle waves with lowpass filter and musical ADSR envelope.
- **Complete Chromatic Interval Palette**:
  - Minor 2nd (`m2`, 1 semitone)
  - Major 2nd (`M2`, 2 semitones)
  - Minor 3rd (`m3`, 3 semitones)
  - Major 3rd (`M3`, 4 semitones)
  - Perfect 4th (`P4`, 5 semitones)
  - Diminished 5th / Augmented 4th (`TT`, 6 semitones)
  - Perfect 5th (`P5`, 7 semitones)
  - Minor 6th (`m6`, 8 semitones)
  - Major 6th (`M6`, 9 semitones)
  - Minor 7th (`m7`, 10 semitones)
  - Major 7th (`M7`, 11 semitones)
  - Optional Perfect Octave (`P8`, 12 semitones)
- **Flexible Playback Modes**:
  - **Random Mixed**: Randomly varies between simultaneous (harmonic) and sequential (ascending/descending).
  - **Ascending**: Lower note followed by higher note.
  - **Descending**: Higher note followed by lower note.
  - **Harmonic**: Both notes played together simultaneously.
- **Interactive Piano Visualizer**:
  - Full 2-octave piano keyboard displaying exact notes played upon answer reveal.
  - Clickable piano keys to audition any pitch directly.
- **Game & Scoring Modes**:
  - **Continuous Practice Mode**: Real-time streak tracking, best streak, accuracy %, and milestone celebrations.
  - **Challenge Mode (10 or 20 questions)**: Timed round quiz with final report card, letter grade (A+ to F), and breakdown of mastered vs missed intervals.
- **Configurable Settings**:
  - Root Note mode: Random roots across C3–G4 or Fixed Root (Middle C4).
  - Playback Tempo: Slow, Normal, Fast.
  - Master volume slider.
- **Keyboard Shortcuts**:
  - `Space`: Replay current interval.
  - `Enter`: Advance to next question after answering.
  - `1` to `9`, `0`: Select corresponding interval from keypad.

## Getting Started

### Development
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

