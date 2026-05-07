"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type {
  ColorScale,
  GrundsteuerRate,
  GrundsteuerStatistics,
  MunicipalityData,
} from "@/lib/types";
import {
  calculateStatistics,
  enrichMunicipalityData,
  generateColorScale,
} from "@/lib/stats";
import StatsPanel from "@/components/StatsPanel";
import MapLegend from "@/components/MapLegend";
import KreisAnalysis from "@/components/KreisAnalysis";
import RateHistogram from "@/components/RateHistogram";
import MunicipalitySearch from "@/components/MunicipalitySearch";
import MunicipalityDetail from "@/components/MunicipalityDetail";

const NRWMap = dynamic(() => import("@/components/NRWMap"), { ssr: false });

export default function Home() {
  const [stats, setStats] = useState<GrundsteuerStatistics | null>(null);
  const [colorScale, setColorScale] = useState<ColorScale | null>(null);
  const [municipalities, setMunicipalities] = useState<GrundsteuerRate[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] =
    useState<MunicipalityData | null>(null);
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

  const municipalityData = useMemo<MunicipalityData[]>(() => {
    if (!stats || !colorScale || municipalities.length === 0) return [];
    return enrichMunicipalityData(municipalities, stats, colorScale);
  }, [municipalities, stats, colorScale]);

  const handleSelect = (m: MunicipalityData) => {
    setSelectedMunicipality(m);
  };

  const handleClear = () => {
    setSelectedMunicipality(null);
  };

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RateHistogram municipalities={municipalities} />
              </div>
              <div className="lg:col-span-1">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg border shadow-sm h-full flex items-center justify-center">
                  <p className="text-gray-500 text-sm">
                    Additional chart coming soon
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold whitespace-nowrap">
                      Interaktive Karte
                    </h2>
                    <div className="flex-1 max-w-md">
                      <MunicipalitySearch
                        municipalities={municipalities}
                        enriched={municipalityData}
                        onSelect={handleSelect}
                      />
                    </div>
                  </div>
                  {stats && (
                    <NRWMap
                      municipalitiesData={municipalityData}
                      selectedAgs={selectedMunicipality?.ags ?? null}
                      onSelect={handleSelect}
                      nrwAverage={stats.average}
                    />
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Klicken Sie auf eine Gemeinde, um Details und einen
                    Steuerrechner zu sehen.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-4">
                {stats && (
                  <MunicipalityDetail
                    municipality={selectedMunicipality}
                    stats={stats}
                    onClear={handleClear}
                  />
                )}
                {colorScale && <MapLegend colorScale={colorScale} />}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
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
                    <li>• Stand: Januar 2025</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
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
