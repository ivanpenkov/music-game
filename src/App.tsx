import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GameMode,
  GameSettings,
  PracticeStats,
  Question,
  Interval,
  ChallengeState,
  InstrumentType
} from './types/music';
import { BASE_INTERVALS, generateQuestion } from './utils/musicTheory';
import { soundEngine } from './audio/soundEngine';
import { Header } from './components/Header';
import { SettingsBar } from './components/SettingsBar';
import { PlaybackCard } from './components/PlaybackCard';
import { IntervalGrid } from './components/IntervalGrid';
import { PianoVisualizer } from './components/PianoVisualizer';
import { ChallengeModal } from './components/ChallengeModal';
import confetti from 'canvas-confetti';

const STORAGE_KEY_SETTINGS = 'ear_interval_settings';
const STORAGE_KEY_STATS = 'ear_interval_stats';

const DEFAULT_SETTINGS: GameSettings = {
  playbackDirection: 'random',
  instrument: 'piano',
  rootNoteMode: 'random',
  includeOctave: false,
  tempo: 'normal',
  volume: 0.8
};

const DEFAULT_STATS: PracticeStats = {
  streak: 0,
  bestStreak: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  intervalStats: {}
};

export const App: React.FC = () => {
  // 1. Settings state
  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Stats state
  const [stats, setStats] = useState<PracticeStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  });

  // 3. UI states
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<1 | 2 | null>(null);

  // 4. Question state
  const [currentQuestion, setCurrentQuestion] = useState<Question>(() => generateQuestion(settings));
  const [isAnswered, setIsAnswered] = useState(false);

  // 5. Challenge mode state
  const [challenge, setChallenge] = useState<ChallengeState>({
    isActive: false,
    totalQuestions: 10,
    currentQuestionIndex: 0,
    history: [],
    isFinished: false,
    startTime: 0
  });

  // Ref to track latest state inside async callbacks
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Sync settings to sound engine and localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    soundEngine.setVolume(settings.volume);
  }, [settings]);

  // Sync stats to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  }, [stats]);

  // Determine active interval pool
  const activeIntervals = settings.includeOctave
    ? BASE_INTERVALS
    : BASE_INTERVALS.filter((i) => i.semitones < 12);

  // Sound playback function
  const playNotes = useCallback(
    async (
      question: Question,
      directionOverride?: 'ascending' | 'descending' | 'harmonic'
    ) => {
      if (isPlayingRef.current) return;
      setIsPlaying(true);
      setActiveNoteIndex(null);

      const direction = directionOverride || question.direction;
      try {
        await soundEngine.playInterval(
          question.rootNote,
          question.targetNote,
          direction,
          settings.instrument,
          settings.tempo,
          (noteIdx) => {
            setActiveNoteIndex(noteIdx);
          }
        );
      } finally {
        setIsPlaying(false);
        setActiveNoteIndex(null);
      }
    },
    [settings.instrument, settings.tempo]
  );

  // Auto-play when a new question is loaded
  const nextQuestion = useCallback(() => {
    const q = generateQuestion(settings);
    setCurrentQuestion(q);
    setIsAnswered(false);
    setTimeout(() => {
      playNotes(q);
    }, 250);
  }, [settings, playNotes]);

  // Handle game mode switch
  const handleSelectGameMode = (mode: GameMode, count: number = 10) => {
    setGameMode(mode);
    if (mode === 'challenge') {
      const q = generateQuestion(settings);
      setCurrentQuestion(q);
      setIsAnswered(false);
      setChallenge({
        isActive: true,
        totalQuestions: count,
        currentQuestionIndex: 1,
        history: [],
        isFinished: false,
        startTime: Date.now()
      });
      setTimeout(() => playNotes(q), 300);
    } else {
      setChallenge((prev) => ({ ...prev, isActive: false, isFinished: false }));
      nextQuestion();
    }
  };

  // Handle answer submission
  const handleSelectInterval = (interval: Interval) => {
    if (isAnswered || isPlaying) return;

    const isCorrect = interval.id === currentQuestion.interval.id;
    const answeredQ: Question = {
      ...currentQuestion,
      answeredInterval: interval,
      isCorrect
    };

    setCurrentQuestion(answeredQ);
    setIsAnswered(true);

    if (isCorrect) {
      soundEngine.playCorrectSound();
      // Practice stats
      setStats((prev) => {
        const newStreak = prev.streak + 1;
        const newBest = Math.max(prev.bestStreak, newStreak);
        // Confetti for milestones
        if (newStreak > 0 && newStreak % 5 === 0) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        return {
          ...prev,
          streak: newStreak,
          bestStreak: newBest,
          totalAnswered: prev.totalAnswered + 1,
          totalCorrect: prev.totalCorrect + 1,
          intervalStats: {
            ...prev.intervalStats,
            [interval.id]: {
              correct: (prev.intervalStats[interval.id]?.correct || 0) + 1,
              total: (prev.intervalStats[interval.id]?.total || 0) + 1
            }
          }
        };
      });
    } else {
      soundEngine.playIncorrectSound();
      setStats((prev) => ({
        ...prev,
        streak: 0,
        totalAnswered: prev.totalAnswered + 1,
        intervalStats: {
          ...prev.intervalStats,
          [currentQuestion.interval.id]: {
            correct: prev.intervalStats[currentQuestion.interval.id]?.correct || 0,
            total: (prev.intervalStats[currentQuestion.interval.id]?.total || 0) + 1
          }
        }
      }));
    }

    // If Challenge Mode, update challenge history
    if (challenge.isActive) {
      const updatedHistory = [...challenge.history, answeredQ];
      if (updatedHistory.length >= challenge.totalQuestions) {
        // Finished challenge
        setChallenge((prev) => ({
          ...prev,
          history: updatedHistory,
          isFinished: true,
          endTime: Date.now()
        }));
      } else {
        setChallenge((prev) => ({
          ...prev,
          history: updatedHistory,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        }));
      }
    }
  };

  // Keyboard controls (Space = replay, Enter = next, 1-9 = interval buttons)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when focused on input/sliders
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        playNotes(currentQuestion);
      } else if (e.code === 'Enter') {
        if (isAnswered && !challenge.isFinished) {
          e.preventDefault();
          nextQuestion();
        }
      } else if (!isAnswered && !isPlaying) {
        // Check number key shortcuts
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
          const targetInterval = activeIntervals[keyNum - 1];
          if (targetInterval) {
            e.preventDefault();
            handleSelectInterval(targetInterval);
          }
        } else if (e.key === '0') {
          const targetInterval = activeIntervals[9];
          if (targetInterval) {
            e.preventDefault();
            handleSelectInterval(targetInterval);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isPlaying, currentQuestion, playNotes, nextQuestion, activeIntervals, challenge.isFinished]);

  const handleUpdateSettings = (updates: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      // If includeOctave or rootNoteMode changed, refresh question next round
      return next;
    });
  };

  const handleResetStats = () => {
    if (window.confirm('Reset all practice streak and accuracy history?')) {
      setStats(DEFAULT_STATS);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-studio-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Header */}
      <Header
        gameMode={gameMode}
        onSelectGameMode={handleSelectGameMode}
        stats={stats}
        instrument={settings.instrument}
        onToggleInstrument={(inst: InstrumentType) => handleUpdateSettings({ instrument: inst })}
        volume={settings.volume}
        onChangeVolume={(vol: number) => handleUpdateSettings({ volume: vol })}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
        challengeActive={challenge.isActive}
        challengeProgress={
          challenge.isActive
            ? { current: challenge.currentQuestionIndex, total: challenge.totalQuestions }
            : undefined
        }
      />

      {/* Settings Drawer */}
      {isSettingsOpen && (
        <SettingsBar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetStats={handleResetStats}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Playback Control Card */}
        <PlaybackCard
          currentQuestion={currentQuestion}
          isPlaying={isPlaying}
          activeNoteIndex={activeNoteIndex}
          onPlayOriginal={() => playNotes(currentQuestion)}
          onPlayDirection={(dir) => playNotes(currentQuestion, dir)}
          onNextQuestion={nextQuestion}
          isAnswered={isAnswered}
          instrument={settings.instrument}
        />

        {/* Interval Selection Keypad Grid */}
        <IntervalGrid
          intervals={activeIntervals}
          currentQuestion={currentQuestion}
          isAnswered={isAnswered}
          onSelectInterval={handleSelectInterval}
          disabled={isPlaying}
        />

        {/* Interactive Piano Visualizer */}
        <PianoVisualizer
          currentQuestion={currentQuestion}
          isAnswered={isAnswered}
          isPlaying={isPlaying}
          activeNoteIndex={activeNoteIndex}
          instrument={settings.instrument}
        />
      </main>

      {/* Challenge Results Modal */}
      {challenge.isFinished && (
        <ChallengeModal
          challenge={challenge}
          onRestart={(count) => handleSelectGameMode('challenge', count)}
          onSwitchToPractice={() => handleSelectGameMode('practice')}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 text-center text-xs text-slate-500">
        EarInterval &bull; Professional Ear Training &bull; Ascending, Descending &amp; Harmonic Intervals
      </footer>
    </div>
  );
};

