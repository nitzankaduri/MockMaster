import { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  Layers,
  Code2,
  Languages
} from 'lucide-react';
import type { CodingProblem } from '../types';
import { ProblemModal } from './ProblemModal';

export type AppMode = 'coding_sandbox' | 'hebrew_interview';

interface HeaderProps {
  currentProblem: CodingProblem;
  onSelectProblem: (problem: CodingProblem) => void;
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetSession: () => void;
  activeMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProblem,
  onSelectProblem,
  isListening,
  onToggleListening,
  isSpeaking,
  isMuted,
  onToggleMute,
  onResetSession,
  activeMode,
  onSelectMode
}) => {
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const diffBadge = getDifficultyBadge(currentProblem.difficulty);

  return (
    <>
      <header className="h-16 px-5 border-b border-[#141e22]/90 bg-[#06090a]/80 backdrop-blur-2xl flex items-center justify-between z-30 select-none">
        {/* Brand & Left Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#2dd4bf] to-[#10b981] flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.4)]">
              <Sparkles className="w-4 h-4 text-[#022019]" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-extrabold text-white tracking-tight text-base font-sans">
                MockMaster
              </span>
              <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-[#0e1619] text-[#2dd4bf] border border-[#1d2d33]">
                PRO
              </span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-[#1a262b] hidden md:block" />

          {/* Central Pill Mode Switcher (ZeBeyond aesthetic) */}
          <div className="flex items-center bg-[#0a0f11]/90 p-1 rounded-full border border-[#182328] shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            <button
              onClick={() => onSelectMode('coding_sandbox')}
              className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeMode === 'coding_sandbox'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_18px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>סביבת ליטקוד</span>
            </button>

            <button
              onClick={() => onSelectMode('hebrew_interview')}
              className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                activeMode === 'hebrew_interview'
                  ? 'bg-gradient-to-r from-[#2dd4bf] to-[#10b981] text-[#022019] shadow-[0_0_18px_rgba(45,212,191,0.35)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-[#2dd4bf]" />
              <span>ראיון בעברית (HR / Tech)</span>
            </button>
          </div>

          {/* Problem Selector Trigger (Only in Coding Mode) */}
          {activeMode === 'coding_sandbox' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0c1214] hover:bg-[#121b1f] border border-[#1a2529] hover:border-[#2dd4bf]/40 text-xs text-slate-200 transition-all shadow-sm group"
            >
              <Layers className="w-3.5 h-3.5 text-[#2dd4bf] group-hover:rotate-12 transition-transform" />
              <span className="truncate max-w-[130px] font-medium text-slate-100">
                {currentProblem.title}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] border font-bold ${diffBadge.color}`}
              >
                {diffBadge.label}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-[#2dd4bf] transition-colors" />
            </button>
          )}
        </div>

        {/* Center: Live Timer (Coding Mode) */}
        {activeMode === 'coding_sandbox' && (
          <div className="hidden md:flex items-center space-x-2 bg-[#090e10]/90 border border-[#162125] px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-mono shadow-inner">
            <Clock className="w-3.5 h-3.5 text-[#2dd4bf] animate-pulse" />
            <span className="text-[#2dd4bf] tracking-widest font-bold" dir="ltr">{formatTimer(timerSeconds)}</span>
            <button
              onClick={() => setIsTimerRunning(prev => !prev)}
              title={isTimerRunning ? 'השהה טיימר' : 'המשך טיימר'}
              className="hover:text-[#2dd4bf] text-slate-500 ml-1 transition-colors"
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setTimerSeconds(0)}
              title="אפס טיימר"
              className="hover:text-[#2dd4bf] text-slate-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Right Controls: Audio & Actions */}
        {activeMode === 'coding_sandbox' ? (
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Audio TTS Mute Toggle */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'בטל השתקת קול AI' : 'השתק קול AI'}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-[#0a0f11] border-[#182328] text-slate-500 hover:text-slate-300'
                  : isSpeaking
                  ? 'bg-mint-950/80 border-[#2dd4bf] text-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.35)] animate-pulse'
                  : 'bg-[#0a0f11] border-[#182328] text-slate-300 hover:text-white hover:border-[#2dd4bf]/40'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Voice Mic Toggle */}
            <button
              onClick={onToggleListening}
              title={isListening ? 'עצור האזנה קולית' : 'הפעל קלט קולי'}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                isListening
                  ? 'bg-[#180d12] border-rose-500/80 text-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.3)] animate-pulse'
                  : 'bg-[#0a0f11] border-[#182328] text-slate-300 hover:text-white hover:border-[#2dd4bf]/40'
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-0.5" />
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">מקשיב...</span>
                </>
              ) : (
                <>
                  <MicOff className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">מיקרופון</span>
                </>
              )}
            </button>

            {/* Restart Session */}
            <button
              onClick={onResetSession}
              title="אפס סשן ראיון מחדש"
              className="w-9 h-9 rounded-full bg-[#0a0f11] border border-[#182328] text-slate-400 hover:text-[#2dd4bf] hover:border-[#2dd4bf]/40 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#0e1619] border border-[#1c2a2f] text-[11px] text-[#2dd4bf] font-mono">
              AI Real-time Behavioral Suite
            </span>
          </div>
        )}
      </header>

      {/* Problem Selection Modal */}
      <ProblemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentProblemId={currentProblem.id}
        onSelectProblem={onSelectProblem}
      />
    </>
  );
};
