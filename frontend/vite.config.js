import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "KisanSight", short_name: "KisanSight",
        description: "Sell/Hold signal for Indian farmers",
        theme_color: "#1a5c2a", background_color: "#f0f7f1", display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        runtimeCaching: [{
          urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
          handler: "NetworkFirst",
          options: { cacheName: "weather-cache", expiration: { maxAgeSeconds: 3600 } },
        }],
      },
    }),
  ],
  server: { proxy: { "/api": "http://localhost:8000" } },
});
