import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { wedding } from './src/config/wedding';
import { formatEventDate } from './src/lib/date';

/** Page title and share-preview text in index.html, written from the config (names and date live only there). */
function weddingMeta(): Plugin {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const { groom, bride } = wedding.couple;
  const names = `${groom.name.km} និង ${bride.name.km}`;
  const date = formatEventDate();
  const values: Record<string, string> = {
    WEDDING_TITLE: `${wedding.meta.title.km} · ${names}`,
    WEDDING_DESCRIPTION: `សូមគោរពអញ្ជើញចូលរួមពិធីអាពាហ៍ពិពាហ៍ ${names} · ${date.km}`,
    WEDDING_DATE: `${date.km} · ${date.en}`,
  };
  return {
    name: 'wedding-meta',
    transformIndexHtml: (html) => html.replace(/%(WEDDING_[A-Z_]+)%/g, (m, key: string) => (key in values ? esc(values[key]) : m)),
  };
}

export default defineConfig({
  plugins: [react(), weddingMeta()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Three.js is only needed by the ceremonial opening; keep it in its own lazily-loaded chunk.
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
        },
      },
    },
  },
});
