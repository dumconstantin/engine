import React from "react";
import type { ProducerMeta } from "@c11/engine.types";

export class ErrorBoundary extends React.Component<
  any,
  {
    error: Error | null;
    parentViewId: string;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, parentViewId: props.viewId };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <DefaultError
          error={this.state.error}
          viewId={this.state.parentViewId}
        />
      );
    }
    return this.props.children;
  }
}

type ViewErrorBoundaryProps = {
  viewId: string;
  meta: ProducerMeta;
  errorFallback: (
    error: Error,
    viewId: string,
    viewMeta: ProducerMeta
  ) => React.ReactElement;
  children?: React.ReactNode;
};

/**
 * Error boundary for a view's render output. On error it asks the render
 * module for a fallback (which applies the user-supplied `onError` handler)
 * and renders it inside a plain `ErrorBoundary` so a faulty fallback still
 * degrades to the default error UI.
 */
export class ViewErrorBoundary extends React.Component<
  ViewErrorBoundaryProps,
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("componentDidCatch", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      let fallbackElement: React.ReactElement;
      try {
        fallbackElement = this.props.errorFallback(
          this.state.error,
          this.props.viewId,
          this.props.meta
        );
      } catch (e) {
        fallbackElement = (
          <DefaultError error={this.state.error} viewId={this.props.viewId} />
        );
      }
      return (
        <ErrorBoundary viewId={this.props.viewId}>
          {fallbackElement}
        </ErrorBoundary>
      );
    }
    return this.props.children;
  }
}

export const DevelopmentErrorFallback: React.FC<{
  error: Error;
  viewId: string;
}> = ({ error, viewId }) => (
  <div
    style={{ backgroundColor: "rgb(241,156,187)" }}
    data-testid="error"
    data-viewid={viewId}
  >
    Error: {error && error.message}
  </div>
);

export const ProductionErrorFallback: React.FC = () => (
  <div style={{ backgroundColor: "rgb(241,156,187)" }}>
    The section could not be shown
  </div>
);

export const DefaultError: React.FC<{
  error: Error;
  viewId: string;
}> = ({ error, viewId }) => {
  if (process.env.NODE_ENV === "production") {
    return <ProductionErrorFallback />;
  } else {
    return <DevelopmentErrorFallback error={error} viewId={viewId} />;
  }
};
