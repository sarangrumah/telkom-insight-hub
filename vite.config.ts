import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // IMPORTANT: This ensures assets load from domain.com/panel/assets/
  // instead of domain.com/assets/
  base: "/panel/",

  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/panel/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/panel/uploads': {
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
      // This ensures that all routes under /panel/ are served by index.html
      // allowing client-side routing to work properly
      rewrites: [
        { from: /^\/panel\/.*$/, to: '/panel/index.html' },
      ],
    },
  },
  preview: {
    host: "::",
    port: 8080,
    proxy: {
      '/panel/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/panel/uploads': {
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
      // This ensures that all routes under /panel/ are served by index.html
      // allowing client-side routing to work properly
      rewrites: [
        { from: /^\/panel\/.*$/, to: '/panel/index.html' },
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