import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("PulmoXAI UI Error Boundary Caught Exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-4xl my-12 p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-slate-100 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-4 text-rose-400">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-xl font-bold">UI Component Rendering Error</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            An unexpected error occurred while rendering the analysis result view.
          </p>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto mb-6">
            {this.state.error?.toString()}
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition"
          >
            <RefreshCw className="w-4 h-4" /> Reset Analysis View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
