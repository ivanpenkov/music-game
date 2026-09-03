import React from 'react';
import { Interval, Question } from '../types/music';
import { Check, X, Sparkles } from 'lucide-react';

interface IntervalGridProps {
  intervals: Interval[];
  currentQuestion: Question;
  isAnswered: boolean;
  onSelectInterval: (interval: Interval) => void;
  disabled: boolean;
}

export const IntervalGrid: React.FC<IntervalGridProps> = ({
  intervals,
  currentQuestion,
  isAnswered,
  onSelectInterval,
  disabled
}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Identify The Interval
        </h3>
        <span className="text-[11px] text-slate-500">
          Select from the grid below
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {intervals.map((interval, index) => {
          const isSelected = currentQuestion.answeredInterval?.id === interval.id;
          const isTarget = currentQuestion.interval.id === interval.id;

          let btnStyle = 'bg-studio-900/90 text-slate-200 border-white/10 hover:border-indigo-500/50 hover:bg-studio-850 hover:shadow-md';
          let badgeStyle = 'bg-studio-800 text-slate-400';

          if (isAnswered) {
            if (isTarget) {
              // The correct answer
              btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald font-bold';
              badgeStyle = 'bg-emerald-700/80 text-white';
            } else if (isSelected && !isTarget) {
              // Wrong answer selected by user
              btnStyle = 'bg-rose-600/90 text-white border-rose-500 shadow-glow-rose line-through';
              badgeStyle = 'bg-rose-800 text-white';
            } else {
              // Neutral other buttons
              btnStyle = 'bg-studio-950/40 text-slate-500 border-white/5 opacity-50';
              badgeStyle = 'bg-studio-900 text-slate-600';
            }
          }

          return (
            <button
              key={interval.id}
              onClick={() => onSelectInterval(interval)}
              disabled={disabled || isAnswered}
              className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-150 active:scale-95 group ${btnStyle}`}
            >
              {/* Shortcut number indicator */}
              <span className="absolute top-1.5 left-2 text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                {index + 1 <= 9 ? index + 1 : index === 9 ? '0' : ''}
              </span>

              {/* Status icon badge */}
              {isAnswered && isTarget && (
                <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-white text-emerald-600">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
              {isAnswered && isSelected && !isTarget && (
                <span className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-white text-rose-600">
                  <X className="w-3 h-3 stroke-[3]" />
                </span>
              )}

              {/* Interval Short Name */}
              <span className="text-base sm:text-lg font-black tracking-tight mt-1">
                {interval.shortName}
              </span>

              {/* Full Interval Name */}
              <span className="text-[11px] font-medium text-center truncate max-w-full px-1">
                {interval.name}
              </span>

              {/* Semitone indicator badge */}
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full mt-2 ${badgeStyle}`}>
                {interval.semitones} {interval.semitones === 1 ? 'semi' : 'semis'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mnemonic helper hint after answering */}
      {isAnswered && currentQuestion.interval.mnemonic && (
        <div className="mt-1 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center gap-2.5 text-xs text-indigo-200 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>
            <strong>Memory Mnemonic:</strong> Think of <em>&ldquo;{currentQuestion.interval.mnemonic}&rdquo;</em> to recognize a {currentQuestion.interval.name}.
          </span>
        </div>
      )}
    </div>
  );
};

