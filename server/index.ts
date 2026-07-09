import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { app } from "./app"

const port = Number(process.env.PORT ?? 3000)
const staticRoot = resolve(process.cwd(), process.env.STATIC_ROOT ?? "dist")
const indexPath = resolve(staticRoot, "index.html")

if (existsSync(staticRoot)) {
  app.use("/assets/*", serveStatic({ root: staticRoot }))
  app.use("/favicon.ico", serveStatic({ path: resolve(staticRoot, "favicon.ico") }))
  app.use("/favicon.svg", serveStatic({ path: resolve(staticRoot, "favicon.svg") }))
  app.use("/*", serveStatic({ root: staticRoot }))
  app.get("*", (context) => {
    if (!existsSync(indexPath)) {
      return context.notFound()
    }

    return context.html(readFileSync(indexPath, "utf8"))
  })
}

serve({
  fetch: app.fetch,
  port,
})

console.info(`News aggregator server listening on http://localhost:${port}`)
