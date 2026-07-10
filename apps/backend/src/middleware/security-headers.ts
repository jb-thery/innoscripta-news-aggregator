import { API_PATHS } from "@signal-desk/contracts"
import type { Context, Next } from "hono"

const contentSecurityPolicy = (path: string) => {
  const isApiDocumentation = path === API_PATHS.docs
  const scriptSources = isApiDocumentation
    ? "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    : "script-src 'self'"
  const styleSources = isApiDocumentation
    ? "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    : "style-src 'self' 'unsafe-inline'"
  const connectSources = isApiDocumentation
    ? "connect-src 'self' https://cdn.jsdelivr.net"
    : "connect-src 'self'"

  return [
    "default-src 'self'",
    scriptSources,
    styleSources,
    "img-src 'self' https: data:",
    "font-src 'self' data:",
    connectSources,
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ")
}

export const securityHeaders = async (context: Context, next: Next) => {
  await next()

  context.header("X-Content-Type-Options", "nosniff")
  context.header("Referrer-Policy", "strict-origin-when-cross-origin")
  context.header("X-Frame-Options", "DENY")
  context.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  )
  context.header("Content-Security-Policy", contentSecurityPolicy(context.req.path))
}
