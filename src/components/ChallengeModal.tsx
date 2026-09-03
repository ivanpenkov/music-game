import React, { useEffect } from 'react';
import { ChallengeState } from '../types/music';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ChallengeModalProps {
  challenge: ChallengeState;
  onRestart: (count: number) => void;
  onSwitchToPractice: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  challenge,
  onRestart,
  onSwitchToPractice
}) => {
  const total = challenge.totalQuestions;
  const correct = challenge.history.filter((q) => q.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);

  const durationSec = Math.round(
    ((challenge.endTime || Date.now()) - challenge.startTime) / 1000
  );
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  let grade = 'F';
  let gradeColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  if (accuracy >= 95) {
    grade = 'A+';
    gradeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (accuracy >= 85) {
    grade = 'A';
    gradeColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  } else if (accuracy >= 75) {
    grade = 'B';
    gradeColor = 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
  } else if (accuracy >= 60) {
    grade = 'C';
    gradeColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  } else if (accuracy >= 50) {
    grade = 'D';
    gradeColor = 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  }

  // Trigger celebratory confetti if grade is A or A+
  useEffect(() => {
    if (accuracy >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [accuracy]);

  // Group performance by interval
  const intervalStats: Record<string, { name: string; correct: number; total: number }> = {};
  challenge.history.forEach((q) => {
    const id = q.interval.id;
    if (!intervalStats[id]) {
      intervalStats[id] = { name: q.interval.name, correct: 0, total: 0 };
    }
    intervalStats[id].total += 1;
    if (q.isCorrect) {
      intervalStats[id].correct += 1;
    }
  });

  const missedList = Object.values(intervalStats).filter((stat) => stat.correct < stat.total);
  const masteredList = Object.values(intervalStats).filter((stat) => stat.correct === stat.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg studio-card border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Challenge Completed!</h2>
              <p className="text-xs text-slate-400">Here is your ear training performance report</p>
            </div>
          </div>

          <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-black text-2xl shadow-lg ${gradeColor}`}>
            {grade}
          </div>
        </div>

        {/* High-level score banner */}
        <div className="grid grid-cols-3 gap-3 bg-studio-950/80 p-4 rounded-xl border border-white/5 text-center">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Score</span>
            <p className="text-lg font-black text-white mt-0.5">{correct} / {total}</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Accuracy</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{accuracy}%</p>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Time</span>
            <p className="text-lg font-black text-indigo-300 mt-0.5 font-mono">{formattedTime}</p>
          </div>
        </div>

        {/* Interval Breakdown */}
        <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
          {missedList.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Intervals to Practice
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missedList.map((m) => (
                  <span key={m.name} className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium">
                    {m.name} ({m.correct}/{m.total})
                  </span>
                ))}
              </div>
            </div>
          )}

          {masteredList.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Mastered Intervals
              </span>
              <div className="flex flex-wrap gap-1.5">
                {masteredList.map((m) => (
                  <span key={m.name} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
                    {m.name} ({m.correct}/{m.total})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => onRestart(total)}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again ({total} Qs)</span>
          </button>
          <button
            onClick={onSwitchToPractice}
            className="w-full sm:w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-studio-800 hover:bg-studio-700 text-slate-200 font-bold text-xs border border-white/10 transition-all active:scale-95"
          >
            <span>Back to Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
