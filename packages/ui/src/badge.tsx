import type { ComponentProps } from "react"
import { cn } from "./cn.ts"

interface BadgeProps extends ComponentProps<"span"> {
  tone?: "neutral" | "accent" | "success" | "danger"
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return <span className={cn("badge", `badge--${tone}`, className)} {...props} />
}
