import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// The API (backend/) listens on :3000; both dev and preview forward these to it
const proxy = {
  "/api": "http://localhost:3000",
  "/uploads": "http://localhost:3000",
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8443,
    strictPort: true,
    proxy,
  },
  preview: {
    port: 8443,
    proxy,
  },
})
