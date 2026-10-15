import { useState } from 'react';
import {
  Radio,
  Sparkles,
  ChevronDown,
  Quote,
  ShieldAlert,
  HeartHandshake
} from 'lucide-react';
import type {
  AvatarVisualState,
  InterviewMood,
  PersonaType
} from '../types';
import { PERSONAS } from '../services/interviewerPersona';

interface InterviewerAvatarProps {
  visualState: AvatarVisualState;
  personaType: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  mood: InterviewMood;
  currentCaption: string;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  visualState,
  personaType,
  onSelectPersona,
  mood,
  currentCaption
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activePersona = PERSONAS[personaType];

  const getMoodBadge = (m: InterviewMood) => {
    switch (m) {
      case 'Attentive':
        return { label: 'קשוב/ה', color: 'bg-[#091512] text-[#2dd4bf] border-[#133c32]' };
      case 'Evaluating Strategy':
        return { label: 'מעריך/ה אסטרטגיה', color: 'bg-[#18150c] text-amber-300 border-[#3d3215]' };
      case 'Probing Trade-offs':
        return { label: 'בוחן/ת Trade-offs', color: 'bg-[#140e1a] text-purple-300 border-[#331c47]' };
      case 'Analyzing Traceback':
        return { label: 'מנתח/ת שגיאת ריצה', color: 'bg-[#1a0c0e] text-rose-300 border-[#47171d]' };
      case 'Complexity Review':
        return { label: 'סקירת סיבוכיות', color: 'bg-[#0c141d] text-sky-300 border-[#152e47]' };
      case 'Impressed':
        return { label: 'מתרשם/ת לטובה', color: 'bg-[#091a13] text-[#34d399] border-[#104e33]' };
    }
  };

  const moodBadge = getMoodBadge(mood);

  const getStatusLabel = () => {
    if (personaType === 'mentor') {
      if (visualState === 'THINKING') {
        return { label: 'חושבת...', color: 'text-mint-300 bg-mint-950/80 border-mint-500/40' };
      }
      return { label: 'צ\'אט טקסט', color: 'text-slate-300 bg-[#0c1214] border-[#1a2529]' };
    }
    switch (visualState) {
      case 'SPEAKING':
        return { label: 'מדבר...', color: 'text-[#2dd4bf] bg-[#091714] border-[#2dd4bf]/40 shadow-[0_0_12px_rgba(45,212,191,0.25)]' };
      case 'LISTENING':
        return { label: 'מקשיב...', color: 'text-rose-400 bg-rose-950/60 border-rose-500/40 animate-pulse' };
      case 'THINKING':
        return { label: 'מעריך...', color: 'text-mint-300 bg-mint-950/80 border-mint-500/40' };
      case 'IDLE':
      default:
        return { label: 'פעיל', color: 'text-slate-400 bg-[#0c1214] border-[#1a2529]' };
    }
  };

  const statusLabel = getStatusLabel();

  return (
    <div className="flex flex-col bg-gradient-to-b from-[#090d0f] via-[#070a0c] to-[#060809] border-b border-[#141e22] p-4 relative select-none">
      {/* Top HUD: Seniority & Persona Switcher */}
      <div className="flex items-center justify-between mb-3 z-20">
        {/* Persona Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(prev => !prev)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#0d1416]/90 hover:bg-[#121c20] border border-[#1b282d] hover:border-[#2dd4bf]/40 text-xs text-slate-200 transition-all shadow-sm"
          >
            {personaType === 'mentor' ? (
              <HeartHandshake className="w-3.5 h-3.5 text-[#2dd4bf]" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-[#34d399]" />
            )}
            <span className="font-bold tracking-wide font-sans text-xs text-slate-100">
              {activePersona.name}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              ({personaType === 'mentor' ? 'מנטורית • צ\'אט' : 'Bar Raiser • קול'})
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#090e10]/95 backdrop-blur-2xl border border-[#1c2c31] shadow-[0_12px_40px_rgba(0,0,0,0.7)] py-2.5 z-50 text-right" dir="rtl">
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                בחר דמות מראיין/ת
              </div>

              {(Object.keys(PERSONAS) as PersonaType[]).map(key => {
                const p = PERSONAS[key];
                const isSelected = p.id === personaType;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2.5 text-right flex items-start space-x-2.5 space-x-reverse transition-colors ${
                      isSelected
                        ? 'bg-[#10231e] border-r-2 border-[#2dd4bf] text-white'
                        : 'hover:bg-[#0e171a] text-slate-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {p.id === 'mentor' ? (
                        <HeartHandshake className="w-4 h-4 text-[#2dd4bf]" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-[#34d399]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5 space-x-reverse">
                        <span className="font-bold text-xs">{p.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#131e22] text-[#2dd4bf] font-mono border border-[#1f3036]">
                          {p.seniority}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {p.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood & Status Indicators */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${moodBadge.color}`}
          >
            {moodBadge.label}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center space-x-1 ${statusLabel.color}`}
          >
            {visualState === 'SPEAKING' && <Radio className="w-2.5 h-2.5 animate-spin" />}
            {visualState === 'LISTENING' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping mr-0.5" />
            )}
            <span>{statusLabel.label}</span>
          </span>
        </div>
      </div>

