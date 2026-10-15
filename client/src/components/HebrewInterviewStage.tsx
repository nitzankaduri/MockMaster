import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Bot,
  User,
  Volume2,
  VolumeX,
  Play,
  Send,
  Sparkles,
  Loader2,
  Key,
  ExternalLink,
  Briefcase,
  RotateCcw
} from 'lucide-react';
import { useHebrewInterviewSession } from '../hooks/useHebrewInterviewSession';
import { DEFAULT_ROLE_PRESETS } from '../types/hebrewInterview';
import { hasGeminiApiKey } from '../services/geminiVoiceService';
import { InterviewReportModal } from './InterviewReportModal';

interface HebrewInterviewStageProps {
  onSwitchToCoding?: () => void;
}

export const HebrewInterviewStage: React.FC<HebrewInterviewStageProps> = ({
  onSwitchToCoding
}) => {
  // Conversational session hook powered by native Gemini audio & STT
  const {
    targetRole,
    setTargetRole,
    isSessionActive,
    currentStage,
    callDuration,
    turns,
    currentSubtitle,
    isListening,
    isSpeaking,
    isAiThinking,
    interimTranscript,
    speechError,
    stopSpeaking,
    toggleListening,
    repeatQuestion,
    submitCurrentSpeech,
    startSession,
    handleCandidateResponse,
    finishInterview,
    restartSession,
    isAnalyzing,
    report,
    showKeyModal,
    setShowKeyModal,
    customKeyInput,
    setCustomKeyInput,
    handleSaveApiKey
  } = useHebrewInterviewSession();

  // Local UI & Media States
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Format call duration MM:SS
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Webcam stream lifecycle
  useEffect(() => {
    let active = true;

    async function initCamera() {
      if (!isCameraOn) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false
        });
        if (active) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        console.warn('Webcam stream unavailable:', e);
        setIsCameraOn(false);
      }
    }

    if (isSessionActive) {
      initCamera();
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isCameraOn, isSessionActive]);

  // Auto-scroll chat drawer
  useEffect(() => {
    if (isChatOpen) {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns, isChatOpen]);

  // End interview and generate report
  const handleEndInterview = async () => {
    try {
      await finishInterview();
      setIsReportOpen(true);
    } catch (err) {
      console.error('Failed to finish interview:', err);
      setIsReportOpen(true);
    }
  };

  // Re-evaluate with custom API key
  const handleReevaluate = async (customKey?: string) => {
    try {
      await finishInterview(customKey);
    } catch (err) {
      console.error('Re-evaluation error:', err);
    }
  };

  // Typed text fallback submit
  const handleSendTypedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleCandidateResponse(textInput.trim());
    setTextInput('');
  };

  // Map stage to Hebrew name
  const stageNameHe: Record<string, string> = {
    intro: 'שלב 1 מתוך 4: היכרות ורקע אישי',
    behavioral: 'שלב 2 מתוך 4: עבודת צוות ומתודולוגיית STAR',
    challenge: 'שלב 3 מתוך 4: מורכבות, לחץ וכישלון',
    wrapup: 'שלב 4 מתוך 4: שאלות המועמד וסיכום',
    completed: 'הראיון הושלם'
  };

  return (
    <div
      dir="rtl"
      className="h-full w-full flex flex-col bg-[#060809] text-slate-100 overflow-hidden relative font-sans select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Pre-start Gate: Welcome & Audio Initiation */}
      {!isSessionActive && (
        <div className="absolute inset-0 z-50 bg-[#060809]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 overflow-y-auto">
          {/* Ambient center bloom */}
          <div className="absolute w-[600px] h-[600px] rounded-full blur-[140px] bg-emerald-500/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
            <div className="w-16 h-16 rounded-full bg-mint-500/10 border border-mint-500/30 flex items-center justify-center shadow-glow-mint mb-5">
              <Volume2 className="w-7 h-7 text-mint-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              סימולציית ראיון עבודה מקצועי בעברית
            </h2>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-mint-950/80 border border-mint-500/40 text-mint-300 text-xs font-mono font-medium mb-6 shadow-glow-mint">
              <Sparkles className="w-3.5 h-3.5 text-mint-400" />
              <span>Google Gemini 2.0 Flash • דיבור קולי טבעי בעברית (Aoede)</span>
            </div>

            {/* Role Configuration Box */}
            <div className="w-full bg-[#0c1218]/90 border border-white/5 rounded-3xl p-6 sm:p-7 mb-6 text-right shadow-glow-card-mint backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-mint-400" />
                  <span>בחר/י או הקלד/י תפקיד לראיון:</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  השאלות יותאמו בזמן אמת לפרופיל זה
                </span>
              </div>

              {/* Custom Role Input */}
              <div className="relative mb-4">
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="הקלד תפקיד (למשל: Full Stack, DevOps, Frontend, Product Manager...)"
                  className="w-full px-5 py-3 rounded-full bg-[#111822] border border-white/10 text-sm text-white placeholder-slate-500 outline-none focus:border-mint-400 focus:ring-1 focus:ring-mint-500/40 transition-all font-medium"
                />
              </div>

              {/* Popular Role Presets */}
              <div className="space-y-2">
                <div className="text-[11px] text-slate-400 font-medium mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-mint-400" />
                  <span>בחירה מהירה מבין תפקידים מובילים:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_ROLE_PRESETS.map((preset) => {
                    const isSelected =
                      targetRole.trim().toLowerCase() === preset.titleEn.toLowerCase() ||
                      targetRole.trim() === preset.titleHe;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setTargetRole(preset.titleEn)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-mint-950/90 border-mint-400 text-mint-200 shadow-glow-mint ring-1 ring-mint-400/50'
                            : 'bg-[#111822] border-white/5 text-slate-400 hover:text-slate-200 hover:border-mint-500/20'
                        }`}
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.titleHe}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => startSession(targetRole)}
                className="btn-mint-hero px-9 py-3.5 rounded-full font-bold text-sm shadow-glow-mint transition-all flex items-center gap-2.5 transform hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>התחל ראיון לתפקיד: {targetRole.trim() || 'Software Engineer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluating Loading Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 bg-[#060809]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-mint-500/10 border border-mint-500/40 flex items-center justify-center shadow-glow-mint mb-5">
            <Loader2 className="w-8 h-8 text-mint-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            מנתח את הראיון עם Google Gemini AI...
          </h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed font-sans">
            מבצע ניתוח מעמיק לפי מתודולוגיית STAR, שולף ציטוטים מדויקים מתשובותיך, ומפיק דוח הערכה מקצועי לראיונות הייטק.
          </p>
        </div>
      )}

      {/* Top Header Strip */}
      <div className="h-14 border-b border-white/5 bg-[#080d12]/90 backdrop-blur-md px-5 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse bg-[#0e151d] px-3 py-1 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-mint-300">
              ראיון חי • {formatTimer(callDuration)}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            רותם — מנהלת גיוס
          </span>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-950/70 border border-mint-500/30 text-mint-300 text-xs font-semibold shadow-glow-mint">
            <Briefcase className="w-3.5 h-3.5 text-mint-400" />
            <span>תפקיד: {targetRole}</span>
          </div>

          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#111822] border border-white/5 text-slate-400 font-mono hidden md:inline">
            Gemini Voice • Aoede
          </span>
        </div>

        {/* Current Stage Indicator */}
        <div className="hidden md:flex items-center space-x-2 space-x-reverse text-xs bg-[#0e151d] border border-white/5 px-4 py-1.5 rounded-full text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-mint-400" />
          <span>{stageNameHe[currentStage] || currentStage}</span>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowKeyModal(true)}
            className="px-3 py-1.5 rounded-full bg-[#111822] hover:bg-[#16212e] border border-white/5 hover:border-mint-500/30 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            title="הגדרות Gemini API"
          >
            <Key className="w-3.5 h-3.5 text-mint-400" />
            <span className="hidden sm:inline">הגדרות API</span>
          </button>

          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full border text-xs flex items-center gap-1.5 transition-all ${
              isChatOpen
                ? 'bg-mint-950/80 border-mint-500/50 text-mint-300 shadow-glow-mint'
                : 'bg-[#111822] border-white/5 text-slate-400 hover:text-slate-200 hover:border-mint-500/20'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">תמלול ({turns.length})</span>
          </button>
        </div>
      </div>

      {/* Main Video Call Stage */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 relative">
        {/* Main Stage: Holographic Interviewer */}
        <div className="flex-1 rounded-3xl bg-[#080d12] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {/* Ambient Glow */}
          <div
            className={`absolute w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
              isSpeaking
                ? 'bg-emerald-500/20 scale-125'
                : isListening
                ? 'bg-teal-500/18 scale-110'
                : 'bg-emerald-500/10 scale-100'
            }`}
          />

          {/* Interactive Persona Avatar */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Holographic Concentric Rings */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Outer Dashed Orbiting Ring */}
              <div
                className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 ${
                  isSpeaking
                    ? 'border-mint-400/80 animate-spin'
                    : isListening
                    ? 'border-mint-400/60 animate-pulse'
                    : 'border-white/10'
                }`}
                style={{ animationDuration: isSpeaking ? '5s' : '18s' }}
              />

              {/* Middle Pulsing Ring */}
              <div
                className={`absolute inset-3 sm:inset-4 rounded-full border transition-all duration-500 ${
                  isSpeaking
                    ? 'border-mint-400 shadow-glow-mint scale-105'
                    : isListening
                    ? 'border-emerald-500/70 shadow-glow-mint scale-105'
                    : 'border-white/5'
                }`}
              />

              {/* Core Avatar Sphere */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#060809] via-[#0d161d] to-[#122227] border border-mint-400/40 flex items-center justify-center shadow-[0_0_50px_rgba(45,212,191,0.25)] relative overflow-hidden">
                <Bot
                  className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 ${
                    isSpeaking
                      ? 'text-mint-300 scale-110'
                      : isListening
                      ? 'text-mint-400 scale-105'
                      : 'text-slate-400'
                  }`}
                />

                {/* Animated Waveform Equalizer when speaking */}
                {isSpeaking && (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center items-end space-x-1 space-x-reverse h-6 px-3">
                    {[0.3, 0.8, 0.5, 1.0, 0.6, 0.9, 0.4].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-mint-500 to-emerald-300 rounded-full animate-bounce shadow-glow-mint"
                        style={{
                          height: `${h * 100}%`,
                          animationDelay: `${i * 100}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Persona Details & Status Chip */}
            <div className="mt-5 text-center">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                רותם — מראיינת לתפקיד {targetRole}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                סימולציית ראיון מקצועית בהתאמה אישית (Gemini Voice • Aoede)
              </p>

              {/* Dynamic Status Indicator */}
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md transition-all">
                {isAiThinking ? (
                  <span className="flex items-center gap-2 text-amber-300 border-amber-500/40 bg-amber-950/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    רותם חושבת ומנסחת שאלת המשך...
                  </span>
                ) : isSpeaking ? (
                  <span className="flex items-center gap-2 text-mint-300 border-mint-500/40 bg-mint-950/80 shadow-glow-mint">
                    <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
                    רותם מדברת כעת (האזן לשאלה)...
                  </span>
                ) : isListening ? (
                  <span className="flex items-center gap-2 text-emerald-300 border-emerald-500/40 bg-emerald-950/80 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    תורך לדבר! המיקרופון מקשיב לתשובתך...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-slate-400 border-white/5 bg-[#0e151d]">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    המיקרופון מושתק
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles & Live Candidate Speech Strip at bottom of stage */}
          <div className="absolute inset-x-4 bottom-4 z-20 flex flex-col items-center gap-2">
            {/* Live Candidate Speech Banner */}
            {interimTranscript && (
              <div className="max-w-2xl w-full px-4 py-2.5 rounded-2xl bg-[#090f17]/95 border border-emerald-500/50 text-emerald-200 text-xs shadow-glow-card-mint flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2 truncate">
                  <Mic className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                  <span className="truncate">
                    <strong className="text-emerald-300">מקשיבה לך:</strong> {interimTranscript}
                  </span>
                </div>
                <button
                  onClick={submitCurrentSpeech}
                  className="shrink-0 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-[11px] transition-all shadow-md flex items-center gap-1.5"
                  title="שלח תשובה זו כעת"
                >
                  <span>שלח תשובה</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* AI Thinking Floating Banner */}
            {isAiThinking && (
              <div className="max-w-md w-full px-4 py-2 rounded-full bg-amber-950/85 border border-amber-500/40 text-amber-200 text-xs text-center backdrop-blur-md shadow-lg flex items-center justify-center gap-2 animate-in fade-in">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>רותם מעבדת את תשובתך ומנסחת שאלת המשך...</span>
              </div>
            )}

            {currentSubtitle && (
              <div className="max-w-2xl w-full px-6 py-3.5 rounded-2xl bg-[#060809]/90 backdrop-blur-xl border border-mint-500/30 text-slate-100 text-sm text-center shadow-[0_4px_30px_rgba(0,0,0,0.85)] leading-relaxed animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-[10px] font-mono text-mint-400 block font-bold">
                    תמלול המראיינת (רותם):
                  </span>
                  <button
                    onClick={repeatQuestion}
                    className="text-[11px] text-mint-300 hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-mint-950/80 border border-mint-500/30 transition-colors"
                    title="השמע בקול שוב"
                  >
                    <Volume2 className="w-3 h-3 text-mint-400" />
                    <span>השמע שוב בקול</span>
                  </button>
                </div>
                {currentSubtitle}
              </div>
            )}

            {speechError && (
              <div className="mt-1 max-w-xl px-4 py-2 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs text-center backdrop-blur-md animate-in fade-in">
                {speechError}
              </div>
            )}
          </div>
        </div>

        {/* Candidate Self Video Tile (Top Left) */}
        <div className="absolute top-7 left-7 w-36 sm:w-48 aspect-video rounded-2xl bg-[#080d12] border border-white/10 overflow-hidden shadow-2xl z-20 group">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#060809] text-slate-500">
              <User className="w-7 h-7 text-slate-600 mb-1" />
              <span className="text-[10px]">מצלמה כבויה</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-[#060809]/80 backdrop-blur-sm text-[10px] text-slate-300 font-medium border border-white/5">
            המועמד/ת (את/ה)
          </div>
        </div>

        {/* Collapsible Chat & Transcript Drawer */}
        {isChatOpen && (
          <div className="w-80 sm:w-96 rounded-3xl bg-[#080d12]/95 border border-white/5 flex flex-col overflow-hidden z-30 shadow-2xl backdrop-blur-xl">
            <div className="p-3.5 border-b border-white/5 flex items-center justify-between bg-[#0b1118]">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-mint-400" />
                תמלול שיחה שוטף
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                סגור
              </button>
            </div>

            {/* Turns list */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              {turns.map((turn, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    turn.speaker === 'candidate' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 mb-1 font-mono">
                    {turn.speaker === 'candidate' ? 'את/ה' : 'רותם (HR)'} • {turn.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                      turn.speaker === 'candidate'
                        ? 'bg-mint-950/60 border border-mint-500/30 text-mint-100'
                        : 'bg-[#0f1722] border border-white/5 text-slate-200'
                    }`}
                  >
                    {turn.text}
                  </div>
                </div>
              ))}
              <div ref={chatScrollRef} />
            </div>

            {/* Text message fallback form */}
            <form onSubmit={handleSendTypedMessage} className="p-3 border-t border-white/5 flex gap-2 bg-[#0b1118]">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="הקלד/י תשובה בטקסט..."
                className="flex-1 px-3.5 py-2 rounded-full bg-[#111822] border border-white/10 text-xs text-slate-200 outline-none focus:border-mint-400"
              />
              <button
                type="submit"
                className="p-2.5 rounded-full bg-gradient-to-r from-mint-400 to-emerald-400 hover:opacity-90 text-[#060809] text-xs font-semibold shadow-glow-mint"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-16 border-t border-white/5 bg-[#080d12]/95 px-5 flex items-center justify-between z-20">
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Google Gemini 2.0 Flash Audio • Full Duplex
        </div>

        {/* Meeting Controls */}
        <div className="flex items-center space-x-3 space-x-reverse mx-auto sm:mx-0">
          {/* Mic Toggle */}
          <button
            onClick={toggleListening}
            title={isListening ? 'השתק מיקרופון' : 'הפעל מיקרופון'}
            className={`p-3 rounded-full border transition-all ${
              isListening
                ? 'bg-gradient-to-r from-mint-400 to-emerald-400 border-mint-400 text-[#060809] shadow-glow-mint'
                : 'bg-[#111822] border-white/10 text-slate-400 hover:bg-[#16212e] hover:text-white'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setIsCameraOn((prev) => !prev)}
            title={isCameraOn ? 'כבה מצלמה' : 'הפעל מצלמה'}
            className={`p-3 rounded-full border transition-all ${
              isCameraOn
                ? 'bg-[#111822] border-white/10 text-slate-300 hover:bg-[#16212e] hover:text-white'
                : 'bg-amber-950/60 border-amber-600/60 text-amber-300'
            }`}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Repeat Question */}
          <button
            onClick={repeatQuestion}
            title="השמע את השאלה שוב"
            className="px-4 py-2.5 rounded-full bg-[#111822] hover:bg-[#16212e] border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-mint-400" />
            <span>השמע שאלה</span>
          </button>

          {/* Restart Session */}
          <button
            onClick={() => restartSession()}
            title="התחל את הראיון מחדש מההתחלה"
            className="px-4 py-2.5 rounded-full bg-[#111822] hover:bg-[#16212e] border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>התחל מחדש</span>
          </button>

          {/* Stop AI Speaking (if talking) */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              title="עצור דיבור מראיינת"
              className="p-3 rounded-full bg-mint-950/80 hover:bg-mint-900 border border-mint-500/50 text-mint-300 transition-colors shadow-glow-mint"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}

          {/* End Interview & Trigger Gemini Report */}
          <button
            onClick={handleEndInterview}
            title="סיים ראיון והפק דוח משוב"
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all flex items-center gap-2"
          >
            <PhoneOff className="w-4 h-4" />
            <span>סיים ראיון</span>
          </button>
        </div>

        {/* Right switch */}
        {onSwitchToCoding ? (
          <div className="hidden md:flex items-center">
            <button
              onClick={onSwitchToCoding}
              className="text-xs text-slate-400 hover:text-mint-400 transition-colors flex items-center gap-1.5"
            >
              <span>לסנדבוקס טכני</span>
              <span className="font-mono">←</span>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center text-xs text-slate-500 font-mono">
            Gemini Native Engine v2.0
          </div>
        )}
      </div>

      {/* Post-Interview Comprehensive Gemini Feedback Modal */}
      {report && (
        <InterviewReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          report={report}
          turns={turns}
          onRestart={() => {
            setIsReportOpen(false);
            restartSession();
          }}
          onReevaluate={handleReevaluate}
          isReevaluating={isAnalyzing}
          targetRole={targetRole}
        />
      )}

      {/* Standalone API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0f14] border border-mint-500/30 rounded-3xl p-6 shadow-glow-card-mint space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-mint-400" />
                <h3 className="text-sm font-bold text-white">הגדרת מפתח Google Gemini API</h3>
              </div>
              {hasGeminiApiKey() && (
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="w-7 h-7 rounded-full bg-[#111822] text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              הסימולטור מופעל כולו באמצעות <strong>Google Gemini 2.0 Flash</strong> (הפקת קול טבעי בעברית ודוח משוב מקיף). הזן מפתח API כדי להתחיל. המפתח נשמר בדפדפן המקומי בלבד (localStorage).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Gemini API Key:</label>
              <input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-full bg-[#111822] border border-white/10 text-xs text-slate-100 outline-none focus:border-mint-400 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-mint-400 hover:underline flex items-center gap-1 font-sans"
              >
                <span>השג מפתח חינם ב-Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleSaveApiKey(customKeyInput)}
                disabled={!customKeyInput.trim()}
                className="btn-mint-hero px-5 py-2 rounded-full text-xs font-bold disabled:opacity-50"
              >
                שמור והמשך
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
