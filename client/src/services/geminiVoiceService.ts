/**
 * Native Gemini Audio Voice Engine for Hebrew Speech Synthesis
 * Uses Gemini's native multimodal audio capabilities (responseModalities: ['AUDIO'])
 * with prebuilt voice (Aoede) for natural, fluent conversational Hebrew.
 */

// Default Gemini API key from environment variable
export const DEFAULT_GEMINI_API_KEY = ((import.meta as any).env?.VITE_GEMINI_API_KEY as string) || '';

const GEMINI_LOCAL_KEY = 'mockmaster_gemini_key';

/**
 * Retrieves the currently active Gemini API key
 */
export function getGeminiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim()) {
    return explicitKey.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(GEMINI_LOCAL_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return DEFAULT_GEMINI_API_KEY;
}

/**
 * Saves a custom Gemini API key into localStorage
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(GEMINI_LOCAL_KEY, key.trim());
    } else {
      localStorage.removeItem(GEMINI_LOCAL_KEY);
    }
  }
}

/**
 * Checks whether a valid Gemini API key is configured (always true with embedded key)
 */
export function hasGeminiApiKey(): boolean {
  return true;
}

/**
 * Helper to write ASCII strings to DataView for WAV headers
 */
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Encapsulates raw PCM byte stream into a playable RIFF/WAVE container
 */
function pcmToWav(
  pcmData: Uint8Array,
  sampleRate = 24000,
  numChannels = 1,
  bitsPerSample = 16
): Blob {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, pcmData.length, true);

  // Write PCM payload
  new Uint8Array(buffer, 44).set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Convert base64 data to Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Audio lifecycle singleton
let currentAudio: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;
let currentAbortController: AbortController | null = null;

/**
 * Instantly halts any active speech playback (Barge-In)
 */
export function stopSpeaking(): void {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  if (currentAudioUrl) {
    try {
      URL.revokeObjectURL(currentAudioUrl);
    } catch {
      // Ignored
    }
    currentAudioUrl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignored
    }
  }
}

/**
 * Checks whether audio is currently playing
 */
export function isCurrentlySpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused && !currentAudio.ended;
}

/**
 * Generates natural Hebrew spoken audio via Gemini native multimodal audio
 * Returns a playable blob URL (audio/wav or audio/mp3).
 */
export async function generateInterviewerSpeech(
  textPrompt: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = getGeminiApiKey(customApiKey);

  // Abort previous generation if any
  if (currentAbortController) {
    currentAbortController.abort();
  }
  const controller = new AbortController();
  currentAbortController = controller;

  // Clean prompt text
  const cleanPrompt = textPrompt
    .replace(/[\u200E\u200F\u200B\u200C\uFEFF]/g, '')
    .replace(/([\u0590-\u05FF]+)\/([\u0590-\u05FF]+)/g, (_m, g1) => g1)
    .trim();

  // Models verified to support native audio generation
  const models = ['gemini-3.8-flash-tts', 'gemini-3.1-flash-tts-preview'];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanPrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Aoede' // Warm, professional female tone for Rotem
              }
            }
          }
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini Voice API error on ${model} (${response.status}):`, errorText);
        continue;
      }

      const json = await response.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p: any) => p.inlineData && p.inlineData.data);

      if (!audioPart || !audioPart.inlineData?.data) {
        console.warn(`Model ${model} did not return audio inlineData.`);
        continue;
      }

      const base64Data = audioPart.inlineData.data;
      const mimeType = audioPart.inlineData.mimeType || 'audio/wav';

      const rawBytes = base64ToUint8Array(base64Data);

      let audioBlob: Blob;
      if (mimeType.includes('pcm') || mimeType.includes('l16')) {
        const match = mimeType.match(/rate=(\d+)/);
        const sampleRate = match ? parseInt(match[1], 10) : 24000;
        audioBlob = pcmToWav(rawBytes, sampleRate);
      } else {
        audioBlob = new Blob([rawBytes.buffer as ArrayBuffer], {
          type: mimeType.includes('wav') ? 'audio/wav' : mimeType
        });
      }

      const blobUrl = URL.createObjectURL(audioBlob);
      return blobUrl;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      console.warn(`Speech generation failed on ${model}:`, err);
    }
  }

  throw new Error('All Gemini Audio model attempts failed.');
}

/**
 * High-level speech playback wrapper with instant barge-in support and SpeechSynthesis fallback
 */
export async function playInterviewerSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  customApiKey?: string
): Promise<void> {
  const clean = text.trim();
  if (!clean) {
    onEnd?.();
    return;
  }

  // Stop any active audio immediately
  stopSpeaking();

  try {
    const blobUrl = await generateInterviewerSpeech(clean, customApiKey);
    currentAudioUrl = blobUrl;

    const audio = new Audio(blobUrl);
    currentAudio = audio;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      stopSpeaking();
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('Gemini audio element playback error, falling back to Web Speech:', e);
      playWebSpeechFallback(clean, onStart, onEnd);
    };

    await audio.play();
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return; // Interrupted by barge-in
    }
    console.warn('Gemini audio playback unavailable, using browser SpeechSynthesis fallback:', err);
    playWebSpeechFallback(clean, onStart, onEnd);
  }
}

/**
 * Fallback to browser Web Speech API SpeechSynthesis for Hebrew
 */
function playWebSpeechFallback(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    stopSpeaking();
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';

    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find((v) => v.lang.startsWith('he'));
    if (heVoice) {
      utterance.voice = heVoice;
    }

    utterance.pitch = 1.05;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      stopSpeaking();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.warn('Browser SpeechSynthesis error:', e);
      }
      stopSpeaking();
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error('SpeechSynthesis fallback error:', e);
    stopSpeaking();
    onEnd?.();
  }
}
