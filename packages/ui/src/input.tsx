import type { ComponentProps } from "react"
import { cn } from "./cn.ts"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("input", className)} {...props} />
}
