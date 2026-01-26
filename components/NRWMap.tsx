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
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

// City coordinates for the 10 municipalities in our dataset
const cityCoordinates: Record<string, [number, number]> = {
  "05315000": [50.9375, 6.9603], // Köln
  "05111000": [51.2277, 6.7735], // Düsseldorf
  "05913000": [51.5136, 7.4653], // Dortmund
  "05113000": [51.4556, 7.0116], // Essen
  "05515000": [51.9607, 7.6261], // Münster
  "05711000": [52.0302, 8.5325], // Bielefeld
  "05314000": [50.7374, 7.0982], // Bonn
  "05112000": [51.4344, 6.7623], // Duisburg
  "05114000": [51.2562, 7.1508], // Wuppertal
  "05512000": [51.4818, 7.2162], // Bochum
};

export default function NRWMap() {
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

        // Calculate statistics
        const statistics = calculateStatistics(rates);
        setStats(statistics);

        // Generate color scale
        const colorScale = generateColorScale(statistics);

        // Enrich data
        const enriched = enrichMunicipalityData(rates, statistics, colorScale);
        setEnrichedData(enriched);

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

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        key="nrw-map"
        center={[51.4332, 7.6616]} // Center of NRW
        zoom={9}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render city markers */}
        {enrichedData.map((municipality) => {
          const coordinates = cityCoordinates[municipality.ags];
          if (!coordinates) return null;

          // Create popup HTML
          const rate = municipality.isDifferentiated
            ? `Wohn: ${municipality.residential}% / Nichtwohn: ${municipality.nonResidential}%`
            : `${municipality.unified}%`;

          const avgDiff = municipality.isDifferentiated
            ? municipality.averageRate - stats.average
            : municipality.unified! - stats.average;

          const diffText =
            avgDiff > 0
              ? `+${avgDiff.toFixed(0)}% über Durchschnitt`
              : `${avgDiff.toFixed(0)}% unter Durchschnitt`;

          return (
            <CircleMarker
              key={municipality.ags}
              center={coordinates}
              radius={15}
              pathOptions={{
                fillColor: municipality.color,
                fillOpacity: 0.8,
                color: "#333",
                weight: 2,
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1">
                    {municipality.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {municipality.kreis}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-semibold">Hebesatz:</span> {rate}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: avgDiff > 0 ? "#dc2626" : "#16a34a",
                      }}
                    >
                      {diffText}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      NRW-Durchschnitt: {stats.average.toFixed(0)}%
                    </p>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
