import react from '@vitejs/plugin-react'

/** @type {import('vite').UserConfig} */

export default {
  server: {
    port: 1234,
    host: true,
    allowedHosts: ['motorhead.local'],
  },
  base: './',
  build: {
    outDir: '../docs',
  },
  plugins: [react()],
};
