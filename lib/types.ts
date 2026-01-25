/**
 * Grundsteuer (property tax) rate information for a municipality
 */
export interface GrundsteuerRate {
  /** Amtlicher Gemeindeschlüssel - official municipality ID */
  ags: string;
  /** Municipality name */
  name: string;
  /** District (Kreis) name */
  kreis?: string;
  /** Whether the municipality uses differentiated rates (Wohn-/Nichtwohn-) */
  isDifferentiated: boolean;
  /** Unified Grundsteuer B rate (if not differentiated), in v.H. (percent) */
  unified?: number;
  /** Residential properties rate (Wohngrundstücke), in v.H. (percent) */
  residential?: number;
  /** Non-residential properties rate (Nichtwohngrundstücke), in v.H. (percent) */
  nonResidential?: number;
  /** Year of the rate */
  year: number;
}

/**
 * Statistics about Grundsteuer rates across NRW
 */
export interface GrundsteuerStatistics {
  /** Total number of municipalities */
  totalMunicipalities: number;
  /** Number using differentiated rates */
  differentiatedCount: number;
  /** Number using unified rates */
  unifiedCount: number;
  /** Average Hebesatz across all municipalities */
  average: number;
  /** Median Hebesatz */
  median: number;
  /** Minimum Hebesatz */
  min: number;
  /** Maximum Hebesatz */
  max: number;
  /** 25th percentile */
  q1: number;
  /** 75th percentile */
  q3: number;
}

/**
 * Color scale breakpoints for map visualization
 */
export interface ColorScale {
  /** Very low rates (green) */
  veryLow: number;
  /** Low rates (light green) */
  low: number;
  /** Medium rates (yellow) */
  medium: number;
  /** High rates (orange) */
  high: number;
  /** Very high rates (red) - anything above this */
  veryHigh: number;
}

/**
 * GeoJSON Feature properties for NRW municipalities
 */
export interface MunicipalityFeatureProperties {
  /** Amtlicher Gemeindeschlüssel */
  AGS?: string;
  /** Alternative property name for AGS */
  ags?: string;
  /** Municipality name from GeoJSON */
  GEN?: string;
  /** Alternative property name */
  name?: string;
  /** Additional properties from GeoJSON */
  [key: string]: string | number | undefined;
}

/**
 * Combined municipality data (GeoJSON + Grundsteuer rates)
 */
export interface MunicipalityData extends GrundsteuerRate {
  /** Display rate for color coding (average if differentiated) */
  displayRate: number;
  /** Comparison to NRW average */
  comparisonToAverage: number;
  /** Color hex code for visualization */
  color: string;
}
