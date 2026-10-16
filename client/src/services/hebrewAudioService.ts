/**
 * Cloud-Based Hebrew TTS and Web Speech STT Engine
 * Targets the local Vite proxy `/api/tts?text=...` which fetches Google Translate TTS
 * with zero Referer blocking, providing natural, high-clarity Hebrew pronunciation.
 * Includes fallback to window.speechSynthesis if network fails.
 */

export class HebrewAudioService {
  private audio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private isPlayingQueue: boolean = false;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private onSubtitleCallback?: (text: string) => void;
  private currentFullText: string = '';
  private isUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.onplay = () => {
        if (this.onStartCallback) {
          this.onStartCallback();
        }
      };

      this.audio.onended = () => {
        this.playNextChunk();
      };

      this.audio.onerror = (e) => {
        console.warn('HTMLAudio error on chunk, falling back or advancing:', e);
        this.playNextChunk();
      };
    }
  }

  /**
   * Unlock browser audio on user gesture (e.g., clicking start button)
   */
  public unlockAudio(): void {
    if (this.isUnlocked) return;
    this.isUnlocked = true;

    try {
      if (this.audio) {
        // Play silent audio to unlock AudioContext / Audio element
        this.audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        this.audio.play().then(() => {
          this.audio?.pause();
        }).catch(() => {});
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Split Hebrew text into natural chunks <= 140 characters on sentence / clause boundaries
   */
  public chunkText(text: string, maxLen: number = 130): string[] {
    const clean = text
      .replace(/`{1,3}[^`]*`{1,3}/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[*_~#>[\]()]/g, '')
      .replace(/[\u200E\u200F\u200B\u200C\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return [];
    if (clean.length <= maxLen) return [clean];

    const chunks: string[] = [];
    // Split by punctuation
    const sentences = clean.split(/(?<=[.?!,;:\n])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + ' ' + sentence).trim().length <= maxLen) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }

        if (sentence.length <= maxLen) {
          currentChunk = sentence;
        } else {
          // If a single sentence exceeds maxLen, split by space
          const words = sentence.split(' ');
          for (const word of words) {
            if ((currentChunk + ' ' + word).trim().length <= maxLen) {
              currentChunk = (currentChunk + ' ' + word).trim();
            } else {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            }
          }
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Speak Hebrew text via Cloud TTS (or Web Speech fallback)
   */
  public speak(
    text: string,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onSubtitle?: (text: string) => void;
    }
  ): void {
    this.stopSpeaking();
    this.unlockAudio();

    this.currentFullText = text;
    this.onStartCallback = options?.onStart;
    this.onEndCallback = options?.onEnd;
    this.onSubtitleCallback = options?.onSubtitle;

    if (this.onSubtitleCallback) {
      this.onSubtitleCallback(text);
    }

    const chunks = this.chunkText(text);
    if (chunks.length === 0) {
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    this.queue = chunks;
    this.isPlayingQueue = true;
    this.playNextChunk();
  }

  private playNextChunk(): void {
    if (!this.isPlayingQueue) return;

    if (this.queue.length === 0) {
      this.isPlayingQueue = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
      return;
    }

    const nextChunk = this.queue.shift();
    if (!nextChunk) {
      this.isPlayingQueue = false;
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    // Use local proxy `/api/tts?text=...` to ensure Google female Hebrew TTS
    const url = `/api/tts?text=${encodeURIComponent(nextChunk)}`;

    if (!this.audio) {
      this.audio = new Audio();
    }

    this.audio.src = url;
    this.audio.load();

    const playPromise = this.audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Cloud audio playback blocked or failed, attempting speech synthesis fallback:', err);
        // Fallback to Web Speech API synthesis with warm female voice for this chunk
        this.fallbackSpeechSynthesis(nextChunk, () => {
          this.playNextChunk();
        });
      });
    }
  }

  /**
   * Fallback using browser SpeechSynthesis with a warm, natural female voice
   */
  private fallbackSpeechSynthesis(chunk: string, onDone: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = 'he-IL';
      utterance.rate = 0.95; // Calm, relaxed conversational cadence
      utterance.pitch = 1.0; // Warm, natural human female pitch (no chipmunk artifact)
      utterance.volume = 1.0;

      // Select high-quality female Hebrew voice (strictly avoiding male voices like Asaf)
      const voices = window.speechSynthesis.getVoices();
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

      const femaleHeVoice =
        hebrewVoices.find(
          (v) =>
            v.name.toLowerCase().includes('hila') ||
            v.name.toLowerCase().includes('natural')
        ) ||
        hebrewVoices.find((v) => v.name.toLowerCase().includes('google')) ||
        hebrewVoices.find(
          (v) =>
            v.name.toLowerCase().includes('carmit') ||
            v.name.includes('כרמית')
        ) ||
        hebrewVoices.find(
          (v) =>
            v.name.toLowerCase().includes('sara') ||
            v.name.toLowerCase().includes('carmel')
        ) ||
        hebrewVoices[0];

      if (femaleHeVoice) {
        utterance.voice = femaleHeVoice;
      }

      utterance.onstart = () => {
        if (this.onStartCallback) this.onStartCallback();
      };

      utterance.onend = () => {
        onDone();
      };

      utterance.onerror = () => {
        onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      onDone();
    }
  }

  /**
   * Immediately abort any speaking audio (Barge-In)
   */
  public stopSpeaking(): void {
    this.isPlayingQueue = false;
    this.queue = [];

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.removeAttribute('src');
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignored
      }
    }

    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  public isSpeaking(): boolean {
    return this.isPlayingQueue;
  }

  public getCurrentText(): string {
    return this.currentFullText;
  }
}

// Global singleton instance
export const hebrewAudio = new HebrewAudioService();

// Automatically unlock audio on the very first user interaction
if (typeof window !== 'undefined') {
  const unlock = () => {
    hebrewAudio.unlockAudio();
    window.removeEventListener('click', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
}
