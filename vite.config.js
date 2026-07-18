import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
          'motion-vendor': ['framer-motion'],
          'ui-vendor': ['@headlessui/react', 'react-icons', 'clsx', 'canvas-confetti'],
          'data-vendor': ['axios', 'socket.io-client', 'react-virtuoso'],
        },
      },
    },
  },
})
