"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface BlockErrorBoundaryProps {
  children: ReactNode;
  blockId: string;
  blockType?: string;
  onReset?: () => void;
}

interface BlockErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component for block rendering.
 * Catches JavaScript errors in block components and displays a fallback UI.
 */
export class BlockErrorBoundary extends Component<
  BlockErrorBoundaryProps,
  BlockErrorBoundaryState
> {
  constructor(props: BlockErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<BlockErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log error details for debugging
    console.error(
      `BlockErrorBoundary caught an error in block "${this.props.blockId}" (type: ${this.props.blockType || "unknown"}):`,
      error,
      errorInfo
    );
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="w-full p-4 rounded-lg bg-red-50/10 border border-red-200/30 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 rounded-full bg-red-100/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                Block rendering error
              </h4>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-400/80">
                Something went wrong while rendering this block
                {this.props.blockType && ` (${this.props.blockType})`}.
              </p>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mt-2">
                  <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
                    Error details
                  </summary>
                  <pre className="mt-1 p-2 text-xs bg-red-900/10 rounded overflow-auto max-h-24 text-red-600">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        {"\n\nComponent Stack:"}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={this.handleReset}
              className="flex-shrink-0 p-2 rounded-md hover:bg-red-100/30 transition-colors group"
              title="Try again"
            >
              <RefreshCcw className="h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap a component with BlockErrorBoundary
 */
export function withBlockErrorBoundary<P extends { block: { id: string; type?: string } }>(
  WrappedComponent: React.ComponentType<P>,
  onReset?: () => void
): React.FC<P> {
  const ComponentWithErrorBoundary: React.FC<P> = (props) => {
    return (
      <BlockErrorBoundary
        blockId={props.block.id}
        blockType={props.block.type}
        onReset={onReset}
      >
        <WrappedComponent {...props} />
      </BlockErrorBoundary>
    );
  };

  ComponentWithErrorBoundary.displayName = `withBlockErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithErrorBoundary;
}
