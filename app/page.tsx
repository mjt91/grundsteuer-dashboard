"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GrundsteuerRate } from "@/lib/types";
import { calculateStatistics, generateColorScale } from "@/lib/stats";
import StatsPanel from "@/components/StatsPanel";
import MapLegend from "@/components/MapLegend";
import KreisAnalysis from "@/components/KreisAnalysis";

// Dynamically import NRWMap to avoid SSR issues with Leaflet
const NRWMap = dynamic(() => import("@/components/NRWMap"), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [colorScale, setColorScale] = useState<any>(null);
  const [municipalities, setMunicipalities] = useState<GrundsteuerRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/data/grundsteuer-rates.json");
        const data = await response.json();
        const rates = data.municipalities as GrundsteuerRate[];

        setMunicipalities(rates);

        const statistics = calculateStatistics(rates);
        setStats(statistics);

        const scale = generateColorScale(statistics);
        setColorScale(scale);

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            NRW Grundsteuer Dashboard
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">
            Interaktive Karte der Grundsteuer B Hebesätze in Nordrhein-Westfalen
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {stats && <StatsPanel stats={stats} />}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <h2 className="text-lg font-semibold mb-4">
                    Interaktive Karte
                  </h2>
                  <NRWMap />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Bewegen Sie die Maus über eine Gemeinde, um Details zu sehen.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1">
                {colorScale && <MapLegend colorScale={colorScale} />}

                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    Datenquellen
                  </h3>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <li>
                      • Hebesätze:{" "}
                      <a
                        href="https://steuerzahler.de/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        Bund der Steuerzahler NRW
                      </a>
                    </li>
                    <li>
                      • Kartendaten:{" "}
                      <a
                        href="https://www.opengeodata.nrw.de/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        OpenGeoData NRW
                      </a>
                    </li>
                    <li>
                      • Stand: Januar 2025
                    </li>
                  </ul>
                </div>

                <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-100">
                    Rechtlicher Hinweis
                  </h3>
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Die Differenzierung der Hebesätze unterliegt aktuell
                    rechtlicher Prüfung. Bitte prüfen Sie die aktuellen Sätze
                    bei Ihrer Gemeinde.
                  </p>
                </div>
              </div>
            </div>

            {/* Kreis Analysis Section */}
            <div className="mt-12">
              <KreisAnalysis
                municipalities={municipalities}
                kreisName="Märkischer Kreis"
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
