import { fileURLToPath, URL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@server": fileURLToPath(new URL("./server", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/openapi.json": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/docs": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ingest": {
        target: "https://eu.i.posthog.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ingest/, ""),
      },
      "/ingest/static": {
        target: "https://eu-assets.i.posthog.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/ingest\/static/, "/static"),
      },
    },
  },
})
