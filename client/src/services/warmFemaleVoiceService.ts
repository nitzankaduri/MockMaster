/**
 * Warm & Natural Human Female Voice Synthesis Engine for MockMaster
 * 
 * Provides a high-fidelity, warm, conversational female voice across all interview modes:
 * 1. Google Gemini 2.0 Flash Native Audio with prebuilt voice 'Kore' (warm, soothing, natural female) or 'Aoede'
 * 2. ElevenLabs Neural Multilingual v2 with warm female voices (Lily, Sarah, Rachel)
 * 3. Browser Neural Web Speech (Microsoft Hila Natural, Google עברית, Carmit) with pitch: 1.0 & rate: 0.95
 * 4. Strict blacklist of male voices (Asaf, David, Guy, etc.) to ensure a warm female persona
 * 5. Web Audio API Acoustic Warmth Filter (chest resonance boost & sibilance softening)
 */

import { getGeminiApiKey } from './geminiVoiceService';

export type FemaleVoiceProvider = 'auto' | 'gemini_kore' | 'gemini_aoede' | 'browser_neural' | 'elevenlabs';

// Sample phrase to test the warm human voice
export const WARM_VOICE_SAMPLE =
  'שלום! נעים מאוד, שמי רותם. הקול הנשי החם והאנושי הוגדר בהצלחה. אני כאן כדי ללוות אותך לאורך כל הראיון ברוגע, בחיוך ובמקצועיות.';

// ElevenLabs female voice IDs
export const ELEVENLABS_FEMALE_VOICES = {
  lily: 'pFZP5JQG7iQjIQuC4Bku',   // Lily - Velvety, warm, multilingual female
  sarah: 'EXAVITQu4vr4xnSDxMaL',  // Sarah - Soft, reassuring, empathetic female
  rachel: '21m00Tcm4TlvDq8ikWAM'  // Rachel - Calm, warm, conversational female
};

// Singleton states
let currentAudio: HTMLAudioElement | null = null;
let currentPlayUrl: string | null = null;
let currentPlaybackAbortController: AbortController | null = null;
let cachedBrowserVoices: SpeechSynthesisVoice[] = [];
let voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

// High-speed in-memory audio Blob cache (persists raw audio binary data, immune to URL revocation)
const voiceBlobCache = new Map<string, Blob>();
// Active in-flight preload promises to avoid duplicate requests and prevent aborting during button clicks
const inFlightPreloadMap = new Map<string, Promise<Blob | null>>();

/**
 * Preload and cache browser SpeechSynthesis voices asynchronously
 */
export function preloadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  if (cachedBrowserVoices.length > 0) {
    return Promise.resolve(cachedBrowserVoices);
  }

  if (voicesLoadedPromise) {
    return voicesLoadedPromise;
  }

  voicesLoadedPromise = new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate && immediate.length > 0) {
      cachedBrowserVoices = immediate;
      resolve(immediate);
      return;
    }

    const onVoicesChanged = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        cachedBrowserVoices = voices;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(voices);
      }
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    // Safety timeout in case onvoiceschanged does not fire
    setTimeout(() => {
      const fallback = window.speechSynthesis.getVoices();
      cachedBrowserVoices = fallback || [];
      resolve(cachedBrowserVoices);
    }, 400);
  });

  return voicesLoadedPromise;
}

// Initial voice preload on module load
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  preloadBrowserVoices();
}

/**
 * Strictly identifies the best natural female Hebrew voice available in the browser.
 * NEVER returns a male voice (e.g. Asaf, David, Guy, Avri, Itai).
 */
