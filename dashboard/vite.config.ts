import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    fs: {
      // Allow serving files from the project root and the parent directory where /data resides
      allow: ['..']
    }
  }
});
