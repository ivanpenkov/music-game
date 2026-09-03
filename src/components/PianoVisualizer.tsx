import React from 'react';
import { Note, Question } from '../types/music';
import { soundEngine } from '../audio/soundEngine';
import { InstrumentType } from '../types/music';

interface PianoVisualizerProps {
  currentQuestion: Question;
  isAnswered: boolean;
  isPlaying: boolean;
  activeNoteIndex: 1 | 2 | null;
  instrument: InstrumentType;
}

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({
  currentQuestion,
  isAnswered,
  isPlaying,
  activeNoteIndex,
  instrument
}) => {
  // Determine range of keys to render
  // Typically 2 octaves: C3 (48) to C5 (72), or extended if notes exceed
  const startMidi = 48; // C3
  const endMidi = 72;   // C5

  const notes: Note[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const blackIndices = [1, 3, 6, 8, 10];
    const pitchIndex = m % 12;
    const isBlack = blackIndices.includes(pitchIndex);
    const octave = Math.floor(m / 12) - 1;
    notes.push({
      midi: m,
      name: `${pitchClasses[pitchIndex]}${octave}`,
      frequency: 440 * Math.pow(2, (m - 69) / 12),
      octave,
      pitchClass: pitchClasses[pitchIndex],
      isBlack
    });
  }

  const whiteNotes = notes.filter((n) => !n.isBlack);

  const isRootNote = (note: Note) => currentQuestion.rootNote.midi === note.midi;
  const isTargetNote = (note: Note) => currentQuestion.targetNote.midi === note.midi;

  const handleKeyClick = (note: Note) => {
    soundEngine.playSingleNote(note, instrument, 0.8);
  };

  return (
    <div className="w-full flex flex-col gap-3 studio-card rounded-2xl p-5 border border-white/10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive Piano Visualizer
          </h3>
          <p className="text-[11px] text-slate-400">
            {isAnswered
              ? 'Highlighted notes reveal the exact pitch positions and interval distance'
              : 'Click any key to audition pitches or reveal notes after answering'}
          </p>
        </div>

        {isAnswered && (
          <div className="flex items-center gap-2 text-xs bg-studio-950/80 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <span className="text-indigo-300 font-bold font-mono">
              {currentQuestion.rootNote.name}
            </span>
            <span className="text-slate-500">&rarr;</span>
            <span className="text-cyan-300 font-bold font-mono">
              {currentQuestion.targetNote.name}
            </span>
            <span className="text-slate-400 ml-1">
              ({currentQuestion.interval.semitones} st)
            </span>
          </div>
        )}
      </div>

      {/* Piano Keyboard Container */}
      <div className="w-full overflow-x-auto pb-2 pt-1 flex justify-center">
        <div className="relative inline-flex select-none h-36 sm:h-40 min-w-[580px] sm:min-w-[660px] p-2 bg-studio-950 rounded-xl border border-white/10 shadow-inner">
          {/* Render White Keys */}
          {whiteNotes.map((note) => {
            const isRoot = isAnswered && isRootNote(note);
            const isTarget = isAnswered && isTargetNote(note);
            const isActivePlaying =
              isPlaying &&
              ((activeNoteIndex === 1 && isRootNote(note)) ||
                (activeNoteIndex === 2 && isTargetNote(note)));

            return (
              <button
                key={note.midi}
                onClick={() => handleKeyClick(note)}
                className={`piano-key-white relative flex-1 h-full rounded-b-md flex flex-col justify-end items-center pb-2 cursor-pointer transition-colors ${
                  isRoot
                    ? 'key-highlight-root'
                    : isTarget
                    ? 'key-highlight-target'
                    : isActivePlaying
                    ? 'bg-amber-300 text-slate-900 shadow-glow-accent'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                style={{ width: '42px', minWidth: '38px', margin: '0 1px' }}
                title={`${note.name} (${Math.round(note.frequency)} Hz)`}
              >
                {/* Note Label */}
                <span className={`text-[10px] font-bold font-mono ${isRoot || isTarget ? 'text-white font-extrabold' : 'text-slate-400'}`}>
                  {note.pitchClass === 'C' ? note.name : note.pitchClass}
                </span>

                {/* Badge if root or target */}
                {isAnswered && (isRoot || isTarget) && (
                  <span className="absolute bottom-6 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/40 text-white">
                    {isRoot ? 'Root' : currentQuestion.interval.shortName}
                  </span>
                )}
              </button>
            );
          })}

          {/* Render Black Keys Absolutely Positioned */}
          {notes.map((note) => {
            if (!note.isBlack) return null;

            const isRoot = isAnswered && isRootNote(note);
            const isTarget = isAnswered && isTargetNote(note);
            const isActivePlaying =
              isPlaying &&
              ((activeNoteIndex === 1 && isRootNote(note)) ||
                (activeNoteIndex === 2 && isTargetNote(note)));

            // Calculate horizontal offset relative to the white keys
            // Find how many white keys precede this black key
            const precedingWhites = notes.filter((n) => !n.isBlack && n.midi < note.midi).length;
            // Each white key is roughly 100% / totalWhiteKeys wide
            // Black key sits centered on the border between two white keys
            const leftPercent = (precedingWhites / whiteNotes.length) * 100;

            return (
              <button
                key={note.midi}
                onClick={() => handleKeyClick(note)}
                className={`piano-key-black absolute top-2 h-20 sm:h-24 w-6 sm:w-7 rounded-b-sm z-20 flex flex-col justify-end items-center pb-1 cursor-pointer transition-colors ${
                  isRoot
                    ? 'key-highlight-root'
                    : isTarget
                    ? 'key-highlight-target'
                    : isActivePlaying
                    ? 'bg-amber-400 shadow-glow-accent'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                style={{
                  left: `calc(${leftPercent}% - 14px)`
                }}
                title={`${note.name} (${Math.round(note.frequency)} Hz)`}
              >
                <span className="text-[9px] font-bold font-mono text-white/90">
                  {note.pitchClass}
                </span>

                {isAnswered && (isRoot || isTarget) && (
                  <span className="absolute bottom-5 px-1 py-0.5 rounded text-[7px] font-black uppercase bg-white/20 text-white">
                    {isRoot ? 'R' : currentQuestion.interval.shortName}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

