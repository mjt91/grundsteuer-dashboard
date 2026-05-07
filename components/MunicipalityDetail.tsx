"use client";

import { useMemo, useState } from "react";
import type {
  GrundsteuerStatistics,
  MunicipalityData,
} from "@/lib/types";
import { formatRate, formatComparison } from "@/lib/stats";

interface MunicipalityDetailProps {
  municipality: MunicipalityData | null;
  stats: GrundsteuerStatistics;
  onClear: () => void;
}

const ASSESSMENT_RATE = 0.0035; // Steuermesszahl

function calculateTax(propertyValue: number, hebesatz: number): number {
  const tax = propertyValue * ASSESSMENT_RATE * (hebesatz / 100);
  return Math.round(tax * 100) / 100;
}

function formatEuro(value: number): string {
  return value.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export default function MunicipalityDetail({
  municipality,
  stats,
  onClear,
}: MunicipalityDetailProps) {
  const [propertyValue, setPropertyValue] = useState<string>("250000");
  const [copied, setCopied] = useState(false);

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const taxResult = useMemo(() => {
    if (!municipality) return null;
    const value = parseFloat(propertyValue);
    if (isNaN(value) || value < 0) return null;

    if (municipality.isDifferentiated) {
      return {
        residential: calculateTax(value, municipality.residential!),
        nonResidential: calculateTax(value, municipality.nonResidential!),
      };
    }
    return {
      unified: calculateTax(value, municipality.unified!),
    };
  }, [municipality, propertyValue]);

  if (!municipality) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-base mb-2">Gemeinde-Details</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Wählen Sie eine Gemeinde auf der Karte oder über die Suche aus, um
          Details und einen Steuerrechner zu sehen.
        </p>
      </div>
    );
  }

  // Position on min-max range as percentage
  const range = stats.max - stats.min;
  const positionPct = range > 0
    ? ((municipality.displayRate - stats.min) / range) * 100
    : 0;
  const avgPositionPct = range > 0
    ? ((stats.average - stats.min) / range) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: municipality.color }}
            />
            <h3 className="font-bold text-lg">{municipality.name}</h3>
          </div>
          {municipality.kreis && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {municipality.kreis}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleShareLink}
            className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            {copied ? "Kopiert!" : "Link teilen"}
          </button>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
          >
            Schließen
          </button>
        </div>
      </div>

      {/* Rates */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Hebesatz</h4>
        {municipality.isDifferentiated ? (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Wohngrundstücke:
              </span>
              <span className="font-medium">
                {formatRate(municipality.residential!)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Nichtwohngrundstücke:
              </span>
              <span className="font-medium">
                {formatRate(municipality.nonResidential!)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1 border-t">
              <span>Durchschnitt:</span>
              <span>{formatRate(municipality.displayRate)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Grundsteuer B:
            </span>
            <span className="font-bold text-base">
              {formatRate(municipality.unified!)}
            </span>
          </div>
        )}
      </div>

      {/* Tax Calculator */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-2">Steuerrechner</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Formel: Wert × 0,35% × Hebesatz
        </p>
        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
          Grundstückswert (€)
        </label>
        <input
          type="number"
          min="0"
          step="1000"
          value={propertyValue}
          onChange={(e) => setPropertyValue(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {taxResult && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md text-sm space-y-1">
            {"unified" in taxResult ? (
              <div className="flex justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  Jährliche Grundsteuer:
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-100">
                  {formatEuro(taxResult.unified!)}
                </span>
              </div>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Wohn:
                  </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    {formatEuro(taxResult.residential!)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300">
                    Nichtwohn:
                  </span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">
                    {formatEuro(taxResult.nonResidential!)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Comparison */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3">NRW-Vergleich</h4>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Diese Gemeinde:
            </span>
            <span className="font-medium">
              {formatRate(municipality.displayRate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              NRW-Durchschnitt:
            </span>
            <span className="font-medium">{formatRate(stats.average)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Differenz:
            </span>
            <span
              className={`font-semibold ${
                municipality.comparisonToAverage > 0
                  ? "text-red-600"
                  : municipality.comparisonToAverage < 0
                    ? "text-green-600"
                    : "text-gray-700"
              }`}
            >
              {formatComparison(municipality.comparisonToAverage)}
            </span>
          </div>
        </div>

        {/* Horizontal bar showing position on min-max scale */}
        <div className="mt-4">
          <div className="relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full">
            {/* Avg marker */}
            <div
              className="absolute top-0 h-full w-0.5 bg-gray-700 dark:bg-gray-200"
              style={{ left: `${avgPositionPct}%` }}
              title={`Durchschnitt: ${stats.average} v.H.`}
            />
            {/* Selected marker */}
            <div
              className="absolute -top-1 w-3 h-5 bg-blue-700 border-2 border-white rounded-sm shadow"
              style={{
                left: `calc(${positionPct}% - 6px)`,
              }}
              title={`${municipality.name}: ${municipality.displayRate} v.H.`}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Min: {stats.min}</span>
            <span>Max: {stats.max}</span>
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-700 rounded-sm" />
              <span>Diese Gemeinde</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-0.5 h-3 bg-gray-700 dark:bg-gray-200" />
              <span>NRW-Durchschnitt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
