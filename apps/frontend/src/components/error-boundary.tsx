import { Component, type ErrorInfo, type ReactNode } from "react"
import { reportError } from "@/lib/analytics"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError({ error, componentStack: info.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <p>Signal Desk could not render this view.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload the application
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
