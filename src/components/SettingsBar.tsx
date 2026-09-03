import React from 'react';
import { GameSettings, PlaybackDirection, RootNoteMode } from '../types/music';
import { Shuffle, ArrowUpRight, ArrowDownRight, Layers, RotateCcw, X } from 'lucide-react';

interface SettingsBarProps {
  settings: GameSettings;
  onUpdateSettings: (updates: Partial<GameSettings>) => void;
  onResetStats: () => void;
  onClose: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  settings,
  onUpdateSettings,
  onResetStats,
  onClose
}) => {
  const directionOptions: { id: PlaybackDirection; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'random', label: 'Random Mixed', icon: <Shuffle className="w-3.5 h-3.5" />, desc: 'Harmonic, ascending, or descending' },
    { id: 'ascending', label: 'Ascending', icon: <ArrowUpRight className="w-3.5 h-3.5" />, desc: 'Lower note then higher' },
    { id: 'descending', label: 'Descending', icon: <ArrowDownRight className="w-3.5 h-3.5" />, desc: 'Higher note then lower' },
    { id: 'harmonic', label: 'Harmonic', icon: <Layers className="w-3.5 h-3.5" />, desc: 'Both notes simultaneously' }
  ];

  const rootOptions: { id: RootNoteMode; label: string; desc: string }[] = [
    { id: 'random', label: 'Random Root', desc: 'Varied root note across C3–G4' },
    { id: 'fixed', label: 'Fixed Root (C4)', desc: 'Always starts on Middle C' }
  ];

  const tempoOptions: ('slow' | 'normal' | 'fast')[] = ['slow', 'normal', 'fast'];

  return (
    <div className="w-full bg-studio-900/95 border-b border-indigo-500/20 backdrop-blur-xl px-4 lg:px-8 py-5 transition-all animate-fadeIn">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300">
              Session Configuration
            </h3>
            <span className="text-xs text-slate-400">Customize how intervals are tested</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Playback Direction */}
          <div className="bg-studio-950/60 p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
            <span className="font-semibold text-slate-300">Playback Mode</span>
            <div className="grid grid-cols-2 gap-1.5">
              {directionOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ playbackDirection: opt.id })}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-medium transition-all ${
                    settings.playbackDirection === opt.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/40'
                      : 'bg-studio-800/80 text-slate-400 hover:text-slate-200 hover:bg-studio-700/60'
                  }`}
                  title={opt.desc}
                >
                  {opt.icon}
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Root Note Range */}
          <div className="bg-studio-950/60 p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
            <span className="font-semibold text-slate-300">Root Note</span>
            <div className="flex flex-col gap-1.5">
              {rootOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ rootNoteMode: opt.id })}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg font-medium transition-all ${
                    settings.rootNoteMode === opt.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-studio-800/80 text-slate-400 hover:text-slate-200 hover:bg-studio-700/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="text-[10px] text-slate-400/80">{opt.id === 'fixed' ? 'C4' : 'C3-G4'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Playback Tempo */}
          <div className="bg-studio-950/60 p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
            <span className="font-semibold text-slate-300">Playback Tempo</span>
            <div className="grid grid-cols-3 gap-1.5">
              {tempoOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => onUpdateSettings({ tempo: t })}
                  className={`py-2 px-2 rounded-lg font-medium uppercase text-center transition-all ${
                    settings.tempo === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-studio-800/80 text-slate-400 hover:text-slate-200 hover:bg-studio-700/60'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.includeOctave}
                onChange={(e) => onUpdateSettings({ includeOctave: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-studio-800 border-white/10 focus:ring-0 cursor-pointer"
              />
              <span className="text-slate-300 text-xs font-medium">Include Octave (P8)</span>
            </label>
          </div>

          {/* Actions & Session Reset */}
          <div className="bg-studio-950/60 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Session Data</span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Clear all active practice streak and accuracy history to start fresh.
              </p>
            </div>
            <button
              onClick={onResetStats}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Practice Stats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

