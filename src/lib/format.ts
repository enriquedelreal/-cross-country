/**
 * Parse time string to seconds
 * Accepts "M:SS", "MM:SS", "MM:SS.xx" formats
 */
export function parseTimeToSeconds(t: string): number {
  // Accept "14:51.20", "18:44", "5:11" etc.
  const m = t.trim().match(/^(\d{1,2}):(\d{2})(?:\.(\d+))?$/);
  if (!m) return NaN;
  const min = Number(m[1]);
  const sec = Number(m[2]);
  const frac = m[3] ? Number(`0.${m[3]}`) : 0;
  return min * 60 + sec + frac;
}

/**
 * Format seconds to MM:SS or MM:SS.xx
 */
export function formatTime(seconds: number, showHundredths = false): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (showHundredths && remainingSeconds % 1 !== 0) {
    return `${minutes}:${remainingSeconds.toFixed(2).padStart(5, '0')}`;
  }
  
  return `${minutes}:${Math.floor(remainingSeconds).toString().padStart(2, '0')}`;
}

/**
 * Calculate 3-mile equivalent time
 */
export function calculate3MiEquivalent(seconds: number, distanceMi: number): number {
  // Special handling for common race distances
  if (Math.abs(distanceMi - 3.11) < 0.01) { // 5K
    return seconds * (3 / 3.11);
  }
  if (Math.abs(distanceMi - 2.112) < 0.01) { // 3400m
    return seconds * (3 / 2.112);
  }
  if (Math.abs(distanceMi - 2.9) < 0.01) { // ~2.9 miles
    return seconds * (3 / 2.9);
  }
  
  // Linear scaling for other distances
  return seconds * (3 / distanceMi);
}

/**
 * Calculate improvement percentage
 */
export function calculateImprovementPct(firstTime: number, latestTime: number): number {
  if (firstTime <= 0 || latestTime <= 0) return 0;
  return ((firstTime - latestTime) / firstTime) * 100;
}

/**
 * Format improvement percentage with sign
 */
export function formatImprovementPct(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

/**
 * Format delta time with sign and color indication
 */
export function formatDelta(delta: number): { text: string; isPositive: boolean } {
  const sign = delta > 0 ? '+' : '';
  const isPositive = delta > 0; // Positive delta means slower (worse)
  return {
    text: `${sign}${formatTime(Math.abs(delta))}`,
    isPositive
  };
}

/**
 * Get pace per mile in MM:SS format
 */
export function getPacePerMile(seconds: number, distanceMi: number): string {
  const paceSeconds = seconds / distanceMi;
  return formatTime(paceSeconds);
}
