import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { serve } from "@hono/node-server"
import { serveStatic } from "@hono/node-server/serve-static"
import { app } from "./app"

const port = Number(process.env.PORT ?? 3000)
const hostname = process.env.HOST
const defaultStaticRoot = resolve(import.meta.dirname, "../../frontend/dist")
const staticRoot = process.env.STATIC_ROOT ? resolve(process.env.STATIC_ROOT) : defaultStaticRoot
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

const server = serve({
  fetch: app.fetch,
  ...(hostname ? { hostname } : {}),
  port,
})

const shutdown = (signal: NodeJS.Signals) => {
  console.info(`Received ${signal}, closing the news aggregator server`)
  server.close((error) => {
    if (error) {
      console.error("Failed to close the news aggregator server", error)
      process.exitCode = 1
    }
  })
}

process.once("SIGINT", shutdown)
process.once("SIGTERM", shutdown)

console.info(`News aggregator server listening on http://${hostname ?? "localhost"}:${port}`)
