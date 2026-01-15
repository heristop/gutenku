/**
 * Analytics and statistics utilities.
 */

export function formatPercent(value: number): string {
  if (value >= 80) {
    return `${value.toFixed(1)}%`;
  }
  if (value >= 50) {
    return `${value.toFixed(1)}%`;
  }
  return `${value.toFixed(1)}%`;
}

export function formatRejectPercent(count: number, total: number): string {
  if (total === 0) {
    return '0%';
  }
  return ((count / total) * 100).toFixed(1) + '%';
}

export function calculateStdDev(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));

  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

export function calculateMean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

export function getScoreThreshold(
  value: number,
  threshold: number,
): 'good' | 'warn' {
  return value >= threshold ? 'good' : 'warn';
}

export function getSentimentLevel(
  value: number,
): 'positive' | 'neutral' | 'negative' {
  if (value > 0.6) {
    return 'positive';
  }
  if (value < 0.4) {
    return 'negative';
  }
  return 'neutral';
}

export function getSuccessRateLevel(
  rate: number,
): 'excellent' | 'good' | 'poor' {
  if (rate >= 80) {
    return 'excellent';
  }
  if (rate >= 50) {
    return 'good';
  }
  return 'poor';
}

export function calculateCompositeScore(
  successRate: number,
  qualityScore: number,
  maxQuality: number = 15,
  successWeight: number = 0.4,
  qualityWeight: number = 0.6,
): number {
  const successNorm = successRate / 100;
  const qualityNorm = Math.max(0, Math.min(1, qualityScore / maxQuality));

  return successNorm * successWeight + qualityNorm * qualityWeight;
}
