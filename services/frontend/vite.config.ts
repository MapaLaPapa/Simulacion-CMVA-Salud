import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '100.125.240.114', // Aquí pegas tu IP de Tailscale
    port: 5173,        // El puerto que prefieras
  },
  plugins: [react()],
})
