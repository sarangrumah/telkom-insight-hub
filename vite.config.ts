import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // IMPORTANT: This ensures assets load from domain.com/v2/panel/assets/
  // instead of domain.com/assets/
  base: "/v2/panel/",

  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/v2/panel/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/v2/panel/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      // Keep the original /uploads proxy for direct file access
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: {
      // This ensures that all routes under /v2/panel/ are served by index.html
      // allowing client-side routing to work properly
      rewrites: [
        { from: /^\/v2\/panel\/.*$/, to: '/v2/panel/index.html' },
      ],
    },
  },
  preview: {
    host: "::",
    port: 8080,
    proxy: {
      '/v2/panel/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/v2/panel/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      // Keep the original /uploads proxy for direct file access
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: {
      // This ensures that all routes under /v2/panel/ are served by index.html
      // allowing client-side routing to work properly
      rewrites: [
        { from: /^\/v2\/panel\/.*$/, to: '/v2/panel/index.html' },
      ],
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));