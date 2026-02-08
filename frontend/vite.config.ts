import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Handle __dirname in ESM
// Handle __dirname in ESM
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// On Windows, pathname might need simpler handling, but usually implicit conversion works or use fileURLToPath from 'url'
// Better approach:

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
