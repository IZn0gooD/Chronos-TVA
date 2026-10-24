"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ArtBoundaryProps {
  /** What to show when the piece cannot draw: a still, a caption, nothing. */
  fallback: ReactNode;
  children: ReactNode;
}

interface ArtBoundaryState {
  failed: boolean;
}

/**
 * Keeps a broken piece from taking the page down. Art is never essential
 * content, so the fallback can be a quiet still frame.
 */
export class ArtBoundary extends Component<ArtBoundaryProps, ArtBoundaryState> {
  state: ArtBoundaryState = { failed: false };

  static getDerivedStateFromError(): ArtBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced, not swallowed: a piece that throws is a bug worth seeing in the console.
    console.error("ascii piece failed to render", error, info.componentStack);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
