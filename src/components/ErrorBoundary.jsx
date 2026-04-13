import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-error-500/10 border border-error-500/20 rounded-3xl max-w-md mx-auto my-10">
          <div className="h-16 w-16 bg-error-500/20 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl text-error-400">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-50 mb-2">Something went wrong</h2>
          <p className="text-sm text-neutral-400 mb-6">
            We encountered an unexpected error while rendering this profile. 
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-all font-semibold"
          >
            Reload Page
          </button>
          
          <div className="mt-4 p-4 bg-black/40 rounded-lg text-left overflow-auto max-w-full">
            <code className="text-[10px] text-error-300 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </code>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
