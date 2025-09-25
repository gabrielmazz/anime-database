import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/anime-database/',
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // força a checagem (bom em WSL/Docker)
    },
    host: true, // deixa acessível na rede local
    port: 5173,
  },
})
