import { defineConfig } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 10000,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 10000,
    allowedHosts: ['ai-finance-saas-client.onrender.com', '.onrender.com'],
  },
})
