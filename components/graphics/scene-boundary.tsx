"use client";

import { Component, createContext, useCallback, useContext, useMemo, useState, type ErrorInfo, type ReactNode } from "react";

export type SceneFailure = "unsupported" | "error" | "shader" | "context-lost";

const SceneHealth = createContext<(reason: SceneFailure) => void>(() => {});

/** Lets a scene report a failure it caught itself (shader compile error, lost context). */
export function useSceneHealth() {
  return useContext(SceneHealth);
}

interface CatcherProps {
  onError: (error: Error) => void;
  children: ReactNode;
}

class Catcher extends Component<CatcherProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("scene failed to render", error, info.componentStack);
    this.props.onError(error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface SceneBoundaryProps {
  /** The composition shown instead of the canvas: on the server, without WebGL, after an error. */
  fallback: ReactNode | ((reason: SceneFailure) => ReactNode);
  /** A failure known before mounting (no WebGL, effects off). */
  failure?: SceneFailure | null;
  /** Told once, when the scene inside fails, so the owner can caption the fallback. */
  onFailure?: (reason: SceneFailure) => void;
  children: ReactNode;
}

/**
 * Keeps a scene from taking the page down and gives it one place to report
 * trouble. Graphics are never essential content, so the fallback is a
 * designed plate, not an apology. Once a scene has failed it stays on the
 * fallback: a lost context that comes back is rare, and a flicker between
 * the two would be worse than a still image.
 */
export function SceneBoundary({ fallback, failure = null, onFailure, children }: SceneBoundaryProps) {
  const [reported, setReported] = useState<SceneFailure | null>(null);
  const report = useCallback(
    (reason: SceneFailure) => {
      setReported((r) => {
        if (r) return r;
        onFailure?.(reason);
        return reason;
      });
    },
    [onFailure],
  );
  const onError = useCallback(() => report("error"), [report]);
  const reason = failure ?? reported;
  const view = useMemo(() => (reason ? (typeof fallback === "function" ? fallback(reason) : fallback) : null), [fallback, reason]);
  if (reason) return <>{view}</>;
  return (
    <SceneHealth.Provider value={report}>
      <Catcher onError={onError}>{children}</Catcher>
    </SceneHealth.Provider>
  );
}
