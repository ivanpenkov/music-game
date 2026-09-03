import React from 'react';
import { GameMode, InstrumentType, PracticeStats } from '../types/music';
import { Volume2, VolumeX, Flame, Trophy, Percent, Music, Sliders } from 'lucide-react';

interface HeaderProps {
  gameMode: GameMode;
  onSelectGameMode: (mode: GameMode, count?: number) => void;
  stats: PracticeStats;
  instrument: InstrumentType;
  onToggleInstrument: (inst: InstrumentType) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  onToggleSettings: () => void;
  isSettingsOpen: boolean;
  challengeActive: boolean;
  challengeProgress?: { current: number; total: number };
}

export const Header: React.FC<HeaderProps> = ({
  gameMode,
  onSelectGameMode,
  stats,
  instrument,
  onToggleInstrument,
  volume,
  onChangeVolume,
  onToggleSettings,
  isSettingsOpen,
  challengeActive,
  challengeProgress
}) => {
  const accuracy = stats.totalAnswered > 0
    ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
    : 0;

  return (
    <header className="w-full border-b border-white/10 bg-studio-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                EarInterval
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                PRO EAR TRAINER
              </span>
            </div>
            <p className="text-xs text-slate-400">Master interval recognition by ear</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-studio-950/80 rounded-xl border border-white/10">
          <button
            onClick={() => onSelectGameMode('practice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'practice'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => onSelectGameMode('challenge', 10)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'challenge' && challengeProgress?.total === 10
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            10-Q Quiz
          </button>
          <button
            onClick={() => onSelectGameMode('challenge', 20)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gameMode === 'challenge' && challengeProgress?.total === 20
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            20-Q Quiz
          </button>
        </div>

        {/* Stats & Quick Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Stats */}
          {!challengeActive ? (
            <div className="flex items-center gap-3 bg-studio-950/60 px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold" title="Current Streak">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span>{stats.streak}</span>
              </div>
              <div className="h-3.5 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-indigo-300 font-medium" title="Best Streak">
                <Trophy className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stats.bestStreak}</span>
              </div>
              <div className="h-3.5 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold" title="Accuracy">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                <span>{accuracy}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-indigo-950/60 px-3.5 py-1.5 rounded-xl border border-indigo-500/30 text-xs">
              <span className="text-indigo-300 font-semibold">Question:</span>
              <span className="font-bold text-white text-sm">
                {challengeProgress?.current} <span className="text-slate-500 font-normal">/</span> {challengeProgress?.total}
              </span>
            </div>
          )}

          {/* Instrument Toggle */}
          <div className="flex items-center p-0.5 bg-studio-950/80 rounded-lg border border-white/10 text-xs">
            <button
              onClick={() => onToggleInstrument('piano')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                instrument === 'piano'
                  ? 'bg-studio-800 text-cyan-300 shadow-sm border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Acoustic Grand Piano"
            >
              🎹 Piano
            </button>
            <button
              onClick={() => onToggleInstrument('synth')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                instrument === 'synth'
                  ? 'bg-studio-800 text-indigo-300 shadow-sm border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Warm Synthesizer"
            >
              🎛️ Synth
            </button>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5 bg-studio-950/80 px-2.5 py-1.5 rounded-lg border border-white/10">
            {volume > 0 ? (
              <Volume2 className="w-4 h-4 text-slate-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
              className="w-16 accent-indigo-500 h-1 bg-slate-700 rounded-lg cursor-pointer"
              title="Master Volume"
            />
          </div>

          {/* Settings Button */}
          <button
            onClick={onToggleSettings}
            className={`p-2 rounded-lg border transition-all ${
              isSettingsOpen
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-studio-950/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
            title="Configure Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

