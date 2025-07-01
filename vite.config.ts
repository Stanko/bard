import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1234,
    host: true,
    allowedHosts: true,
  },
  base: './',
  build: {
    outDir: './docs',
  },
});
