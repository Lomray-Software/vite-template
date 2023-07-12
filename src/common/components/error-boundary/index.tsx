import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface IErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary
 */
class ErrorBoundary extends Component<{ children: ReactNode }, IErrorBoundaryState> {
  /**
   * State
   */
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <h3>Something went wrong.</h3>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
