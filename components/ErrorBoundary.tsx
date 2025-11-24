import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-2xl w-full bg-slate-900 rounded-2xl border border-red-500/20 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Une erreur s'est produite
                </h1>
                <p className="text-slate-400">
                  L'application a rencontré une erreur inattendue. Veuillez recharger la page.
                </p>
              </div>
            </div>

            {this.state.error && (
              <details className="mb-6 bg-black/30 rounded-lg p-4 border border-white/5">
                <summary className="text-sm font-medium text-slate-300 cursor-pointer mb-2">
                  Détails techniques
                </summary>
                <div className="text-xs text-red-400 font-mono mt-2 overflow-auto">
                  <div className="mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Recharger l'application
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              Si le problème persiste, essayez de vider le cache de votre navigateur.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
