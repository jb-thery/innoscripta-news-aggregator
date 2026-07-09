export const CATEGORIES = ["technology", "business", "world", "health", "media", "science"] as const

export type Category = (typeof CATEGORIES)[number]
