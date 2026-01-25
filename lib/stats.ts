import type {
  GrundsteuerRate,
  GrundsteuerStatistics,
  ColorScale,
  MunicipalityData,
} from "./types";

/**
 * Calculate display rate from a Grundsteuer rate entry
 * For differentiated rates, returns average of residential and non-residential
 * For unified rates, returns the unified rate
 */
export function getDisplayRate(rate: GrundsteuerRate): number {
  if (rate.isDifferentiated && rate.residential && rate.nonResidential) {
    return (rate.residential + rate.nonResidential) / 2;
  }
  return rate.unified || 0;
}

/**
 * Calculate comprehensive statistics from an array of rates
 */
export function calculateStatistics(
  rates: GrundsteuerRate[]
): GrundsteuerStatistics {
  const displayRates = rates.map(getDisplayRate).sort((a, b) => a - b);

  const sum = displayRates.reduce((acc, val) => acc + val, 0);
  const average = sum / displayRates.length;

  const differentiatedCount = rates.filter((r) => r.isDifferentiated).length;

  return {
    totalMunicipalities: rates.length,
    differentiatedCount,
    unifiedCount: rates.length - differentiatedCount,
    average: Math.round(average),
    median: getMedian(displayRates),
    min: displayRates[0],
    max: displayRates[displayRates.length - 1],
    q1: getPercentile(displayRates, 25),
    q3: getPercentile(displayRates, 75),
  };
}

/**
 * Get median value from sorted array
 */
function getMedian(sortedValues: number[]): number {
  const mid = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return Math.round((sortedValues[mid - 1] + sortedValues[mid]) / 2);
  }

  return sortedValues[mid];
}

/**
 * Get percentile value from sorted array
 */
function getPercentile(sortedValues: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return Math.round(sortedValues[lower]);
  }

  return Math.round(
    sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight
  );
}

/**
 * Generate color scale breakpoints based on statistics
 */
export function generateColorScale(stats: GrundsteuerStatistics): ColorScale {
  return {
    veryLow: stats.min,
    low: stats.q1,
    medium: stats.median,
    high: stats.q3,
    veryHigh: stats.max,
  };
}

/**
 * Get color for a specific rate value based on color scale
 */
export function getRateColor(rate: number, scale: ColorScale): string {
  if (rate <= scale.low) return "#22c55e"; // green-500
  if (rate <= scale.medium) return "#84cc16"; // lime-500
  if (rate <= scale.high) return "#eab308"; // yellow-500
  if (rate <= scale.veryHigh) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

/**
 * Enrich municipality data with statistics and display information
 */
export function enrichMunicipalityData(
  rates: GrundsteuerRate[],
  stats: GrundsteuerStatistics,
  scale: ColorScale
): MunicipalityData[] {
  return rates.map((rate) => {
    const displayRate = getDisplayRate(rate);
    const comparisonToAverage = displayRate - stats.average;
    const color = getRateColor(displayRate, scale);

    return {
      ...rate,
      displayRate,
      comparisonToAverage,
      color,
    };
  });
}

/**
 * Format rate for display
 */
export function formatRate(rate: number): string {
  return `${rate} v.H.`;
}

/**
 * Format comparison to average
 */
export function formatComparison(comparison: number): string {
  if (comparison === 0) return "Durchschnitt";
  if (comparison > 0) return `+${comparison} v.H.`;
  return `${comparison} v.H.`;
}
