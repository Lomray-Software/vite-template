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
    const { hasError } = this.state;
    const { children } = this.props;

    if (hasError) {
      return <h3>Something went wrong.</h3>;
    }

    return children;
  }
}

export default ErrorBoundary;
