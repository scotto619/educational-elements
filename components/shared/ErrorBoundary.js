// components/shared/ErrorBoundary.js - Error handling system
// Add this file to handle errors gracefully across your app

import React from 'react';
import { Button } from './index';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Here you could send error to logging service
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-4">
            <div className="text-6xl">😞</div>
            <h1 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h1>
            <p className="text-gray-600">
              We're sorry, but something unexpected happened. 
              {this.props.showErrorDetails && this.state.error && (
                <span> The error was: {this.state.error.message}</span>
              )}
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  if (this.props.onReset) this.props.onReset();
                }}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left text-sm bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;