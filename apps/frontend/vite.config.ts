import { fileURLToPath, URL } from "node:url"
import { API_PATHS } from "@signal-desk/contracts"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

const workspaceRoot = fileURLToPath(new URL("../../", import.meta.url))

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, workspaceRoot, "VITE_"), ...process.env }
  const apiTarget = `http://localhost:${env.VITE_API_PORT ?? "3000"}`

  return {
    base: env.VITE_BASE_PATH ?? "/",
    envDir: workspaceRoot,
    define: {
      __HASH_ROUTING__: JSON.stringify(env.VITE_HASH_ROUTING === "true"),
      __STATIC_MOCK__: JSON.stringify(env.VITE_ENABLE_MOCK_DATA === "true"),
    },
    plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        [API_PATHS.root]: {
          target: apiTarget,
          changeOrigin: true,
        },
        [API_PATHS.openApi]: {
          target: apiTarget,
          changeOrigin: true,
        },
        [API_PATHS.docs]: {
          target: apiTarget,
          changeOrigin: true,
        },
        [API_PATHS.analytics]: {
          target: "https://eu.i.posthog.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ingest/, ""),
        },
        [API_PATHS.analyticsAssets]: {
          target: "https://eu-assets.i.posthog.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/ingest\/static/, "/static"),
        },
      },
    },
  }
})
