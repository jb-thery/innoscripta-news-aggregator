import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { cn } from "./cn.ts"

const buttonVariants = cva("button", {
  variants: {
    variant: {
      primary: "button--primary",
      outline: "button--outline",
      ghost: "button--ghost",
      icon: "button--icon",
    },
    size: {
      default: "button--default",
      small: "button--small",
      icon: "button--icon-size",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
})

interface ButtonProps extends ComponentProps<"button">, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} type={type} {...props} />
  )
}
