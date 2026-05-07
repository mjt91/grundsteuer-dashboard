"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { MunicipalityData } from "@/lib/types";

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

import "leaflet/dist/leaflet.css";

interface NRWMapProps {
  municipalitiesData: MunicipalityData[];
  selectedAgs: string | null;
  onSelect: (m: MunicipalityData) => void;
  nrwAverage: number;
}

export default function NRWMap({
  municipalitiesData,
  selectedAgs,
  onSelect,
  nrwAverage,
}: NRWMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const layersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    async function loadGeo() {
      try {
        const geoResponse = await fetch("/data/nrw-municipalities-geo.json");
        if (geoResponse.ok) {
          const geoJson = await geoResponse.json();
          setGeoJsonData(geoJson);
        }
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load GeoJSON");
        setIsLoading(false);
      }
    }
    loadGeo();
  }, []);

  // Apply selection styling whenever selectedAgs changes
  useEffect(() => {
    layersRef.current.forEach((layer, ags) => {
      const isSelected = ags === selectedAgs;
      const municipality = municipalitiesData.find((m) => m.ags === ags);
      if (!municipality) return;
      layer.setStyle({
        fillColor: municipality.color,
        fillOpacity: isSelected ? 0.85 : 0.6,
        color: isSelected ? "#1e40af" : "#333333",
        weight: isSelected ? 4 : 2,
      });
      if (isSelected) {
        layer.bringToFront();
      }
    });
  }, [selectedAgs, municipalitiesData]);

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

  const getMunicipalityByAGS = (ags: string) =>
    municipalitiesData.find((m) => m.ags === ags);

  const styleFeature = (feature: any) => {
    const ags = feature.properties.AGS || feature.properties.ags;
    const municipality = getMunicipalityByAGS(ags);
    const isSelected = ags === selectedAgs;

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
      fillOpacity: isSelected ? 0.85 : 0.6,
      color: isSelected ? "#1e40af" : "#333333",
      weight: isSelected ? 4 : 2,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const ags = feature.properties.AGS || feature.properties.ags;
    const municipality = getMunicipalityByAGS(ags);

    if (!municipality) return;

    layersRef.current.set(ags, layer);

    const rate = municipality.isDifferentiated
      ? `Wohn: ${municipality.residential} v.H. / Nichtwohn: ${municipality.nonResidential} v.H.`
      : `${municipality.unified} v.H.`;

    const avgDiff = municipality.displayRate - nrwAverage;
    const diffText =
      avgDiff > 0
        ? `+${avgDiff.toFixed(0)} v.H. über Durchschnitt`
        : `${avgDiff.toFixed(0)} v.H. unter Durchschnitt`;

    layer.bindTooltip(
      `
        <div style="padding: 4px; min-width: 180px;">
          <div style="font-weight: bold; font-size: 13px;">${municipality.name}</div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">${municipality.kreis ?? ""}</div>
          <div style="font-size: 12px;"><strong>Hebesatz:</strong> ${rate}</div>
          <div style="font-size: 11px; color: ${avgDiff > 0 ? "#dc2626" : "#16a34a"};">${diffText}</div>
        </div>
      `,
      { sticky: true }
    );

    layer.on({
      mouseover: (e: any) => {
        if (ags !== selectedAgs) {
          e.target.setStyle({
            fillOpacity: 0.8,
            weight: 3,
          });
        }
      },
      mouseout: (e: any) => {
        if (ags !== selectedAgs) {
          e.target.setStyle({
            fillOpacity: 0.6,
            weight: 2,
          });
        }
      },
      click: () => {
        onSelect(municipality);
      },
    });
  };

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border">
      <MapContainer
        key="nrw-map"
        center={[51.4332, 7.6616]}
        zoom={8}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {geoJsonData && (
          <GeoJSON
            key={JSON.stringify(geoJsonData)}
            data={geoJsonData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
}
