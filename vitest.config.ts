import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**", "server-dist/**"],
    coverage: {
      include: ["server/**/*.ts", "src/**/*.ts"],
      exclude: [
        "**/*.test.ts",
        "server/index.ts",
        "server/openapi.ts",
        "src/api/generated/**",
        "src/routeTree.gen.ts",
        "src/test/**",
        "src/vite-env.d.ts",
      ],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        branches: 65,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@server": fileURLToPath(new URL("./server", import.meta.url)),
      "@shared": fileURLToPath(new URL("./shared", import.meta.url)),
    },
  },
})
