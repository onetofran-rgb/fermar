import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path para GitHub Pages: github.com/onetofran-rgb/fermar
  base: '/fermar/',
})
