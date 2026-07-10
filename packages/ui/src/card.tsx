import type { ComponentProps } from "react"
import { cn } from "./cn.ts"

export function Card({ className, ...props }: ComponentProps<"article">) {
  return <article className={cn("card", className)} {...props} />
}