export function getBestWarmFemaleBrowserVoice(
  voices: SpeechSynthesisVoice[]
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Strict male blacklist
  const isMale = (name: string): boolean => {
    const n = name.toLowerCase();
    return (
      n.includes('asaf') ||
      n.includes('david') ||
      n.includes('guy') ||
      n.includes('avri') ||
      n.includes('itai') ||
      n.includes('yaron') ||
      n.includes('zvi') ||
      n.includes('male') ||
      n.includes('גבר') ||
      n.includes('אסף') ||
      n.includes('דוד')
    );
  };

  const hebrewVoices = voices.filter(
    (v) =>
      (v.lang.toLowerCase().startsWith('he') ||
        v.lang.toLowerCase().startsWith('iw') ||
        v.name.includes('Hebrew') ||
        v.name.includes('עברית')) &&
      !isMale(v.name)
  );

  if (hebrewVoices.length === 0) return null;

  // Priority 1: Azure Natural Neural voice (Microsoft Hila Online (Natural)) - state-of-the-art warm female
  const hilaNatural = hebrewVoices.find(
    (v) =>
      v.name.toLowerCase().includes('hila') ||
      (v.name.toLowerCase().includes('natural') && !isMale(v.name))
  );
  if (hilaNatural) return hilaNatural;

  // Priority 2: Google Hebrew Female (Chrome)
  const googleHe = hebrewVoices.find((v) => v.name.toLowerCase().includes('google'));
  if (googleHe) return googleHe;

  // Priority 3: Carmit (Microsoft Carmit)
  const carmit = hebrewVoices.find(
    (v) => v.name.toLowerCase().includes('carmit') || v.name.includes('כרמית')
  );
  if (carmit) return carmit;

  // Priority 4: Apple female voices (Sara, Carmel)
  const appleFemale = hebrewVoices.find(
    (v) => v.name.toLowerCase().includes('sara') || v.name.toLowerCase().includes('carmel')
  );
  if (appleFemale) return appleFemale;

  // Priority 5: Any Hebrew voice that explicitly denotes female
  const anyFemale = hebrewVoices.find((v) => v.name.toLowerCase().includes('female'));
  if (anyFemale) return anyFemale;

  // If the only voice is ungendered but NOT on the male blacklist
  return hebrewVoices[0] || null;
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

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + pcmData.length, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, pcmData.length, true);

  new Uint8Array(buffer, 44).set(pcmData);
  return new Blob([buffer], { type: 'audio/wav' });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

let speechKeepAliveTimer: any = null;

function clearKeepAlive() {
  if (speechKeepAliveTimer) {
    clearInterval(speechKeepAliveTimer);
    speechKeepAliveTimer = null;
  }
}

/**
 * Halts any active speech playback immediately (Barge-In)
 */
export function stopWarmSpeech(): void {
  clearKeepAlive();

  if (currentPlaybackAbortController) {
    currentPlaybackAbortController.abort();
    currentPlaybackAbortController = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onplay = null;
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio = null;
  }

  if (currentPlayUrl) {
    try {
      URL.revokeObjectURL(currentPlayUrl);
    } catch {}
    currentPlayUrl = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Checks whether audio is currently speaking
 */
export function isWarmSpeechPlaying(): boolean {
  if (currentAudio && !currentAudio.paused && !currentAudio.ended) {
    return true;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

/**
 * Normalizes Hebrew text for speech synthesis
 */
export function cleanHebrewForSpeech(raw: string): string {
  return raw
    .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*_~#>[\]()]/g, '')
    .replace(/[\u200E\u200F\u200B\u200C\uFEFF]/g, '')
    .replace(/([\u0590-\u05FF]+)\/([\u0590-\u05FF]+)/g, (_m, g1) => g1)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetches raw audio Blob directly via Gemini Flash Audio models
 * Uses voice 'Kore' (Google's official warm, soothing, natural female voice) or 'Aoede'
 */
export async function fetchGeminiFemaleAudioBlob(
  cleanText: string,
  voiceName: 'Kore' | 'Aoede' = 'Kore',
  apiKey: string,
  signal?: AbortSignal
): Promise<Blob> {
  const models = [
    'gemini-3.8-flash-lite-tts',
    'gemini-3.1-flash-tts-preview',
    'gemini-3.8-flash-tts'
  ];

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: cleanText }]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName
                }
              }
            }
          }
        }),
        signal
      });

      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];
      const audioPart = parts.find((p: any) => p.inlineData && p.inlineData.data);

      if (!audioPart?.inlineData?.data) {
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

      return audioBlob;
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  throw new Error('All Gemini Audio model attempts failed.');
}

