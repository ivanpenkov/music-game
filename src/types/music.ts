export type PlaybackDirection = 'random' | 'ascending' | 'descending' | 'harmonic';
export type ActivePlaybackDirection = 'ascending' | 'descending' | 'harmonic';

export type InstrumentType = 'piano' | 'synth';
export type RootNoteMode = 'random' | 'fixed'; // fixed = Middle C (C4)
export type GameMode = 'practice' | 'challenge';

export interface Interval {
  id: string;
  name: string;
  shortName: string;
  semitones: number;
  altName?: string;
  mnemonic?: string;
}

export interface Note {
  midi: number;
  name: string;
  frequency: number;
  octave: number;
  pitchClass: string; // e.g. "C", "C#", "D", etc.
  isBlack: boolean;
}

export interface Question {
  id: string;
  rootNote: Note;
  targetNote: Note;
  interval: Interval;
  direction: ActivePlaybackDirection;
  answeredInterval?: Interval;
  isCorrect?: boolean;
  timestamp: number;
}

export interface GameSettings {
  playbackDirection: PlaybackDirection;
  instrument: InstrumentType;
  rootNoteMode: RootNoteMode;
  includeOctave: boolean;
  tempo: 'slow' | 'normal' | 'fast';
  volume: number;
}

export interface ChallengeState {
  isActive: boolean;
  totalQuestions: number; // 10 or 20
  currentQuestionIndex: number;
  history: Question[];
  isFinished: boolean;
  startTime: number;
  endTime?: number;
}

export interface PracticeStats {
  streak: number;
  bestStreak: number;
  totalAnswered: number;
  totalCorrect: number;
  intervalStats: Record<string, { correct: number; total: number }>;
}

