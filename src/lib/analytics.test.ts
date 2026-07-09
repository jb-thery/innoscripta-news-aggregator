import { API_PATHS } from "@shared/paths"
import posthog from "posthog-js"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    captureException: vi.fn(),
  },
}))

describe("analytics client", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("should not capture events when analytics is disabled", async () => {
    vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "")
    vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "")
    const { safeCapture } = await import("./analytics")

    safeCapture("news_search")

    expect(posthog.capture).not.toHaveBeenCalled()
  })

  it("should capture events when analytics is configured", async () => {
    vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "test-key")
    vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", API_PATHS.analytics)
    const { safeCapture } = await import("./analytics")

    safeCapture("news_search", { query_length: 4 })

    expect(posthog.capture).toHaveBeenCalledWith("news_search", { query_length: 4 })
  })

  it("should not report exceptions when analytics is disabled", async () => {
    vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "")
    vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "")
    const { reportError } = await import("./analytics")

    reportError(new Error("render failed"))

    expect(posthog.captureException).not.toHaveBeenCalled()
  })

  it("should report exceptions when analytics is configured", async () => {
    vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "test-key")
    vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", API_PATHS.analytics)
    const { reportError } = await import("./analytics")
    const error = new Error("render failed")

    reportError(error)

    expect(posthog.captureException).toHaveBeenCalledWith(error)
  })
})
