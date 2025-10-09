import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    allowedHosts: [
      '33d6ce07c902.ngrok-free.app',
      'desiccative-approvingly-juanita.ngrok-free.dev',
      '.ngrok-free.app', // Allow any ngrok subdomain
      '.ngrok-free.dev', // Allow any ngrok-free.dev subdomain
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
  