export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function httpClient<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const message = await response.text()
    throw new ApiError(response.status, message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
