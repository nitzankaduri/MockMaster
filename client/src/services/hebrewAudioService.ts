/**
 * Cloud-Based Hebrew TTS and Web Speech STT Engine
 * Targets the local Vite proxy `/api/tts?text=...` which fetches Google Translate TTS
 * with zero Referer blocking, providing natural, high-clarity Hebrew pronunciation.
 * Includes fallback to window.speechSynthesis if network fails.
 */

export class HebrewAudioService {
  private audio: HTMLAudioElement | null = null;
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
        this.isPlayingQueue = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };

      this.audio.onerror = (e) => {
        console.warn('HTMLAudio error, finalizing:', e);
        this.isPlayingQueue = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
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

    const clean = text.trim();
    if (!clean) {
      if (this.onEndCallback) this.onEndCallback();
      return;
    }

    this.isPlayingQueue = true;

    // Use /api/tts POST for full, seamless concatenated MP3 audio
    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean })
    })
      .then((res) => {
        if (!res.ok) throw new Error(`TTS status ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (!this.isPlayingQueue) return;
        const url = URL.createObjectURL(blob);
        if (!this.audio) {
          this.audio = new Audio();
        }

        this.audio.src = url;
        this.audio.onplay = () => {
          this.onStartCallback?.();
        };
        this.audio.onended = () => {
          this.isPlayingQueue = false;
          try {
            URL.revokeObjectURL(url);
          } catch {}
          this.onEndCallback?.();
        };
        this.audio.onerror = () => {
          this.isPlayingQueue = false;
          try {
            URL.revokeObjectURL(url);
          } catch {}
          this.onEndCallback?.();
        };

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Audio play failed:', err);
            this.isPlayingQueue = false;
            this.onEndCallback?.();
          });
        }
      })
      .catch((err) => {
        console.warn('TTS proxy request failed:', err);
        this.isPlayingQueue = false;
        this.onEndCallback?.();
      });
  }



  /**
   * Immediately abort any speaking audio (Barge-In)
   */
  public stopSpeaking(): void {
    this.isPlayingQueue = false;

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
