import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Built-in proxy for Google Cloud Hebrew TTS to avoid browser Referer blocking (404)
function hebrewTtsProxyPlugin(): Plugin {
  return {
    name: 'hebrew-tts-proxy',
    configureServer(server) {
      server.middlewares.use('/api/tts', async (req, res) => {
        try {
          const urlObj = new URL(req.url || '', 'http://localhost');
          const text = urlObj.searchParams.get('text') || '';

          if (!text) {
            res.statusCode = 400;
            res.end('Missing text query parameter');
            return;
          }

          const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
            text
          )}&tl=iw&client=tw-ob`;

          const response = await fetch(googleUrl, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          if (!response.ok) {
            res.statusCode = response.status;
            res.end(`TTS fetch error: ${response.statusText}`);
            return;
          }

          const arrayBuffer = await response.arrayBuffer();
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(Buffer.from(arrayBuffer));
        } catch (err: any) {
          console.error('Hebrew TTS Proxy Middleware error:', err);
          res.statusCode = 500;
          res.end('TTS Proxy Error');
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hebrewTtsProxyPlugin()]
});
