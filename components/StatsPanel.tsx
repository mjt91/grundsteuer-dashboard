import type { GrundsteuerStatistics } from "@/lib/types";
import { formatRate } from "@/lib/stats";

interface StatsPanelProps {
  stats: GrundsteuerStatistics;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  const statCards = [
    {
      label: "Kommunen gesamt",
      value: stats.totalMunicipalities,
      suffix: "",
      description: "Anzahl der dargestellten Gemeinden",
    },
    {
      label: "Mit Differenzierung",
      value: stats.differentiatedCount,
      suffix: "",
      description: `${Math.round((stats.differentiatedCount / stats.totalMunicipalities) * 100)}% nutzen getrennte Sätze für Wohn-/Nichtwohn-`,
    },
    {
      label: "Durchschnitt",
      value: stats.average,
      suffix: " v.H.",
      description: "Mittlerer Hebesatz in NRW",
    },
    {
      label: "Spanne",
      value: `${stats.min}–${stats.max}`,
      suffix: " v.H.",
      description: "Niedrigster bis höchster Hebesatz",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <h2 className="text-xl font-bold mb-1">NRW Grundsteuer Statistik 2025</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Übersicht über die Grundsteuer B Hebesätze in Nordrhein-Westfalen
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
              {card.label}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {card.value}
              <span className="text-base font-normal">{card.suffix}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t text-sm">
        <h3 className="font-semibold mb-2">
          Über die Grundsteuerreform 2025
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Seit dem 1. Januar 2025 gilt in NRW das Bundesmodell der Grundsteuer.
          Kommunen können wählen, ob sie einen einheitlichen Hebesatz für
          Grundsteuer B festsetzen oder zwischen Wohngrundstücken und
          Nichtwohngrundstücken differenzieren.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Hinweis: Die Differenzierung unterliegt rechtlicher Prüfung. Das
          Verwaltungsgericht Gelsenkirchen entschied am 4. Dezember 2025, dass
          differenzierte Hebesätze gegen den Grundsatz der Steuergerechtigkeit
          verstoßen.
        </p>
      </div>
    </div>
  );
}
