import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Remove this line - don't proxy /oauth2
      // '/oauth2': {
      //   target: 'http://localhost:8080',
      //   changeOrigin: true,
      // },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  resolve: {
    alias: {
      util: 'util',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['sockjs-client'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
})