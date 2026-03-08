/// <reference types="vitest/config" />
import { defineConfig } from 'vite'

const apiTarget = process.env.VITE_BACKEND_URL ?? 'http://localhost:8002'

export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/types.ts'],
    },
  },
  server: {
    port: 3002,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: apiTarget, changeOrigin: true, configure: (p) => p.on('error', () => {}) },
      '/health': { target: apiTarget, changeOrigin: true, configure: (p) => p.on('error', () => {}) },
    },
  },
  build: {
    outDir: 'dist',
  },
})
