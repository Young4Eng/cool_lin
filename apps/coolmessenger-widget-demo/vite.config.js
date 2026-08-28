import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        // Main virtual-desktop app (CoolMessenger + in-app widget window)
        main: resolve(__dirname, 'index.html'),
        // Standalone desktop calendar widget — opened as its own popup window
        // via window.open() so it can live outside the main app window,
        // simulating a widget pinned on the teacher's PC.
        widget: resolve(__dirname, 'widget.html'),
      },
    },
  },
});
