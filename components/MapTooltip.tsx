import type { MunicipalityData } from "@/lib/types";
import { formatRate, formatComparison } from "@/lib/stats";

interface MapTooltipProps {
  data: MunicipalityData;
  nrwAverage: number;
}

export default function MapTooltip({ data, nrwAverage }: MapTooltipProps) {
  return (
    <div className="p-3 min-w-[240px]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="font-bold text-base">{data.name}</h3>
          {data.kreis && (
            <p className="text-xs text-gray-600">{data.kreis}</p>
          )}
        </div>
        <div
          className="w-4 h-4 rounded flex-shrink-0 mt-1"
          style={{ backgroundColor: data.color }}
        />
      </div>

      <div className="border-t pt-2 space-y-2">
        {data.isDifferentiated ? (
          <>
            <div className="text-sm">
              <div className="font-semibold text-gray-700">Differenziert:</div>
              <div className="mt-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wohngrundstücke:</span>
                  <span className="font-medium">
                    {formatRate(data.residential!)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nichtwohngrundstücke:</span>
                  <span className="font-medium">
                    {formatRate(data.nonResidential!)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1 border-t">
                  <span>Durchschnitt:</span>
                  <span>{formatRate(data.displayRate)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Grundsteuer B:</span>
              <span className="font-bold text-base">
                {formatRate(data.unified!)}
              </span>
            </div>
          </div>
        )}

        <div className="border-t pt-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Vergleich zu NRW:</span>
            <span
              className={`font-semibold ${
                data.comparisonToAverage > 0
                  ? "text-red-600"
                  : data.comparisonToAverage < 0
                    ? "text-green-600"
                    : "text-gray-700"
              }`}
            >
              {formatComparison(data.comparisonToAverage)}
            </span>
          </div>
          <div className="text-gray-500 mt-1">
            NRW-Durchschnitt: {formatRate(nrwAverage)}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generate HTML string for Leaflet tooltip (for use in Leaflet's bindTooltip)
 * This is a simpler version that doesn't require React rendering in Leaflet
 */
export function generateTooltipHTML(
  data: MunicipalityData,
  nrwAverage: number
): string {
  const comparisonClass =
    data.comparisonToAverage > 0
      ? "text-red-600"
      : data.comparisonToAverage < 0
        ? "text-green-600"
        : "text-gray-700";

  if (data.isDifferentiated) {
    return `
      <div style="padding: 8px; min-width: 220px;">
        <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <h3 style="font-weight: bold; font-size: 14px; margin: 0;">${data.name}</h3>
            ${data.kreis ? `<p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${data.kreis}</p>` : ""}
          </div>
          <div style="width: 16px; height: 16px; border-radius: 3px; background-color: ${data.color}; flex-shrink: 0; margin-top: 2px;"></div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <div style="font-size: 12px;">
            <div style="font-weight: 600; color: #374151; margin-bottom: 4px;">Differenziert:</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #666;">Wohngrundstücke:</span>
              <span style="font-weight: 500;">${formatRate(data.residential!)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #666;">Nichtwohngrundstücke:</span>
              <span style="font-weight: 500;">${formatRate(data.nonResidential!)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; padding-top: 4px; border-top: 1px solid #f3f4f6;">
              <span>Durchschnitt:</span>
              <span>${formatRate(data.displayRate)}</span>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; margin-top: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #666;">Vergleich zu NRW:</span>
              <span style="font-weight: 600;" class="${comparisonClass}">${formatComparison(data.comparisonToAverage)}</span>
            </div>
            <div style="color: #6b7280;">NRW-Durchschnitt: ${formatRate(nrwAverage)}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    return `
      <div style="padding: 8px; min-width: 220px;">
        <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <h3 style="font-weight: bold; font-size: 14px; margin: 0;">${data.name}</h3>
            ${data.kreis ? `<p style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${data.kreis}</p>` : ""}
          </div>
          <div style="width: 16px; height: 16px; border-radius: 3px; background-color: ${data.color}; flex-shrink: 0; margin-top: 2px;"></div>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <div style="font-size: 12px; display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #666;">Grundsteuer B:</span>
            <span style="font-weight: bold; font-size: 14px;">${formatRate(data.unified!)}</span>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #666;">Vergleich zu NRW:</span>
              <span style="font-weight: 600;" class="${comparisonClass}">${formatComparison(data.comparisonToAverage)}</span>
            </div>
            <div style="color: #6b7280;">NRW-Durchschnitt: ${formatRate(nrwAverage)}</div>
          </div>
        </div>
      </div>
    `;
  }
}
