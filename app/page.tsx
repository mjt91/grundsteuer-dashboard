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
  const [didApplyUrlParam, setDidApplyUrlParam] = useState(false);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (didApplyUrlParam || municipalityData.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const ags = params.get("ags");
    if (ags) {
      const match = municipalityData.find((m) => m.ags === ags);
      if (match) {
        setSelectedMunicipality(match);
      }
    }
    setDidApplyUrlParam(true);
  }, [municipalityData, didApplyUrlParam]);

  const handleSelect = (m: MunicipalityData) => {
    setSelectedMunicipality(m);
    window.history.pushState({}, "", `?ags=${m.ags}`);
  };

  const handleClear = () => {
    setSelectedMunicipality(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
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

            <div className="max-w-md mb-4">
              <MunicipalitySearch
                municipalities={municipalities}
                enriched={municipalityData}
                onSelect={handleSelect}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border shadow-sm">
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg font-semibold">
                      Interaktive Karte
                    </h2>
                    {selectedMunicipality && (
                      <button
                        onClick={handleCopyLink}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        title="Direktlink zu dieser Gemeinde kopieren"
                      >
                        {copied ? (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Kopiert!
                          </span>
                        ) : (
                          <span>Link kopieren</span>
                        )}
                      </button>
                    )}
                  </div>
                  {stats && (
                    <NRWMap
                      municipalitiesData={municipalityData}
                      selectedAgs={selectedMunicipality?.ags ?? null}
                      onSelect={handleSelect}
                      nrwAverage={stats.average}
                    />
                  )}
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
          </div>
        )}
      </div>
    </main>
  );
}
