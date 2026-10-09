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
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
      case 'Medium':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'Hard':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[#0a0d14] border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-[#0e1320] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-md shadow-cyan-500/30">
              <Tag className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                LeetCode Interview Bank
              </h2>
              <p className="text-[11px] text-slate-400">
                10 Curated Standard Technical Interview Challenges
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0a0d14]/90 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search problems by title, tag, or category..."
              className="w-full bg-[#111625] border border-cyan-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-500/40"
              autoFocus
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Difficulty Tabs */}
            <div className="flex items-center space-x-1 bg-[#111625] p-1 rounded-lg border border-slate-800">
              {['All', 'Easy', 'Medium', 'Hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    selectedDifficulty === diff
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            {/* Category selector */}
            <div className="flex items-center space-x-1 overflow-x-auto py-0.5 max-w-full">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium shrink-0 transition-all ${
                    selectedCategory === cat
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'bg-[#111625] text-slate-400 hover:text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems List Grid */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredProblems.map(p => {
            const isCurrent = p.id === currentProblemId;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProblem(p);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-[#0f1422] border-slate-800/80 hover:border-cyan-500/30 hover:bg-[#131a2c]'
                }`}
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-100 text-xs group-hover:text-cyan-300 transition-colors">
                      {p.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] border font-semibold ${getDifficultyBadge(
                        p.difficulty
                      )}`}
                    >
                      {p.difficulty}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center space-x-1 text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-700/60 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        <span>Active Session</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="text-slate-300 font-medium">{p.category}</span>
                    <span>•</span>
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Percent className="w-3 h-3 text-cyan-500" />
                      <span>{p.acceptanceRate}</span>
                    </span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      {p.tags.map(t => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-[#161f36] text-[10px] text-slate-300 border border-slate-700/50"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 group-hover:text-cyan-400 flex items-center space-x-1 transition-colors">
                    <span>Select</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {filteredProblems.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No interview problems found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

