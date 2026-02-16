import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-white bg-red-900/20 min-h-screen flex flex-col items-center justify-center">
                    <div className="glass-card p-8 rounded-2xl max-w-2xl w-full border border-red-500/30">
                        <h1 className="text-2xl font-bold mb-4 text-red-400">Application Error</h1>
                        <p className="text-white/60 mb-4">Something went wrong in this component.</p>
                        <div className="bg-black/50 p-4 rounded-xl overflow-auto text-xs font-mono text-red-200 max-h-96">
                            <p className="font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
