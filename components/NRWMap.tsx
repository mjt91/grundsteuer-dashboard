"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { GrundsteuerRate, MunicipalityData } from "@/lib/types";
import {
  calculateStatistics,
  generateColorScale,
  enrichMunicipalityData,
} from "@/lib/stats";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

import { generateTooltipHTML } from "./MapTooltip";
import "leaflet/dist/leaflet.css";

export default function NRWMap() {
  const [ratesData, setRatesData] = useState<GrundsteuerRate[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [enrichedData, setEnrichedData] = useState<MunicipalityData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Load Grundsteuer rates
        const ratesResponse = await fetch("/data/grundsteuer-rates.json");
        if (!ratesResponse.ok) {
          throw new Error("Failed to load rates data");
        }
        const ratesJson = await ratesResponse.json();
        const rates = ratesJson.municipalities as GrundsteuerRate[];
        setRatesData(rates);

        // Calculate statistics
        const statistics = calculateStatistics(rates);
        setStats(statistics);

        // Generate color scale
        const colorScale = generateColorScale(statistics);

        // Enrich data
        const enriched = enrichMunicipalityData(rates, statistics, colorScale);
        setEnrichedData(enriched);

        // Try to load GeoJSON (optional for now)
        try {
          const geoResponse = await fetch("/data/nrw-municipalities-geo.json");
          if (geoResponse.ok) {
            const geo = await geoResponse.json();
            setGeoData(geo);
          }
        } catch (geoError) {
          console.warn("GeoJSON not found, will show placeholder", geoError);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Lade Kartendaten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Fehler beim Laden der Daten
          </p>
          <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="w-full h-[600px] bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            GeoJSON-Daten erforderlich
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            Um die interaktive Karte anzuzeigen, müssen Sie die
            GeoJSON-Datei für NRW-Gemeindegrenzen hinzufügen.
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded border text-left text-xs space-y-2">
            <p className="font-semibold">Anleitung:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>
                Lade die GeoJSON-Datei von{" "}
                <a
                  href="https://www.opengeodata.nrw.de/produkte/geobasis/vkg/dvg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  opengeodata.nrw.de
                </a>
              </li>
              <li>Konvertiere Shapefile zu GeoJSON (falls nötig)</li>
              <li>
                Speichere als{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                  public/data/nrw-municipalities-geo.json
                </code>
              </li>
              <li>Stelle sicher, dass jedes Feature eine AGS-Property hat</li>
            </ol>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Grundsteuer-Daten für {ratesData.length} Gemeinden wurden geladen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        center={[51.4332, 7.6616]} // Center of NRW (approximately Dortmund)
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <GeoJSON
          data={geoData}
          style={(feature) => {
            // Find matching rate data by AGS
            const ags =
              feature?.properties?.AGS ||
              feature?.properties?.ags ||
              feature?.properties?.AGS_0;

            const municipalityData = enrichedData.find(
              (d) => d.ags === ags?.toString()
            );

            return {
              fillColor: municipalityData?.color || "#cccccc",
              weight: 1,
              opacity: 1,
              color: "#666",
              fillOpacity: 0.7,
            };
          }}
          onEachFeature={(feature, layer) => {
            const ags =
              feature?.properties?.AGS ||
              feature?.properties?.ags ||
              feature?.properties?.AGS_0;

            const municipalityData = enrichedData.find(
              (d) => d.ags === ags?.toString()
            );

            if (municipalityData && stats) {
              const tooltipHTML = generateTooltipHTML(
                municipalityData,
                stats.average
              );
              layer.bindTooltip(tooltipHTML, {
                sticky: true,
                className: "grundsteuer-tooltip",
              });

              layer.on({
                mouseover: (e) => {
                  const target = e.target;
                  target.setStyle({
                    weight: 3,
                    color: "#333",
                    fillOpacity: 0.9,
                  });
                },
                mouseout: (e) => {
                  const target = e.target;
                  target.setStyle({
                    weight: 1,
                    color: "#666",
                    fillOpacity: 0.7,
                  });
                },
              });
            } else {
              // Fallback tooltip for municipalities without data
              const name =
                feature?.properties?.GEN ||
                feature?.properties?.name ||
                "Unbekannt";
              layer.bindTooltip(
                `<div style="padding: 8px;"><strong>${name}</strong><br/><span style="font-size: 11px; color: #666;">Keine Daten verfügbar</span></div>`,
                { sticky: true }
              );
            }
          }}
        />
      </MapContainer>
    </div>
  );
}
