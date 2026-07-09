import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { app } from "./app"

const document = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: {
    title: "Innoscripta News Aggregator BFF",
    version: "1.0.0",
    description: "Contract-first BFF that normalizes NewsAPI, The Guardian, and NYT articles.",
  },
})

writeFileSync(resolve(process.cwd(), "openapi.json"), `${JSON.stringify(document, null, 2)}\n`)
