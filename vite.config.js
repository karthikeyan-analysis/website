import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // Proxy API requests to local Express API (server/)
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