      {/* Hologram Avatar Orb & Radar Rings (ZeBeyond emerald theme) */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Animated Ambient Radar Rings */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 120">
            {/* Outer dotted orbital ring */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={
                visualState === 'SPEAKING'
                  ? 'rgba(45, 212, 191, 0.7)'
                  : visualState === 'LISTENING'
                  ? 'rgba(244, 63, 94, 0.7)'
                  : visualState === 'THINKING'
                  ? 'rgba(16, 185, 129, 0.8)'
                  : 'rgba(34, 48, 54, 0.5)'
              }
              strokeWidth="1.5"
              strokeDasharray="4 6"
              className={
                visualState === 'THINKING' || visualState === 'SPEAKING'
                  ? 'animate-spin-slow'
                  : ''
              }
            />

            {/* Middle Rotating Geometric Arcs */}
            <circle
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke={
                visualState === 'SPEAKING'
                  ? 'rgba(45, 212, 191, 0.9)'
                  : visualState === 'LISTENING'
                  ? 'rgba(244, 63, 94, 0.8)'
                  : visualState === 'THINKING'
                  ? 'rgba(16, 185, 129, 0.9)'
                  : 'rgba(45, 212, 191, 0.25)'
              }
              strokeWidth="2"
              strokeDasharray={
                visualState === 'THINKING'
                  ? '20 30 10 30'
                  : visualState === 'SPEAKING'
                  ? '30 20 40 20'
                  : '15 45'
              }
              className={
                visualState === 'THINKING'
                  ? 'animate-spin-reverse-slow'
                  : visualState === 'LISTENING'
                  ? 'animate-pulse'
                  : ''
              }
            />
          </svg>

          {/* Hologram Core Orb */}
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
              visualState === 'SPEAKING'
                ? 'bg-gradient-to-tr from-[#064e3b] via-[#059669] to-[#2dd4bf] shadow-[0_0_35px_rgba(45,212,191,0.6)] scale-105 ring-2 ring-[#2dd4bf]'
                : visualState === 'LISTENING'
                ? 'bg-gradient-to-tr from-rose-900 via-rose-700 to-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] ring-2 ring-rose-400'
                : visualState === 'THINKING'
                ? 'bg-gradient-to-tr from-[#064e3b] via-[#10b981] to-[#2dd4bf] shadow-[0_0_30px_rgba(16,185,129,0.5)] ring-2 ring-[#10b981] animate-pulse'
                : 'bg-gradient-to-tr from-[#0a1215] to-[#121c20] border border-[#1c2c31] shadow-md'
            }`}
          >
            {/* Visualizer Sound Waves Inside Core */}
            <div className="flex items-center space-x-1">
              {[0.1, 0.4, 0.7, 0.2, 0.6].map((delay, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    visualState === 'SPEAKING'
                      ? 'bg-white animate-sound-wave'
                      : visualState === 'LISTENING'
                      ? 'bg-rose-200 animate-pulse'
                      : visualState === 'THINKING'
                      ? 'bg-mint-200 animate-ping'
                      : 'bg-slate-600 h-2'
                  }`}
                  style={{
                    animationDelay: `${delay}s`,
                    height: visualState === 'SPEAKING' ? undefined : visualState === 'LISTENING' ? '12px' : '4px'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Persona Identity Plate */}
        <div className="text-center mt-2.5 space-y-0.5">
          <div className="flex items-center justify-center space-x-1.5">
            <h2 className="text-sm font-bold text-white tracking-wide">
              {activePersona.name}
            </h2>
            <Sparkles className="w-3.5 h-3.5 text-[#2dd4bf]" />
          </div>
          <p className="text-[11px] text-slate-400">
            {activePersona.title} • <span className="text-slate-500">{activePersona.company}</span>
          </p>
        </div>
      </div>

      {/* Live Subtitles HUD Card */}
      <div className="mt-2 min-h-[50px] rounded-2xl bg-[#090e11]/80 backdrop-blur-md border border-[#162227] p-3 flex items-start space-x-2.5 shadow-inner">
        <Quote className="w-3.5 h-3.5 text-[#2dd4bf] shrink-0 mt-0.5 opacity-80" />
        <div className="flex-1 text-[11px] leading-relaxed select-text font-sans text-right" dir="rtl">
          {currentCaption ? (
            <p className="text-mint-300 animate-in fade-in duration-150">
              {currentCaption}
            </p>
          ) : visualState === 'LISTENING' ? (
            <p className="text-rose-300 italic text-[10px]">
              מקשיב/ה לתשובת המועמד/ת בקול... (האזנה רציפה פעילה)
            </p>
          ) : visualState === 'THINKING' ? (
            <p className="text-mint-400 italic text-[10px]">
              מנתח/ת את האלגוריתם ובודק/ת עקבות הרצה...
            </p>
          ) : (
            <p className="text-slate-400 italic text-[11px]">
              {activePersona.styleDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
