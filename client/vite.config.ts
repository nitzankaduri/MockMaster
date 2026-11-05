import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Helper to chunk Hebrew text safely for Google Translate TTS (limit <= 130 chars)
function chunkHebrewText(text: string, maxLen = 130): string[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  if (clean.length <= maxLen) return [clean];

  const chunks: string[] = [];
  const sentences = clean.split(/(?<=[.?!;:\n])\s+/);
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) {
        chunks.push(current);
        current = '';
      }
      if (s.length <= maxLen) {
        current = s;
      } else {
        const clauses = s.split(/(?<=[,])\s+/);
        for (const c of clauses) {
          if ((current + ' ' + c).trim().length <= maxLen) {
            current = (current + ' ' + c).trim();
          } else {
            if (current) chunks.push(current);
            if (c.length <= maxLen) {
              current = c;
            } else {
              const words = c.split(' ');
              for (const w of words) {
                if ((current + ' ' + w).trim().length <= maxLen) {
                  current = (current + ' ' + w).trim();
                } else {
                  if (current) chunks.push(current);
                  current = w;
                }
              }
            }
          }
        }
      }
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

// Built-in proxy for Google Cloud Hebrew TTS to avoid browser Referer blocking (404)
// Automatically handles text chunking and seamless MP3 concatenation
function hebrewTtsProxyPlugin(): Plugin {
  const handler = async (req: any, res: any) => {
    try {
      let text = '';
      if (req.method === 'POST') {
        const body = await new Promise<string>((resolve) => {
          let data = '';
          req.on('data', (chunk: any) => (data += chunk));
          req.on('end', () => resolve(data));
        });
        try {
          const parsed = JSON.parse(body);
          text = parsed.text || '';
        } catch {
          text = body;
        }
      } else {
        const urlObj = new URL(req.url || '', 'http://localhost');
        text = urlObj.searchParams.get('text') || '';
      }

      if (!text || !text.trim()) {
        res.statusCode = 400;
        res.end('Missing text query parameter');
        return;
      }

      const chunks = chunkHebrewText(text.trim(), 130);
      if (chunks.length === 0) {
        res.statusCode = 400;
        res.end('Empty text after processing');
        return;
      }

      // Fetch all audio chunks in parallel
      const buffers = await Promise.all(
        chunks.map(async (chunk) => {
          const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            chunk
          )}&tl=iw&client=tw-ob`;

          const response = await fetch(googleUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          if (!response.ok) {
            throw new Error(`Google TTS status ${response.status} for chunk: ${chunk.slice(0, 30)}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        })
      );

      // Concatenate all valid MP3 chunk buffers into one single seamless MP3 file
      const combinedMp3 = Buffer.concat(buffers);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Length', combinedMp3.length);
      res.end(combinedMp3);
    } catch (err: any) {
      console.error('Hebrew TTS Proxy Middleware error:', err);
      res.statusCode = 500;
      res.end('TTS Proxy Error');
    }
  };

  return {
    name: 'hebrew-tts-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tts', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/tts', handler);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hebrewTtsProxyPlugin()]
});
