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
  ExternalLink
} from 'lucide-react';
import { useHebrewInterviewSession } from '../hooks/useHebrewInterviewSession';
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
    isSessionActive,
    currentStage,
    callDuration,
    turns,
    currentSubtitle,
    isListening,
    isSpeaking,
    speechError,
    stopSpeaking,
    toggleListening,
    repeatQuestion,
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
      className="h-full w-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative font-sans select-none"
    >
      {/* Pre-start Gate: Welcome & Audio Initiation */}
      {!isSessionActive && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.5)] mb-5 ring-2 ring-cyan-400/40 animate-pulse">
            <Volume2 className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-wide">
            ראיון עבודה מקצועי בעברית (Google Gemini 2.0 Flash Audio)
          </h2>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Native Gemini Multimodal Audio • Prebuilt Voice: Aoede</span>
          </div>

          <p className="text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
            סימולטור ראיונות HR והתנהגותיים (STAR) בטכנולוגיית <strong>Google Gemini 2.0 Flash</strong> — הפקת קול ישירה (Native Audio Modality), זיהוי דיבור שוטף בעברית עם עצירה מידית בהתפרצות (Barge-In), ודוח משוב סופי מבוסס AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={startSession}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2.5 transform hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>התחל ראיון עבודה בעברית</span>
            </button>
          </div>
        </div>
      )}

      {/* Evaluating Loading Overlay */}
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)] mb-4 animate-spin">
            <Loader2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            מנתח את הראיון עם Google Gemini AI...
          </h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            מבצע ניתוח מעמיק לפי מתודולוגיית STAR, שולף ציטוטים מדויקים מתשובותיך, ומפיק דוח הערכה מקיף לראיונות הייטק.
          </p>
        </div>
      )}

      {/* Top Header Strip */}
      <div className="h-12 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-emerald-400">
              ראיון חי • {formatTimer(callDuration)}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            רותם — מנהלת גיוס ומשאבי אנוש
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 font-bold">
            Gemini 2.0 Flash Audio
          </span>
        </div>

        {/* Current Stage Indicator */}
        <div className="hidden md:flex items-center space-x-2 space-x-reverse text-xs bg-slate-900/80 border border-cyan-500/20 px-3.5 py-1 rounded-full text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{stageNameHe[currentStage] || currentStage}</span>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 sm:px-3 sm:py-1 rounded-xl bg-violet-950/60 hover:bg-violet-900 border border-violet-500/40 text-violet-300 text-xs flex items-center gap-1.5 transition-colors"
            title="הגדרות Gemini API"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">הגדרות API</span>
          </button>

          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className={`p-1.5 sm:px-3 sm:py-1 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              isChatOpen
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">תמלול ({turns.length})</span>
          </button>
        </div>
      </div>

      {/* Main Video Call Stage */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 relative">
        {/* Main Stage: Holographic Interviewer */}
        <div className="flex-1 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-cyan-500/20 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {/* Ambient Glow */}
          <div
            className={`absolute w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isSpeaking
                ? 'bg-violet-600/35 scale-125'
                : isListening
                ? 'bg-cyan-600/25 scale-110'
                : 'bg-blue-600/15 scale-100'
            }`}
          />

          {/* Interactive Persona Avatar */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Holographic Concentric Rings */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Outer Dashed Orbiting Ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-dashed transition-all duration-700 ${
                  isSpeaking
                    ? 'border-violet-400/70 animate-spin'
                    : isListening
                    ? 'border-cyan-400/60 animate-pulse'
                    : 'border-slate-700/50'
                }`}
                style={{ animationDuration: isSpeaking ? '5s' : '18s' }}
              />

              {/* Middle Pulsing Ring */}
              <div
                className={`absolute inset-3 sm:inset-4 rounded-full border transition-all duration-500 ${
                  isSpeaking
                    ? 'border-violet-500/90 shadow-[0_0_40px_rgba(139,92,246,0.5)] scale-105'
                    : isListening
                    ? 'border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.4)] scale-105'
                    : 'border-slate-800'
                }`}
              />

              {/* Core Avatar Sphere */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.25)] relative overflow-hidden">
                <Bot
                  className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 ${
                    isSpeaking
                      ? 'text-violet-300 scale-110'
                      : isListening
                      ? 'text-cyan-400 scale-105'
                      : 'text-slate-400'
                  }`}
                />

                {/* Animated Waveform Equalizer when speaking */}
                {isSpeaking && (
                  <div className="absolute inset-x-0 bottom-3 flex justify-center items-end space-x-1 space-x-reverse h-6 px-3">
                    {[0.3, 0.8, 0.5, 1.0, 0.6, 0.9, 0.4].map((h, i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-violet-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(139,92,246,0.8)]"
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
                רותם — מנהלת גיוס ומשאבי אנוש
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ראיון התנהגותי (Gemini 2.0 Flash Audio • Aoede)
              </p>

              {/* Dynamic Status Indicator */}
              <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all">
                {isSpeaking ? (
                  <span className="flex items-center gap-1.5 text-violet-300 border-violet-500/40 bg-violet-950/60 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    מדברת כעת (Gemini Voice)...
                  </span>
                ) : isListening ? (
                  <span className="flex items-center gap-1.5 text-cyan-300 border-cyan-500/40 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    מקשיבה לתשובה שלך בעברית...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 border-slate-800 bg-slate-900/60">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    המיקרופון מושתק
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles Strip at bottom of stage */}
          <div className="absolute inset-x-4 bottom-4 z-20 flex flex-col items-center">
            {currentSubtitle && (
              <div className="max-w-2xl px-5 py-3 rounded-2xl bg-black/85 backdrop-blur-xl border border-cyan-500/30 text-cyan-100 text-sm text-center shadow-[0_4px_30px_rgba(0,0,0,0.85)] leading-relaxed animate-in fade-in duration-200">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-cyan-400 block">
                    תמלול המראיינת (רותם):
                  </span>
                  <button
                    onClick={repeatQuestion}
                    className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 transition-colors"
                    title="השמע בקול שוב"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>השמע שוב בקול</span>
                  </button>
                </div>
                {currentSubtitle}
              </div>
            )}

            {speechError && (
              <div className="mt-2 max-w-xl px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs text-center backdrop-blur-md animate-in fade-in">
                {speechError}
              </div>
            )}
          </div>
        </div>

        {/* Candidate Self Video Tile (Top Left) */}
        <div className="absolute top-6 left-6 w-36 sm:w-48 aspect-video rounded-xl bg-slate-900 border border-cyan-500/30 overflow-hidden shadow-2xl z-20 group">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500">
              <User className="w-7 h-7 text-slate-600 mb-1" />
              <span className="text-[10px]">מצלמה כבויה</span>
            </div>
          )}

          <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] text-slate-200 font-medium">
            המועמד/ת (את/ה)
          </div>
        </div>

        {/* Collapsible Chat & Transcript Drawer */}
        {isChatOpen && (
          <div className="w-80 sm:w-96 rounded-2xl bg-slate-900 border border-cyan-500/25 flex flex-col overflow-hidden z-30 shadow-2xl">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                תמלול שיחה שוטף
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                סגור
              </button>
            </div>

            {/* Turns list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {turns.map((turn, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    turn.speaker === 'candidate' ? 'items-end' : 'items-start'
                  }`}
                >
                  <span className="text-[10px] text-slate-500 mb-1">
                    {turn.speaker === 'candidate' ? 'את/ה' : 'רותם (HR)'} • {turn.timestamp}
                  </span>
                  <div
                    className={`p-2.5 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                      turn.speaker === 'candidate'
                        ? 'bg-cyan-950/70 border border-cyan-500/30 text-cyan-100'
                        : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {turn.text}
                  </div>
                </div>
              ))}
              <div ref={chatScrollRef} />
            </div>

            {/* Text message fallback form */}
            <form onSubmit={handleSendTypedMessage} className="p-2 border-t border-slate-800 flex gap-2 bg-slate-950">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="הקלד/י תשובה בטקסט..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="h-16 border-t border-cyan-500/20 bg-slate-950 px-4 flex items-center justify-between z-20">
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          Google Gemini 2.0 Flash Audio • Full Duplex Barge-In
        </div>

        {/* Meeting Controls */}
        <div className="flex items-center space-x-3 space-x-reverse mx-auto sm:mx-0">
          {/* Mic Toggle */}
          <button
            onClick={toggleListening}
            title={isListening ? 'השתק מיקרופון' : 'הפעל מיקרופון'}
            className={`p-3 rounded-full border transition-all shadow-md ${
              isListening
                ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'
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
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'bg-amber-950/60 border-amber-600/60 text-amber-300'
            }`}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Repeat Question */}
          <button
            onClick={repeatQuestion}
            title="השמע את השאלה שוב"
            className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>השמע שאלה בקול</span>
          </button>

          {/* Stop AI Speaking (if talking) */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              title="עצור דיבור מראיינת"
              className="p-3 rounded-full bg-violet-950/80 hover:bg-violet-900 border border-violet-500/50 text-violet-300 transition-colors"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}

          {/* End Interview & Trigger Gemini Report */}
          <button
            onClick={handleEndInterview}
            title="סיים ראיון והפק דוח משוב"
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center gap-2"
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
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              לסנדבוקס טכני ←
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
          onRestart={restartSession}
          onReevaluate={handleReevaluate}
          isReevaluating={isAnalyzing}
        />
      )}

      {/* Standalone API Key Configuration Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-950 border border-violet-500/40 rounded-2xl p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-violet-400" />
                <h3 className="text-sm font-bold text-white">הגדרת מפתח Google Gemini API</h3>
              </div>
              {hasGeminiApiKey() && (
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              הסימולטור מופעל כולו באמצעות <strong>Google Gemini 2.0 Flash</strong> (הפקת קול טבעי בעברית ודוח משוב מקיף). הזן מפתח API כדי להתחיל. המפתח נשמר בדפדפן המקומי בלבד (localStorage).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Gemini API Key:</label>
              <input
                type="password"
                value={customKeyInput}
                onChange={(e) => setCustomKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-violet-400 hover:underline flex items-center gap-1"
              >
                <span>השג מפתח חינם ב-Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleSaveApiKey(customKeyInput)}
                disabled={!customKeyInput.trim()}
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
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
