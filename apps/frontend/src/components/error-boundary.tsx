import { Component, type ErrorInfo, type ReactNode } from "react"
import { reportError } from "@/lib/analytics"
import { i18n } from "@/lib/i18n"

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
    void reportError({ error, componentStack: info.componentStack })
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <p>{i18n.t("states.fatalError")}</p>
          <button type="button" onClick={() => window.location.reload()}>
            {i18n.t("states.reload")}
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
