import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { app } from "./app"
import { OPEN_API_INFO } from "./routes/documentation"

const document = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: OPEN_API_INFO,
})

writeFileSync(
  resolve(process.cwd(), "../../packages/contracts/openapi.json"),
  `${JSON.stringify(document, null, 2)}\n`,
)