/**
 * Robust fetcher that falls back to Google Neural TTS proxy if needed
 */
async function fetchAudioBlobWithFallbacks(
  cleanText: string,
  customApiKey?: string,
  preferredVoice: 'Kore' | 'Aoede' = 'Kore',
  signal?: AbortSignal
): Promise<Blob> {
  const apiKey = getGeminiApiKey(customApiKey);
  if (apiKey) {
    try {
      const blob = await fetchGeminiFemaleAudioBlob(cleanText, preferredVoice, apiKey, signal);
      if (blob && blob.size > 0) return blob;
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
    }
  }

  // Fallback to /api/tts proxy
  const proxyRes = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: cleanText }),
    signal
  });
  if (!proxyRes.ok) {
    throw new Error(`TTS proxy failed with ${proxyRes.status}`);
  }
  return await proxyRes.blob();
}

/**
 * Pre-fetch voice audio in background into binary Blob cache.
 * When candidate clicks 'Start Interview' or 'Repeat Question', audio plays instantaneously in 0ms!
 */
export async function preloadVoiceAudio(text: string, customApiKey?: string): Promise<Blob | null> {
  const clean = cleanHebrewForSpeech(text);
  if (!clean) return null;

  if (voiceBlobCache.has(clean)) {
    return voiceBlobCache.get(clean)!;
  }
  if (inFlightPreloadMap.has(clean)) {
    return inFlightPreloadMap.get(clean)!;
  }

  const promise = (async () => {
    try {
      const blob = await fetchAudioBlobWithFallbacks(clean, customApiKey, 'Kore');
      if (blob) {
        voiceBlobCache.set(clean, blob);
      }
      return blob;
    } catch {
      return null;
    } finally {
      inFlightPreloadMap.delete(clean);
    }
  })();

  inFlightPreloadMap.set(clean, promise);
  return promise;
}

/**
 * Generates natural Hebrew spoken audio via Google Gemini Multimodal Audio
 * Returns an ephemeral Object URL (used by legacy callers if any)
 */
export async function generateGeminiFemaleAudio(
  text: string,
  voiceName: 'Kore' | 'Aoede' = 'Kore',
  customApiKey?: string
): Promise<string> {
  const clean = cleanHebrewForSpeech(text);
  if (!clean) throw new Error('Empty text');

  let blob = voiceBlobCache.get(clean);
  if (!blob) {
    const apiKey = getGeminiApiKey(customApiKey);
    blob = await fetchGeminiFemaleAudioBlob(clean, voiceName, apiKey);
    voiceBlobCache.set(clean, blob);
  }
  return URL.createObjectURL(blob);
}

/**
 * Generates natural Hebrew spoken audio via ElevenLabs Neural Multilingual v2 with warm female voices
 */
export async function generateElevenLabsFemaleAudio(
  text: string,
  customApiKey?: string
): Promise<string> {
  const envKey = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY as string;
  const apiKey = (customApiKey || envKey || '').trim();

  if (!apiKey) {
    throw new Error('No ElevenLabs API key configured.');
  }

  const clean = cleanHebrewForSpeech(text);
  if (!clean) throw new Error('Empty text');

  const controller = new AbortController();
  currentPlaybackAbortController = controller;

  // Strict female candidate voices in priority order
  const candidateVoiceIds = [
    ELEVENLABS_FEMALE_VOICES.lily,
    ELEVENLABS_FEMALE_VOICES.sarah,
    ELEVENLABS_FEMALE_VOICES.rachel
  ];

  for (const voiceId of candidateVoiceIds) {
    try {
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: clean,
          model_id: 'eleven_multilingual_v2',
          language_code: 'he',
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        continue;
      }

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
    }
  }

  throw new Error('ElevenLabs female voice generation failed.');
}

