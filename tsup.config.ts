import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["server/index.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "server-dist",
  clean: true,
  splitting: false,
  dts: false,
  noExternal: [/^@hono\//, "hono", "zod"],
})
