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
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

// City coordinates for all municipalities in our dataset
const cityCoordinates: Record<string, [number, number]> = {
  // Major cities (10)
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
  // Märkischer Kreis (15)
  "05962004": [51.2990, 7.6735], // Altena
  "05962008": [51.3327, 7.8671], // Balve
  "05962012": [51.1874, 7.4987], // Halver
  "05962016": [51.3854, 7.7662], // Hemer
  "05962020": [51.1796, 7.7444], // Herscheid
  "05962024": [51.3747, 7.7000], // Iserlohn
  "05962028": [51.1303, 7.5989], // Kierspe
  "05962032": [51.2155, 7.6351], // Lüdenscheid
  "05962036": [51.1063, 7.6409], // Meinerzhagen
  "05962040": [51.4378, 7.7954], // Menden (Sauerland)
  "05962044": [51.3167, 7.6167], // Nachrodt-Wiblingwerde
  "05962048": [51.2780, 7.7810], // Neuenrade
  "05962052": [51.2137, 7.8746], // Plettenberg
  "05962056": [51.2390, 7.5550], // Schalksmühle
  "05962060": [51.2560, 7.7560], // Werdohl
};

export default function NRWMap() {
  const [enrichedData, setEnrichedData] = useState<MunicipalityData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
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

        // Try to load GeoJSON data (optional - won't fail if missing)
        try {
          const geoResponse = await fetch("/data/nrw-municipalities-geo.json");
          if (geoResponse.ok) {
            const geoJson = await geoResponse.json();
            setGeoJsonData(geoJson);
          }
        } catch (geoErr) {
          console.log("GeoJSON data not available, using markers only");
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

  // Helper function to get municipality data by AGS
  const getMunicipalityByAGS = (ags: string) => {
    return enrichedData.find((m) => m.ags === ags);
  };

  // Style function for GeoJSON features
  const styleFeature = (feature: any) => {
    const ags = feature.properties.AGS || feature.properties.ags;
    const municipality = getMunicipalityByAGS(ags);

    if (!municipality) {
      return {
        fillColor: "#cccccc",
        fillOpacity: 0.4,
        color: "#666666",
        weight: 1,
      };
    }

    return {
      fillColor: municipality.color,
      fillOpacity: 0.6,
      color: "#333333",
      weight: 2,
    };
  };

  // Event handlers for GeoJSON features
  const onEachFeature = (feature: any, layer: any) => {
    const ags = feature.properties.AGS || feature.properties.ags;
    const municipality = getMunicipalityByAGS(ags);

    if (municipality) {
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

      layer.bindPopup(`
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg mb-1">${municipality.name}</h3>
          <p class="text-sm text-gray-600 mb-2">${municipality.kreis}</p>
          <div class="space-y-1">
            <p class="text-sm"><span class="font-semibold">Hebesatz:</span> ${rate}</p>
            <p class="text-xs" style="color: ${avgDiff > 0 ? "#dc2626" : "#16a34a"}">${diffText}</p>
            <p class="text-xs text-gray-500 mt-2">NRW-Durchschnitt: ${stats.average.toFixed(0)}%</p>
          </div>
        </div>
      `);

      // Highlight on hover
      layer.on({
        mouseover: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.8,
            weight: 3,
          });
        },
        mouseout: (e: any) => {
          e.target.setStyle({
            fillOpacity: 0.6,
            weight: 2,
          });
        },
      });
    }
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        key="nrw-map"
        center={[51.1856, 7.5509]} // Center between Halver, Schalksmühle, Kierspe
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render GeoJSON polygons if available */}
        {geoJsonData && (
          <GeoJSON
            key={JSON.stringify(geoJsonData)}
            data={geoJsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}

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
