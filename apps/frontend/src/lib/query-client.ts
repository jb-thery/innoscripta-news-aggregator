import { QueryClient } from "@tanstack/react-query"
import { ApiError } from "@/api/http-client"

const shouldRetry = (failureCount: number, error: Error) => {
  if (error instanceof ApiError && [400, 401, 403, 404, 429].includes(error.status)) {
    return false
  }

  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
  },
})
