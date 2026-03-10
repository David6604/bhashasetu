import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for the current mode (development, production, …)
  const env = loadEnv(mode, process.cwd(), '')

  const apiUrl = env.VITE_API_URL ?? 'http://localhost:3000'

  return {
    plugins: [react()],

    server: {
      port: 5173,
      // Proxy /api/* → backend so you can also call relative /api/translate
      // from the frontend if you prefer that pattern.
      proxy: {
        '/api': {
          target:      apiUrl,
          changeOrigin: true,
          rewrite:     (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    // Explicit env prefix — keeps the bundle safe
    envPrefix: 'VITE_',
  }
})
