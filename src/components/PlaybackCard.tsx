import React from 'react';
import { Question, InstrumentType } from '../types/music';
import { Play, RotateCw, ArrowRight, Volume2, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';

interface PlaybackCardProps {
  currentQuestion: Question;
  isPlaying: boolean;
  activeNoteIndex: 1 | 2 | null;
  onPlayOriginal: () => void;
  onPlayDirection: (direction: 'ascending' | 'descending' | 'harmonic') => void;
  onNextQuestion: () => void;
  isAnswered: boolean;
  instrument: InstrumentType;
}

export const PlaybackCard: React.FC<PlaybackCardProps> = ({
  currentQuestion,
  isPlaying,
  activeNoteIndex,
  onPlayOriginal,
  onPlayDirection,
  onNextQuestion,
  isAnswered,
  instrument
}) => {
  const directionLabels = {
    ascending: { label: 'Ascending', icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/30' },
    descending: { label: 'Descending', icon: <ArrowDownRight className="w-3.5 h-3.5" />, color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' },
    harmonic: { label: 'Harmonic (Simultaneous)', icon: <Layers className="w-3.5 h-3.5" />, color: 'text-indigo-400 bg-indigo-950/60 border-indigo-500/30' }
  };

  const currentDir = directionLabels[currentQuestion.direction];

  return (
    <div className="studio-card studio-card-glow rounded-2xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden transition-all">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top status bar: direction badge and instrument info */}
      <div className="flex items-center justify-between w-full mb-6 z-10">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${currentDir.color}`}>
          {currentDir.icon}
          <span>{currentDir.label}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-studio-950/60 px-2.5 py-1 rounded-full border border-white/5">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>{instrument === 'piano' ? 'Grand Piano' : 'Warm Synth'}</span>
        </div>
      </div>

      {/* Centerpiece: Big Play / Replay Trigger */}
      <div className="flex flex-col items-center gap-4 my-2 z-10">
        <button
          onClick={onPlayOriginal}
          disabled={isPlaying}
          className={`relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? 'bg-indigo-500 scale-105 shadow-glow-accent'
              : 'bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:scale-105 hover:shadow-glow-accent active:scale-95 text-white'
          }`}
          title="Play interval (Spacebar)"
        >
          {/* Animated audio wave pulsing inside the button when playing */}
          {isPlaying ? (
            <div className="flex items-center justify-center gap-1">
              <span className="w-1.5 bg-white rounded-full animate-wave-1" />
              <span className="w-1.5 bg-white rounded-full animate-wave-2" />
              <span className="w-1.5 bg-white rounded-full animate-wave-3" />
              <span className="w-1.5 bg-white rounded-full animate-wave-4" />
              <span className="w-1.5 bg-white rounded-full animate-wave-5" />
            </div>
          ) : isAnswered ? (
            <RotateCw className="w-10 h-10 text-white transition-transform group-hover:rotate-45" />
          ) : (
            <Play className="w-10 h-10 text-white fill-white ml-1.5 transition-transform group-hover:scale-110" />
          )}
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-200">
            {isPlaying ? (
              <span className="text-cyan-400 font-bold animate-pulse">
                {activeNoteIndex === 1 ? 'Playing Note 1...' : activeNoteIndex === 2 ? 'Playing Note 2...' : 'Playing Interval...'}
              </span>
            ) : isAnswered ? (
              'Replay Interval'
            ) : (
              'Listen to Interval'
            )}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Press <kbd className="px-1.5 py-0.5 bg-studio-800 rounded border border-white/10 text-slate-300 font-mono text-[10px]">Space</kbd> to replay
          </p>
        </div>
      </div>

      {/* Alternative Playback Variations (Available especially after first listen or after answer) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 z-10">
        <span className="text-[11px] text-slate-400 font-medium mr-1">Practice Listening:</span>
        <button
          onClick={() => onPlayDirection('ascending')}
          disabled={isPlaying}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-950/80 border border-white/10 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-300 transition-all"
        >
          <ArrowUpRight className="w-3 h-3 text-cyan-400" />
          <span>Ascending</span>
        </button>
        <button
          onClick={() => onPlayDirection('descending')}
          disabled={isPlaying}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-950/80 border border-white/10 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-amber-300 transition-all"
        >
          <ArrowDownRight className="w-3 h-3 text-amber-400" />
          <span>Descending</span>
        </button>
        <button
          onClick={() => onPlayDirection('harmonic')}
          disabled={isPlaying}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-studio-950/80 border border-white/10 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-indigo-300 transition-all"
        >
          <Layers className="w-3 h-3 text-indigo-400" />
          <span>Together</span>
        </button>
      </div>

      {/* Next Question prompt when answered */}
      {isAnswered && (
        <div className="w-full mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${currentQuestion.isCorrect ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-rose-400 shadow-glow-rose'}`} />
            <div>
              <span className={`text-sm font-bold ${currentQuestion.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentQuestion.isCorrect ? 'Well done!' : 'Incorrect'}
              </span>
              <span className="text-xs text-slate-300 ml-2">
                This is a <strong className="text-white font-bold">{currentQuestion.interval.name}</strong> ({currentQuestion.interval.semitones} semitones)
              </span>
            </div>
          </div>

          <button
            onClick={onNextQuestion}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <span>Next Question</span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-[10px] text-indigo-200 font-mono hidden sm:inline">(Enter)</span>
          </button>
        </div>
      )}
    </div>
  );
};