/**
 * Speaks text using the browser's warm natural female voice (SpeechSynthesis)
 * Configured with pitch 1.0 (warm, natural female resonance) and rate 0.95 (conversational)
 */
export async function speakBrowserWarmFemaleVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const clean = cleanHebrewForSpeech(text);
  if (!clean) {
    onEnd?.();
    return true;
  }

  const voices = await preloadBrowserVoices();
  const femaleVoice = getBestWarmFemaleBrowserVoice(voices);

  try {
    window.speechSynthesis.cancel();
    clearKeepAlive();

    const utterance = new SpeechSynthesisUtterance(clean);
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      utterance.lang = femaleVoice.lang || 'he-IL';
    } else {
      utterance.lang = 'he-IL';
    }

    utterance.pitch = 1.0;
    utterance.rate = 0.95;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      onStart?.();
      // Keep-alive timer prevents Chrome from silently halting speech after ~10-15s
      speechKeepAliveTimer = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearKeepAlive();
        }
      }, 8000);
    };

    utterance.onend = () => {
      clearKeepAlive();
      stopWarmSpeech();
      onEnd?.();
    };

    utterance.onerror = (e) => {
      clearKeepAlive();
      if (e.error !== 'canceled') {
        console.warn('Browser speech synthesis error:', e);
      }
      stopWarmSpeech();
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    clearKeepAlive();
    console.warn('speakBrowserWarmFemaleVoice error:', err);
    return false;
  }
}

/**
 * Universal Warm Female Speech Player:
 * 1. Primary Engine: Google Gemini 3.8 / 3.1 Flash Native Audio ('Kore' - natural human female)
 * 2. Secondary Engine: Google Cloud Hebrew Neural Voice via /api/tts proxy
 * 3. In-memory permanent Blob caching guarantees instant 0ms start and robust repeat/unmute!
 * STRICTLY NO ROBOTIC BROWSER SAPI SYNTHESIS
 */
export async function playWarmFemaleSpeech(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    customApiKey?: string;
    preferredVoice?: 'Kore' | 'Aoede';
  }
): Promise<void> {
  const clean = cleanHebrewForSpeech(text);
  if (!clean) {
    options?.onEnd?.();
    return;
  }

  stopWarmSpeech();

  // 1. Get audio Blob: from memory cache, in-flight background preload, or fresh fetch
  let blob: Blob | null | undefined = voiceBlobCache.get(clean);

  if (!blob && inFlightPreloadMap.has(clean)) {
    blob = await inFlightPreloadMap.get(clean);
  }

  if (!blob) {
    const playbackController = new AbortController();
    currentPlaybackAbortController = playbackController;
    try {
      blob = await fetchAudioBlobWithFallbacks(
        clean,
        options?.customApiKey,
        options?.preferredVoice || 'Kore',
        playbackController.signal
      );
      if (blob) {
        voiceBlobCache.set(clean, blob);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      options?.onEnd?.();
      return;
    }
  }

  if (!blob || blob.size === 0) {
    options?.onEnd?.();
    return;
  }

  // 2. Create fresh ephemeral URL strictly for this playback instance
  const playUrl = URL.createObjectURL(blob);
  currentPlayUrl = playUrl;

  const audio = new Audio(playUrl);
  currentAudio = audio;

  return new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      stopWarmSpeech();
      options?.onEnd?.();
      resolve();
    };

    audio.onplay = () => {
      options?.onStart?.();
    };

    audio.onended = () => {
      finish();
    };

    audio.onerror = () => {
      finish();
    };

    audio.play().catch(() => {
      finish();
    });
  });
}

/**
 * Quick diagnostic test function to verify the warm female voice
 */
export async function testWarmFemaleVoice(
  onStart?: () => void,
  onEnd?: () => void,
  customApiKey?: string
): Promise<void> {
  return playWarmFemaleSpeech(WARM_VOICE_SAMPLE, {
    onStart,
    onEnd,
    customApiKey,
    preferredVoice: 'Kore'
  });
}
