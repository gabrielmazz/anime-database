import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use base diferente no dev e no build para não quebrar o localhost
export default defineConfig(({ command }) => ({
  // Em produção (build/preview) usamos o subcaminho do GitHub Pages;
  // no dev mantemos '/' para que http://localhost:5173/ funcione.
  base: command === 'build' ? '/anime-database/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true, // força a checagem (bom em WSL/Docker)
    },
    host: true, // deixa acessível na rede local
    port: 5173,
  },
}))
