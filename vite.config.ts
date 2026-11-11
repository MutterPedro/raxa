import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // manifest filled in T1.2(b) with the brand (it was the plugin's green default,
    // with no icons); install/offline UX still scheduled for T4.1
    VitePWA({
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
