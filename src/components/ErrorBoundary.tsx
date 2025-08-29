import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
    
    // Log to monitoring service in production
    if (import.meta.env.PROD) {
      // Add your monitoring service here (e.g., Sentry, LogRocket)
      console.error('Production Error:', { error, errorInfo, timestamp: new Date().toISOString() });
    }
    
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Oops! Something went wrong</h1>
              <p className="text-muted-foreground">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                <h3 className="font-medium text-red-800 mb-2">Error Details (Development Mode)</h3>
                <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={this.handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>If this problem persists, please contact support.</p>
              <p>Error ID: {Date.now().toString(36)}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Error Component
export function LoadingError({ 
  message = "Failed to load data", 
  onRetry,
  showRetry = true 
}: { 
  message?: string; 
  onRetry?: () => void;
  showRetry?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="p-3 bg-red-100 rounded-full">
        <AlertTriangle className="w-6 h-6 text-red-600" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="font-medium text-foreground">Unable to Load Data</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Network Error Component  
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
      <div className="p-3 bg-yellow-100 rounded-full">
        <AlertTriangle className="w-6 h-6 text-yellow-600" />
      </div>
      <div className="space-y-2">
        <h3 className="font-medium text-foreground">Connection Problem</h3>
        <p className="text-sm text-muted-foreground">
          Please check your internet connection and try again.
        </p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}