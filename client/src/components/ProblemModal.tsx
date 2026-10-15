import { useState, useMemo } from 'react';
import { Search, X, CheckCircle2, ChevronRight, Tag, Percent } from 'lucide-react';
import type { CodingProblem } from '../types';
import { PROBLEMS } from '../data/problems';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProblemId: string;
  onSelectProblem: (problem: CodingProblem) => void;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  currentProblemId,
  onSelectProblem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set<string>();
    PROBLEMS.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' || p.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (!isOpen) return null;

  const getDifficultyBadge = (diff: CodingProblem['difficulty']) => {
    switch (diff) {
      case 'Easy':
        return { label: 'קל', color: 'text-mint-400 bg-mint-950/70 border-mint-500/40' };
      case 'Medium':
        return { label: 'בינוני', color: 'text-amber-400 bg-amber-950/60 border-amber-500/40' };
      case 'Hard':
        return { label: 'קשה', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-[#0a0f14]/95 border border-mint-500/25 shadow-[0_0_50px_rgba(45,212,191,0.12)] overflow-hidden" dir="rtl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#0d141b]/90 flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-8 h-8 rounded-full bg-mint-500/10 border border-mint-500/30 flex items-center justify-center shadow-glow-mint">
              <Tag className="w-4 h-4 text-mint-400" />
            </div>
            <div className="text-right">
              <h2 className="text-sm font-bold text-white tracking-wide">
                בנק בעיות LeetCode
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                10 אתגרי ראיונות טכניים סטנדרטיים
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#111822] border border-white/5 text-slate-400 hover:text-white hover:border-mint-500/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#0a0f14]/90 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-mint-400 absolute right-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="חיפוש בעיות לפי כותרת, תגית או קטגוריה..."
              className="w-full bg-[#111822] border border-white/10 rounded-full pr-11 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-mint-400/60 focus:ring-1 focus:ring-mint-500/40 text-right transition-all"
              autoFocus
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Difficulty Tabs */}
            <div className="flex items-center space-x-1 space-x-reverse bg-[#111822] p-1 rounded-full border border-white/5">
              {[
                { id: 'All', label: 'הכל' },
                { id: 'Easy', label: 'קל' },
                { id: 'Medium', label: 'בינוני' },
                { id: 'Hard', label: 'קשה' }
              ].map(diff => (
                <button
                  key={diff.id}
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    selectedDifficulty === diff.id
                      ? 'bg-gradient-to-r from-mint-400 to-emerald-400 text-[#060809] font-bold shadow-glow-mint'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>

            {/* Category selector */}
            <div className="flex items-center space-x-1.5 space-x-reverse overflow-x-auto py-0.5 max-w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-mint-950/80 text-mint-300 border border-mint-500/40 shadow-glow-mint'
                      : 'bg-[#111822] text-slate-400 hover:text-slate-200 border border-white/5 hover:border-mint-500/20'
                  }`}
                >
                  {cat === 'All' ? 'כל הקטגוריות' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
          {filteredProblems.map(p => {
            const isCurrent = p.id === currentProblemId;
            const diffBadge = getDifficultyBadge(p.difficulty);
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProblem(p);
                  onClose();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isCurrent
                    ? 'bg-gradient-to-r from-mint-950/40 to-[#0e161f] border-mint-500/50 shadow-glow-card-mint'
                    : 'bg-[#0d141b]/80 border-white/5 hover:border-mint-500/30 hover:bg-[#111a24]'
                }`}
              >
                <div className="space-y-1.5 flex-1 pl-4 text-right">
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <span className="font-semibold text-slate-100 text-xs sm:text-sm group-hover:text-mint-300 transition-colors">
                      {p.title}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] border font-semibold ${diffBadge.color}`}
                    >
                      {diffBadge.label}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center space-x-1 space-x-reverse text-[10px] text-mint-300 bg-mint-950/80 px-2.5 py-0.5 rounded-full border border-mint-500/50 font-bold shadow-glow-mint">
                        <CheckCircle2 className="w-3 h-3 text-mint-400" />
                        <span>סשן פעיל</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">{p.category}</span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center space-x-1 space-x-reverse text-slate-400 font-mono" dir="ltr">
                      <Percent className="w-3 h-3 text-mint-400" />
                      <span>{p.acceptanceRate}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center space-x-1.5 space-x-reverse">
                      {p.tags.map(t => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-[#131d27] text-[10px] text-slate-300 border border-white/5"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs text-slate-500 group-hover:text-mint-400 flex items-center space-x-1 space-x-reverse transition-colors">
                    <span>בחר</span>
                    <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              לא נמצאו אתגרי ראיון התואמים לחיפוש "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
