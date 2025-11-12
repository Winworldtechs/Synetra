// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    // Enable HMR over ngrok HTTPS domain to avoid mixed-content issues
    hmr: {
      host: '*',
      protocol: 'wss',
      clientPort: 443
    },
    // Ensure asset URLs resolve correctly when accessed via the ngrok domain
    origin: 'https://52267914a889.ngrok-free.app'
  },
  build: {
    outDir: 'dist'
  }
});

