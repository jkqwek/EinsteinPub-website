import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

// Django (backend/) runs on :8000; dev and preview forward its paths to it:
// the API, static files, and uploaded photos.
// NOTE: "/admin" is NOT proxied — that path is the React admin SPA.
// Django's own admin is reachable directly at http://localhost:8000/admin/
const django = "http://localhost:8000"
const proxy = {
  "/api": django,
  "/static": django,
  "/media": django,
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