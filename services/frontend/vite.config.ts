import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    host: '100.125.240.114',
    port: 5173,
  },
  plugins: [react()],
})
