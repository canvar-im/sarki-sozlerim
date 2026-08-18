import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // word-extractor (used for legacy .doc lyric imports) is a Node-oriented
      // library that expects real Buffer/stream/fs APIs. Without these
      // polyfills the browser bundle silently gets non-functional stubs for
      // "buffer" and friends, so extract() always throws and .doc import
      // never works. This provides working browser equivalents.
      nodePolyfills({
        include: ['buffer', 'stream', 'util', 'events', 'zlib', 'path'],
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
