import { Component, type ReactNode } from "react"
import { Div, H2, Text } from "./platform"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Div style={{ padding: 20 }}>
            <H2 style={{ color: "red", marginBottom: 10 }}>
              Something went wrong
            </H2>
            <Div>
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                Error details:
              </Text>
              <Text style={{ fontFamily: "monospace" }}>
                {this.state.error?.message}
              </Text>
            </Div>
          </Div>
        )
      )
    }

    return this.props.children
  }
}
