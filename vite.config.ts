import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-ignore
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Estevia DevOps Hub',
        short_name: 'EvaOps',
        description: 'Estevia DevOps Cloud and Infrastructure Control Plane',
        theme_color: '#070a12',
        background_color: '#070a12'
      }
    })
  ],
})
