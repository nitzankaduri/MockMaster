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

  const getDifficultyBadge = (diff: CodingProblem['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return { label: 'קל', color: 'text-mint-400 bg-mint-950/60 border-mint-500/30' };
      case 'Medium':
        return { label: 'בינוני', color: 'text-amber-400 bg-amber-950/60 border-amber-500/30' };
      case 'Hard':
        return { label: 'קשה', color: 'text-rose-400 bg-rose-950/60 border-rose-500/30' };
    }
  };

  const diffBadge = getDifficultyBadge(problem.difficulty);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6 text-xs text-slate-300 select-text bg-[#060809]" dir="rtl">
      {/* Header Info */}
      <div className="space-y-3 border-b border-[#141e22] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${diffBadge.color}`}>
            {diffBadge.label}
          </span>
          <span className="flex items-center space-x-1.5 space-x-reverse text-slate-300 text-[11px] bg-[#0c1214] px-2.5 py-0.5 rounded-full border border-[#1a2529]">
            <Tag className="w-3 h-3 text-[#2dd4bf]" />
            <span>{problem.category}</span>
          </span>
          <span className="text-slate-400 text-[11px] bg-[#0c1214] px-2.5 py-0.5 rounded-full border border-[#1a2529]">
            אחוז מעבר: <span className="text-[#2dd4bf] font-mono" dir="ltr">{problem.acceptanceRate}</span>
          </span>
        </div>

        <h1 className="text-lg font-bold text-white tracking-tight text-right font-sans">
          {problem.title}
        </h1>

        {/* Complexity Goals */}
        <div className="flex items-center space-x-4 space-x-reverse text-[11px] font-mono text-slate-400 pt-1">
          <div className="px-3 py-1 rounded-full bg-[#090e11] border border-[#162328]">
            יעד זמן: <span className="text-[#2dd4bf] font-bold" dir="ltr">{problem.optimalTimeComplexity}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-[#090e11] border border-[#162328]">
            יעד זיכרון: <span className="text-emerald-400 font-bold" dir="ltr">{problem.optimalSpaceComplexity}</span>
          </div>
        </div>
      </div>

      {/* Problem Description */}
      <div className="leading-relaxed space-y-3 font-sans text-slate-200 text-right text-xs">
        {problem.description.split('\n\n').map((paragraph, idx) => (
          <p key={idx} className="leading-relaxed">{paragraph}</p>
        ))}
      </div>

      {/* Examples (matching ZeBeyond tech cards) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 space-x-reverse font-sans">
          <BookOpen className="w-3.5 h-3.5 text-[#2dd4bf]" />
          <span>דוגמאות</span>
        </h3>
        {problem.examples.map((ex, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/30 transition-all p-3.5 space-y-2 font-mono text-xs shadow-sm"
          >
            <div className="text-[#2dd4bf] font-semibold text-[11px]">דוגמה {idx + 1}:</div>
            <div className="bg-[#060809] p-2.5 rounded-xl border border-[#162227] space-y-1 text-left" dir="ltr">
              <div>
                <span className="text-slate-500">קלט: </span>
                <span className="text-slate-200">{ex.input}</span>
              </div>
              <div>
                <span className="text-slate-500">פלט: </span>
                <span className="text-mint-400 font-bold">{ex.output}</span>
              </div>
            </div>
            {ex.explanation && (
              <div className="text-slate-400 pt-0.5 font-sans text-xs text-right leading-relaxed">
                <span className="text-slate-300 font-semibold">הסבר: </span>
                {ex.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 space-x-reverse font-sans">
          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>אילוצים ומגבלות</span>
        </h3>
        <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
          {problem.constraints.map((c, idx) => (
            <li key={idx} className="flex items-start space-x-2 space-x-reverse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] mt-1.5 shrink-0" />
              <code className="text-amber-300/90 bg-[#090e11] px-2 py-0.5 rounded-lg border border-[#2b2416]" dir="ltr">
                {c}
              </code>
            </li>
          ))}
        </ul>
      </div>

      {/* Progressive Socratic Hints Accordion */}
      <div className="space-y-2.5 pt-3 border-t border-[#141e22]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 space-x-reverse font-sans">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>רמזים סוקרטיים הדרגתיים ({problem.hints.length})</span>
        </h3>
        <div className="space-y-2">
          {problem.hints.map((hint, idx) => {
            const isOpen = openHintIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-[#090e11] border border-[#162328] hover:border-[#2dd4bf]/30 transition-all overflow-hidden text-xs"
              >
                <button
                  onClick={() => toggleHint(idx)}
                  className="w-full px-3.5 py-2.5 text-right flex items-center justify-between text-slate-300 hover:text-[#2dd4bf] transition-colors"
                >
                  <span className="font-semibold text-[11px]">
                    רמז {idx + 1} {idx === 0 ? '(אינטואיציה כללית)' : idx === 1 ? '(מבנה נתונים)' : idx === 2 ? '(טכניקת אלגוריתם)' : '(מקרי קצה)'}
                  </span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {isOpen && (
                  <div className="px-3.5 pb-3.5 pt-1.5 text-slate-300 font-sans border-t border-[#162227] bg-[#070b0d] text-right leading-relaxed">
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
