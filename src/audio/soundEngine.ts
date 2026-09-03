import { Note, InstrumentType, ActivePlaybackDirection } from '../types/music';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Synthesizes an acoustic piano note using multiple physical harmonic partials,
   * micro-detuning (simulating 2-3 piano strings per hammer), and a hammer strike transient.
   */
  private playPianoNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Master node for this note
    const noteGain = ctx.createGain();
    noteGain.connect(this.masterGain);

    // Filter to simulate natural piano soundboard warm frequency response
    const soundboardFilter = ctx.createBiquadFilter();
    soundboardFilter.type = 'lowpass';
    soundboardFilter.frequency.setValueAtTime(Math.min(freq * 8, 8000), startTime);
    soundboardFilter.frequency.exponentialRampToValueAtTime(Math.min(freq * 2.5, 4000), startTime + duration);
    soundboardFilter.connect(noteGain);

    // Harmonic partial weights for an acoustic grand piano
    const harmonics = [
      { mult: 1, gain: 0.65, decayFactor: 1.0 },
      { mult: 2, gain: 0.35, decayFactor: 0.85 },
      { mult: 3, gain: 0.20, decayFactor: 0.65 },
      { mult: 4, gain: 0.12, decayFactor: 0.50 },
      { mult: 5, gain: 0.08, decayFactor: 0.40 },
      { mult: 6, gain: 0.05, decayFactor: 0.30 },
    ];

    harmonics.forEach(({ mult, gain, decayFactor }) => {
      // Create a pair of slightly detuned oscillators for string chorus
      [-1.2, 1.2].forEach((detuneCents) => {
        const osc = ctx.createOscillator();
        const partialGain = ctx.createGain();

        osc.type = mult === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mult, startTime);
        osc.detune.setValueAtTime(detuneCents, startTime);

        // Amplitude envelope for this harmonic
        const peakGain = (gain / 2) * Math.min(1, 400 / freq);
        partialGain.gain.setValueAtTime(0.0001, startTime);
        // Hammer attack
        partialGain.gain.linearRampToValueAtTime(peakGain, startTime + 0.008);
        // Decay
        const noteDecayTime = duration * decayFactor;
        partialGain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDecayTime);

        osc.connect(partialGain);
        partialGain.connect(soundboardFilter);

        osc.start(startTime);
        osc.stop(startTime + noteDecayTime + 0.05);
      });
    });

    // Hammer strike transient: subtle filtered noise click
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.02); // 20ms burst
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(freq * 1.5, startTime);
      noiseFilter.Q.setValueAtTime(3, startTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.02);

      noise.connect(noiseFilter);
      noiseFilter.connect(noteGain);

      noise.start(startTime);
      noise.stop(startTime + 0.03);
    } catch {
      // Fallback in environments without audio buffer support
    }
  }

  /**
   * Synthesizes a warm, analog synth tone (triangle + sub-octave sine)
   */
  private playSynthNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    const noteGain = ctx.createGain();
    noteGain.connect(this.masterGain);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, startTime);
    filter.frequency.exponentialRampToValueAtTime(600, startTime + duration);
    filter.Q.setValueAtTime(2, startTime);
    filter.connect(noteGain);

    // Main oscillator (Triangle)
    const osc1 = ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Warm second oscillator (Sine wave)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq, startTime);
    osc2.detune.setValueAtTime(4, startTime); // subtle 4 cents spread

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    gain1.gain.setValueAtTime(0.35, startTime);
    gain2.gain.setValueAtTime(0.25, startTime);

    // Envelope
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.6, startTime + 0.025); // 25ms attack
    noteGain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.3); // decay
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // release

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(filter);
    gain2.connect(filter);

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  /**
   * Play an individual note
   */
  public playSingleNote(note: Note, instrument: InstrumentType = 'piano', duration = 1.0) {
    this.initContext();
    if (!this.ctx) return;
    const startTime = this.ctx.currentTime;
    if (instrument === 'piano') {
      this.playPianoNote(note.frequency, startTime, duration);
    } else {
      this.playSynthNote(note.frequency, startTime, duration);
    }
  }

  /**
   * Play an interval (two notes) with precise scheduling
   */
  public playInterval(
    note1: Note,
    note2: Note,
    direction: ActivePlaybackDirection,
    instrument: InstrumentType = 'piano',
    tempo: 'slow' | 'normal' | 'fast' = 'normal',
    onNoteStart?: (noteIndex: 1 | 2) => void
  ): Promise<void> {
    this.initContext();
    if (!this.ctx) return Promise.resolve();

    const noteDuration = tempo === 'slow' ? 1.4 : tempo === 'fast' ? 0.7 : 1.0;
    const gapTime = tempo === 'slow' ? 1.0 : tempo === 'fast' ? 0.5 : 0.75;
    const startTime = this.ctx.currentTime + 0.05;

    return new Promise((resolve) => {
      if (direction === 'harmonic') {
        // Both notes sound simultaneously
        if (instrument === 'piano') {
          this.playPianoNote(note1.frequency, startTime, noteDuration * 1.2);
          this.playPianoNote(note2.frequency, startTime, noteDuration * 1.2);
        } else {
          this.playSynthNote(note1.frequency, startTime, noteDuration * 1.2);
          this.playSynthNote(note2.frequency, startTime, noteDuration * 1.2);
        }

        if (onNoteStart) {
          setTimeout(() => onNoteStart(1), 50);
          setTimeout(() => onNoteStart(2), 50);
        }

        setTimeout(() => {
          resolve();
        }, (noteDuration * 1.2 + 0.1) * 1000);

      } else {
        // Sequential playback (ascending or descending)
        if (instrument === 'piano') {
          this.playPianoNote(note1.frequency, startTime, noteDuration);
          this.playPianoNote(note2.frequency, startTime + gapTime, noteDuration);
        } else {
          this.playSynthNote(note1.frequency, startTime, noteDuration);
          this.playSynthNote(note2.frequency, startTime + gapTime, noteDuration);
        }

        if (onNoteStart) {
          setTimeout(() => onNoteStart(1), 50);
          setTimeout(() => onNoteStart(2), (gapTime + 0.05) * 1000);
        }

        setTimeout(() => {
          resolve();
        }, (gapTime + noteDuration + 0.1) * 1000);
      }
    });
  }

  /**
   * Sound effect for a correct guess
   */
  public playCorrectSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.4);
    });
  }

  /**
   * Sound effect for an incorrect guess
   */
  public playIncorrectSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.25);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const soundEngine = new SoundEngine();
