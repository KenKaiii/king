import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // `onCaughtError` at the React root now logs to electron-log. No need to
  // duplicate the console.error here — keeping this method empty would be
  // dead code, so we omit it entirely. `getDerivedStateFromError` still
  // handles the state transition to the fallback UI.

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="rounded-full bg-[var(--base-color-brand--light-pink)] p-4">
            <svg
              className="h-8 w-8 text-[var(--base-color-brand--dark-red)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-center">
            <h2
              className="text-lg font-semibold text-[var(--base-color-brand--bean)]"
              style={{ fontFamily: 'var(--text-color--font-family--heading)' }}
            >
              Something went wrong
            </h2>
            <p className="mt-1 text-sm text-[var(--base-color-brand--umber)]">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={this.handleReset} className="btn-cinamon btn-sm">
              Try Again
            </button>
            <button onClick={() => window.location.reload()} className="btn-shell btn-sm">
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
