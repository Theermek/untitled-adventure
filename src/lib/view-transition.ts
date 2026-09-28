/**
 * Wraps a navigation in the browser's View Transitions API when available,
 * so moving between screens (e.g. menu -> game) animates as a single smooth
 * transition instead of a hard cut. Falls back to a plain call when the API
 * isn't supported — this is progressive enhancement, never a hard dependency.
 */
export function navigateWithTransition(navigate: () => void) {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => unknown;
  };

  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(navigate);
  } else {
    navigate();
  }
}
