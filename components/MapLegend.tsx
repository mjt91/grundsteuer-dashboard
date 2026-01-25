import type { ColorScale } from "@/lib/types";

interface MapLegendProps {
  colorScale: ColorScale;
}

export default function MapLegend({ colorScale }: MapLegendProps) {
  const legendItems = [
    {
      label: "Sehr niedrig",
      color: "#22c55e",
      range: `≤ ${colorScale.low} v.H.`,
    },
    {
      label: "Niedrig",
      color: "#84cc16",
      range: `${colorScale.low + 1}-${colorScale.medium} v.H.`,
    },
    {
      label: "Mittel",
      color: "#eab308",
      range: `${colorScale.medium + 1}-${colorScale.high} v.H.`,
    },
    {
      label: "Hoch",
      color: "#f97316",
      range: `${colorScale.high + 1}-${colorScale.veryHigh} v.H.`,
    },
    {
      label: "Sehr hoch",
      color: "#ef4444",
      range: `> ${colorScale.veryHigh} v.H.`,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
      <h3 className="font-semibold text-sm mb-3">Grundsteuer B Hebesatz</h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div
              className="w-6 h-6 rounded flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.range}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t text-xs text-gray-600 dark:text-gray-400">
        <p>
          Farben basieren auf Quartilen der Hebesätze aller dargestellten
          Kommunen.
        </p>
        <p className="mt-1">
          Bei differenzierten Sätzen wird der Durchschnitt von Wohn- und
          Nichtwohngrundstücken angezeigt.
        </p>
      </div>
    </div>
  );
}
