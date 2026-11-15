import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA install/offline UX: branded manifest, themed theme-color metas in
    // index.html + src/infra/theme.ts, safe-area padding, and a precache that covers
    // the self-hosted fonts. autoUpdate so returning users get the new shell without a prompt.
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Default is js/css/html/ico/png/svg/webmanifest — the woff2 fonts must be
        // precached too, otherwise the offline shell renders in a fallback font.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
      },
      manifest: {
        name: 'raxa',
        short_name: 'raxa',
        description: 'Divida as contas com os amigos direto no celular — funciona offline.',
        lang: 'pt-BR',
        theme_color: '#C2410C',
        background_color: '#FAF6F0',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
    tailwindcss(),
  ],
});
