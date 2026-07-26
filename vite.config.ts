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
      devOptions: {
        enabled: true
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.png', 'favicon.svg', 'manifest-icon-192.png', 'manifest-icon-512.png'],
      manifest: {
        name: 'Estevia DevOps Hub',
        short_name: 'EvaOps',
        description: 'Estevia DevOps Cloud and Infrastructure Control Plane',
        theme_color: '#059669',
        background_color: '#070a12',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/manifest-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/manifest-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/manifest-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
