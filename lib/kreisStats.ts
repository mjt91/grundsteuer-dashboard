import type { GrundsteuerRate } from "./types";

export interface KreisStatistics {
  kreisName: string;
  totalMunicipalities: number;
  differentiatedCount: number;
  unifiedCount: number;
  differentiatedPercentage: number;

  // Residential rates statistics (for differentiated municipalities)
  residentialRates: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };

  // Non-residential rates statistics (for differentiated municipalities)
  nonResidentialRates: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };

  // Unified rates statistics
  unifiedRates: {
    mean: number;
    median: number;
    min: number;
    max: number;
  };

  // Overall average (combining all rates)
  overallAverage: number;
}

/**
 * Calculate median from an array of numbers
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate mean from an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate statistics for a specific Kreis
 */
export function calculateKreisStatistics(
  municipalities: GrundsteuerRate[],
  kreisName: string
): KreisStatistics {
  // Filter municipalities for this Kreis
  const kreisMunicipalities = municipalities.filter(
    (m) => m.kreis === kreisName
  );

  const totalMunicipalities = kreisMunicipalities.length;
  const differentiatedMunicipalities = kreisMunicipalities.filter(
    (m) => m.isDifferentiated
  );
  const unifiedMunicipalities = kreisMunicipalities.filter(
    (m) => !m.isDifferentiated
  );

  const differentiatedCount = differentiatedMunicipalities.length;
  const unifiedCount = unifiedMunicipalities.length;
  const differentiatedPercentage =
    totalMunicipalities > 0
      ? (differentiatedCount / totalMunicipalities) * 100
      : 0;

  // Extract residential rates
  const residentialValues = differentiatedMunicipalities
    .map((m) => m.residential)
    .filter((r): r is number => r !== undefined);

  // Extract non-residential rates
  const nonResidentialValues = differentiatedMunicipalities
    .map((m) => m.nonResidential)
    .filter((r): r is number => r !== undefined);

  // Extract unified rates
  const unifiedValues = unifiedMunicipalities
    .map((m) => m.unified)
    .filter((r): r is number => r !== undefined);

  // Calculate statistics for residential rates
  const residentialRates = {
    mean: calculateMean(residentialValues),
    median: calculateMedian(residentialValues),
    min: residentialValues.length > 0 ? Math.min(...residentialValues) : 0,
    max: residentialValues.length > 0 ? Math.max(...residentialValues) : 0,
  };

  // Calculate statistics for non-residential rates
  const nonResidentialRates = {
    mean: calculateMean(nonResidentialValues),
    median: calculateMedian(nonResidentialValues),
    min: nonResidentialValues.length > 0 ? Math.min(...nonResidentialValues) : 0,
    max: nonResidentialValues.length > 0 ? Math.max(...nonResidentialValues) : 0,
  };

  // Calculate statistics for unified rates
  const unifiedRates = {
    mean: calculateMean(unifiedValues),
    median: calculateMedian(unifiedValues),
    min: unifiedValues.length > 0 ? Math.min(...unifiedValues) : 0,
    max: unifiedValues.length > 0 ? Math.max(...unifiedValues) : 0,
  };

  // Calculate overall average (for differentiated, use average of residential/non-residential)
  const allRates: number[] = [];

  differentiatedMunicipalities.forEach((m) => {
    if (m.residential !== undefined && m.nonResidential !== undefined) {
      allRates.push((m.residential + m.nonResidential) / 2);
    }
  });

  unifiedMunicipalities.forEach((m) => {
    if (m.unified !== undefined) {
      allRates.push(m.unified);
    }
  });

  const overallAverage = calculateMean(allRates);

  return {
    kreisName,
    totalMunicipalities,
    differentiatedCount,
    unifiedCount,
    differentiatedPercentage,
    residentialRates,
    nonResidentialRates,
    unifiedRates,
    overallAverage,
  };
}

/**
 * Get all municipalities for a Kreis, sorted by rate
 */
export function getKreisMunicipalitiesSorted(
  municipalities: GrundsteuerRate[],
  kreisName: string
): GrundsteuerRate[] {
  const kreisMunicipalities = municipalities.filter(
    (m) => m.kreis === kreisName
  );

  // Sort by average rate (for differentiated, use average of residential/non-residential)
  return kreisMunicipalities.sort((a, b) => {
    const rateA = a.isDifferentiated
      ? ((a.residential || 0) + (a.nonResidential || 0)) / 2
      : a.unified || 0;
    const rateB = b.isDifferentiated
      ? ((b.residential || 0) + (b.nonResidential || 0)) / 2
      : b.unified || 0;
    return rateA - rateB;
  });
}
