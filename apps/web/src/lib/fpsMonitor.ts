const LOW_FPS_THRESHOLD = 30;
const WARN_INTERVAL_MS = 5_000;

/**
 * Lightweight frame-rate monitor. Runs a single `requestAnimationFrame` loop
 * and logs a warning when the instantaneous frame rate drops below 30 FPS.
 * Warnings are throttled so a sustained low-FPS spell logs at most once per
 * ~5 seconds rather than every frame.
 */
export function startFpsMonitor(): void {
  let lastTime = performance.now();
  let lastWarn = 0;
  // Skip the first measured frame: the gap between monitor start and the first
  // rAF callback is not a real rendered-frame delta and would warn spuriously.
  let primed = false;

  function tick(now: number): void {
    const delta = now - lastTime;
    lastTime = now;

    if (!primed) {
      primed = true;
      requestAnimationFrame(tick);
      return;
    }

    const fps = delta > 0 ? 1000 / delta : 0;
    if (fps < LOW_FPS_THRESHOLD && now - lastWarn > WARN_INTERVAL_MS) {
      lastWarn = now;
      console.warn(`[fps] Frame rate dropped to ${fps.toFixed(0)} FPS`);
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}
