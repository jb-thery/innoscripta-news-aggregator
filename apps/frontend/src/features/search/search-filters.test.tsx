import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import "@/lib/i18n"
import { SearchFilters } from "./search-filters"
import type { SearchState } from "./search-state"

const initialSearch: SearchState = {
  q: "innovation",
  providers: "newsapi,guardian,nytimes",
}

describe("search filters", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("should debounce query changes and preserve focus when URL state changes", () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    const { rerender } = render(
      <SearchFilters value={initialSearch} onChange={onChange} onReset={vi.fn()} />,
    )
    const input = screen.getByRole("searchbox", { name: "Search articles" })
    input.focus()

    fireEvent.change(input, { target: { value: "climate" } })
    act(() => vi.advanceTimersByTime(349))
    expect(onChange).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(onChange).toHaveBeenCalledWith({ q: "climate" })

    rerender(
      <SearchFilters
        value={{ ...initialSearch, q: "business" }}
        onChange={onChange}
        onReset={vi.fn()}
      />,
    )
    expect(screen.getByRole("searchbox", { name: "Search articles" })).toHaveValue("business")
    expect(screen.getByRole("searchbox", { name: "Search articles" })).toBe(input)
    expect(input).toHaveFocus()
  })
})
