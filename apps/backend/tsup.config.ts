import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  splitting: false,
  dts: false,
  noExternal: [/^@hono\//, /^@signal-desk\//, "hono", "zod"],
})
