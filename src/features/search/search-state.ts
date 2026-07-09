import { z } from "zod"
import { ALL_PROVIDER_IDS } from "@/lib/providers"

const optionalString = z.preprocess(
  (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
  z.string().optional(),
)

export const searchStateSchema = z.object({
  q: z.string().catch("innovation").default("innovation"),
  from: optionalString,
  to: optionalString,
  category: optionalString,
  providers: z.string().catch(ALL_PROVIDER_IDS).default(ALL_PROVIDER_IDS),
  author: optionalString,
})

export type SearchState = z.infer<typeof searchStateSchema>

export const DEFAULT_SEARCH: SearchState = {
  q: "innovation",
  providers: ALL_PROVIDER_IDS,
}
