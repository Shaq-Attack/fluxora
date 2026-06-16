interface FullscreenToggleButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenToggleButton({
  isFullscreen,
  onToggle,
}: FullscreenToggleButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      className="rounded p-1 text-dim transition-colors hover:bg-surface-strong hover:text-primary"
    >
      {isFullscreen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9H5m4 0V5m0 4L4 4m11 5h4m-4 0V5m0 4 5-5M9 15H5m4 0v4m0-4-5 5m11-5h4m-4 0v4m0-4 5 5"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 9V5a1 1 0 0 1 1-1h4M4 15v4a1 1 0 0 0 1 1h4m11-11V5a1 1 0 0 0-1-1h-4m5 11v4a1 1 0 0 1-1 1h-4"
          />
        </svg>
      )}
    </button>
  );
}
