import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function Card({ className, ...props }: ComponentProps<"article">) {
  return <article className={cn("card", className)} {...props} />
}
