import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    exclude: ["apps/frontend/e2e/**", "**/node_modules/**", "**/dist/**"],
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: [
            "apps/backend/src/**/*.test.ts",
            "packages/contracts/src/**/*.test.ts",
            "packages/news-domain/src/**/*.test.ts",
          ],
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          environment: "jsdom",
          include: ["apps/frontend/src/**/*.test.{ts,tsx}", "packages/ui/src/**/*.test.{ts,tsx}"],
          setupFiles: ["./apps/frontend/src/test/setup.ts"],
        },
      },
    ],
    coverage: {
      include: [
        "apps/backend/src/**/*.ts",
        "apps/frontend/src/**/*.ts",
        "packages/contracts/src/**/*.ts",
        "packages/news-domain/src/**/*.ts",
        "packages/ui/src/**/*.ts",
      ],
      exclude: [
        "**/*.test.ts",
        "**/*.tsx",
        "**/src/index.ts",
        "apps/backend/src/index.ts",
        "apps/backend/src/openapi.ts",
        "apps/frontend/src/api/generated/**",
        "apps/frontend/src/routeTree.gen.ts",
        "apps/frontend/src/test/**",
        "apps/frontend/src/vite-env.d.ts",
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
      "@": fileURLToPath(new URL("./apps/frontend/src", import.meta.url)),
    },
  },
})
