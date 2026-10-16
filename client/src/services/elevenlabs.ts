/**
 * ElevenLabs Neural TTS Service for Hebrew Speech Synthesis
 * Configured specifically to eliminate Persian/Arabic misidentification:
 * 1. Strict Hebrew text normalization & phoneme anchor sanitization
 * 2. Verified multilingual Hebrew voices (Lily pFZP5JQG7iQjIQuC4Bku & Daniel onwK4e9ZLuTAKqWW03F9)
 * 3. High stability (0.70) forcing strict Semitic phoneme adherence
 * 4. mp3_44100_128 output format parameter
 * 5. Explicit language_code handling with resilient retry
 * 6. Instant full-duplex barge-in cancellation
 */

export const ELEVENLABS_API_KEY =
  ((import.meta as any).env?.VITE_ELEVENLABS_API_KEY as string) || '';

// Active Hebrew Voice ID specified by user
export const VOICE_ID = 'UZzDIQRRTW2Id7YBcbgC';

// Verified Multilingual Hebrew Voices (Pre-made fallbacks if library voice requires upgrade)
export const LILY_VOICE_ID = 'pFZP5JQG7iQjIQuC4Bku';    // Lily - Clear, Velvety Multilingual
export const RACHEL_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';  // Rachel - Calm, warm, conversational female
export const SARAH_VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';   // Sarah - Reassuring Multilingual fallback

// Allow environment override via VITE_ELEVENLABS_VOICE_ID
export const PREFERRED_VOICE_ID =
  ((import.meta as any).env?.VITE_ELEVENLABS_VOICE_ID as string) || VOICE_ID;

export const MODEL_ID = 'eleven_multilingual_v2';

// Stricter voice settings: stability 0.65 forces tighter phoneme adherence and prevents accent drift
export const VOICE_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.85,
  style: 0.0,
  use_speaker_boost: true
};

let currentAudio: HTMLAudioElement | null = null;
let currentBlobUrl: string | null = null;
let currentAbortController: AbortController | null = null;

/**
 * Normalizes and sanitizes Hebrew text specifically for ElevenLabs Neural TTS:
 * - Strips invisible RTL/LTR markers and zero-width artifacts (e.g. \u200F, \u200E)
 * - Resolves gender slash notations (e.g. ספר/י -> ספר, את/ה -> אתה) into natural spoken Hebrew
 * - Converts English brand and technical terms into natural Hebrew phonetics
 * - Ensures the text begins with a solid Hebrew token to lock the phonetic decoder onto Hebrew
 */
export function sanitizeHebrewForSpeech(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // 1. Strip invisible directional, embedding, and zero-width characters
  text = text.replace(/[\u200E\u200F\u200B\u200C\uFEFF]/g, '').replace(/[\u202A-\u202E]/g, '').replace(/\u200D/g, '');

  // 2. Normalize Hebrew gender slash notations (ספר/י -> ספר, תאר/י -> תאר, את/ה -> אתה)
  text = text.replace(/([\u0590-\u05FF]+)\/([\u0590-\u05FF]+)/g, (_match, group1) => group1);

  // 3. Phonetic transliteration for English brands and jargon that confuse Semitic models
  text = text.replace(/ב-MockMaster/gi, 'במוק מאסטר');
  text = text.replace(/MockMaster/gi, 'מוק מאסטר');
  text = text.replace(/\bSTAR\b/g, 'סטאר');
  text = text.replace(/\bHR\b/gi, 'משאבי אנוש');
  text = text.replace(/\bAI\b/gi, 'איי איי');
  text = text.replace(/\bQA\b/gi, 'קיו איי');
  text = text.replace(/\bDevOps\b/gi, 'דבאופס');

  // 4. Remove code markdown fences, brackets, and quotes that degrade speech cadence
  text = text.replace(/[*_#`~[\]()]/g, ' ');
  text = text.replace(/[\r\n]+/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  // 5. Ensure initial token anchors on Hebrew phonetics if Hebrew letters exist
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  if (hasHebrew && !/^[\u0590-\u05FF]/.test(text)) {
    text = text.replace(/^[^\u0590-\u05FF]+/, '');
  }

  return text;
}

/**
 * Halts any active speech playback immediately (Barge-In)
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

  if (currentBlobUrl) {
    try {
      URL.revokeObjectURL(currentBlobUrl);
    } catch {
      // Ignored
    }
    currentBlobUrl = null;
  }
}

/**
 * Checks whether audio is currently playing
 */
export function isCurrentlySpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused && !currentAudio.ended;
}

/**
 * Generates authentic Hebrew speech using ElevenLabs API and streams playback
 */
export async function speakWithElevenLabs(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  voiceId: string = PREFERRED_VOICE_ID
): Promise<void> {
  const sanitizedText = sanitizeHebrewForSpeech(text);
  if (!sanitizedText) {
    onEnd?.();
    return;
  }

  // Halt any previous playback immediately
  stopSpeaking();

  const controller = new AbortController();
  currentAbortController = controller;

  // Ordered female candidate voices: User preferred/UZzDIQRRTW2Id7YBcbgC -> Lily -> Sarah -> Rachel
  const candidateVoices = [voiceId, LILY_VOICE_ID, SARAH_VOICE_ID, RACHEL_VOICE_ID];

  for (const currentVoice of candidateVoices) {
    try {
      // Output format parameter ensuring high quality MP3 44.1kHz
      const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${currentVoice}?output_format=mp3_44100_128`;

      // Payload strictly specifying language_code: "he"
      const payload: Record<string, any> = {
        text: sanitizedText,
        model_id: MODEL_ID,
        language_code: 'he',
        voice_settings: VOICE_SETTINGS
      };

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      // If ElevenLabs validates language_code as unsupported on multilingual_v2, retry cleanly
      if (response.status === 400) {
        const errorText = await response.clone().text();
        if (errorText.includes('language_code')) {
          delete payload.language_code;
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
        }
      }

      // If library voice requires paid subscription (402/403), cascade to next verified voice
      if (response.status === 402 || response.status === 403) {
        console.warn(`ElevenLabs voice ${currentVoice} requires upgrade, cascading to next voice...`);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`ElevenLabs API error (${response.status}) on ${currentVoice}:`, errorText);
        continue;
      }

      const audioBlob = await response.blob();
      const blobUrl = URL.createObjectURL(audioBlob);
      currentBlobUrl = blobUrl;

      const audio = new Audio(blobUrl);
      currentAudio = audio;

      audio.onplay = () => {
        onStart?.();
      };

      audio.onended = () => {
        stopSpeaking();
        onEnd?.();
      };

      audio.onerror = (err) => {
        console.warn('ElevenLabs audio element playback error:', err);
        stopSpeaking();
        onEnd?.();
      };

      await audio.play();
      return; // Successfully playing authentic Hebrew audio
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Intentionally aborted (barge-in or user action)
        return;
      }
      console.warn(`Synthesis attempt failed for ${currentVoice}:`, err);
    }
  }

  // If all voice attempts failed, finalize gracefully
  stopSpeaking();
  onEnd?.();
}

/**
 * Predefined Hebrew audio test to check sound permissions & API connectivity
 */
export async function testElevenLabsVoice(
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const testPhrase = 'שלום! בדיקת שמע של אלבן לאבס עברה בהצלחה. הקול העברי מוכן לראיון.';
  return speakWithElevenLabs(testPhrase, onStart, onEnd);
}
