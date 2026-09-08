import { Component } from 'react'
import ErrorPage from '../../pages/ErrorPage'

export default class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidUpdate(previousProps) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false })
    }
  }

  render() {
    if (this.state.hasError) return <ErrorPage onRetry={() => window.location.reload()} />
    return this.props.children
  }
}
