import { useState } from 'react';
import type { CodingProblem } from '../types';
import { BookOpen, CheckCircle, Tag, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface ProblemDescriptionProps {
  problem: CodingProblem;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  const [openHintIndex, setOpenHintIndex] = useState<number | null>(null);

  const toggleHint = (idx: number) => {
    setOpenHintIndex(prev => (prev === idx ? null : idx));
  };

  const getDifficultyColor = (diff: CodingProblem['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-xs text-slate-300 select-text">
      {/* Header Info */}
      <div className="space-y-2 border-b border-cyan-500/15 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          <span className="flex items-center space-x-1 text-slate-400 text-[11px] bg-[#111625] px-2 py-0.5 rounded border border-slate-800">
            <Tag className="w-3 h-3 text-cyan-400" />
            <span>{problem.category}</span>
          </span>
          <span className="text-slate-400 text-[11px] bg-[#111625] px-2 py-0.5 rounded border border-slate-800">
            Acceptance: <span className="text-cyan-400 font-mono">{problem.acceptanceRate}</span>
          </span>
        </div>

        <h1 className="text-base font-bold text-slate-100 font-mono tracking-tight">
          {problem.title}
        </h1>

        {/* Complexity Goals */}
        <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 pt-1">
          <div>
            Time Target: <span className="text-emerald-400 font-bold">{problem.optimalTimeComplexity}</span>
          </div>
          <div>
            Space Target: <span className="text-indigo-400 font-bold">{problem.optimalSpaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="leading-relaxed space-y-3 font-sans text-slate-200">
        {problem.description.split('\n\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>

      {/* Examples */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-mono">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Examples</span>
        </h3>
        {problem.examples.map((ex, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-[#0c111e] border border-cyan-500/15 p-3 space-y-1.5 font-mono text-xs shadow-sm"
          >
            <div className="text-cyan-400 font-semibold text-[11px]">Example {idx + 1}:</div>
            <div className="bg-[#070a12] p-2 rounded-lg border border-slate-800/80 space-y-1">
              <div>
                <span className="text-slate-500">Input: </span>
                <span className="text-slate-200">{ex.input}</span>
              </div>
              <div>
                <span className="text-slate-500">Output: </span>
                <span className="text-emerald-300 font-bold">{ex.output}</span>
              </div>
            </div>
            {ex.explanation && (
              <div className="text-slate-400 pt-1 font-sans text-xs">
                <span className="text-slate-300 font-semibold">Explanation: </span>
                {ex.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-mono">
          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Constraints</span>
        </h3>
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-mono">
          {problem.constraints.map((c, idx) => (
            <li key={idx}>
              <code className="text-amber-300/90 bg-[#0c111e] px-1.5 py-0.5 rounded border border-amber-500/20">
                {c}
              </code>
            </li>
          ))}
        </ul>
      </div>

      {/* Progressive Socratic Hints Accordion */}
      <div className="space-y-2 pt-2 border-t border-cyan-500/15">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 font-mono">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Progressive Socratic Hints ({problem.hints.length})</span>
        </h3>
        <div className="space-y-1.5">
          {problem.hints.map((hint, idx) => {
            const isOpen = openHintIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg bg-[#0c111e] border border-slate-800 overflow-hidden text-xs"
              >
                <button
                  onClick={() => toggleHint(idx)}
                  className="w-full px-3 py-2 text-left flex items-center justify-between text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span className="font-semibold text-[11px]">
                    Hint {idx + 1} {idx === 0 ? '(High-Level Intuition)' : idx === 1 ? '(Data Structure)' : idx === 2 ? '(Algorithm Trick)' : '(Edge Cases)'}
                  </span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 pt-1 text-slate-300 font-sans border-t border-slate-800/60 bg-[#080c16]">
                    {hint}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
