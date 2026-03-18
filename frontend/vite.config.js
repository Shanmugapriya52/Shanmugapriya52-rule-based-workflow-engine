import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external access
    strictPort: true, // Force port 5173, don't use other ports
    open: false // Don't auto-open browser
  }
})