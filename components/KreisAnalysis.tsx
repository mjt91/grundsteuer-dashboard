"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { GrundsteuerRate } from "@/lib/types";
import {
  calculateKreisStatistics,
  getKreisMunicipalitiesSorted,
} from "@/lib/kreisStats";

interface KreisAnalysisProps {
  municipalities: GrundsteuerRate[];
  kreisName: string;
}

const COLORS = {
  differentiated: "#10b981", // green
  unified: "#6b7280", // gray
  residential: "#3b82f6", // blue
  nonResidential: "#ef4444", // red
};

export default function KreisAnalysis({
  municipalities,
  kreisName,
}: KreisAnalysisProps) {
  const stats = useMemo(
    () => calculateKreisStatistics(municipalities, kreisName),
    [municipalities, kreisName]
  );

  const sortedMunicipalities = useMemo(
    () => getKreisMunicipalitiesSorted(municipalities, kreisName),
    [municipalities, kreisName]
  );

  // Data for donut chart (Differenzierung split)
  const differentiationData = [
    {
      name: "Differenziert",
      value: stats.differentiatedCount,
      percentage: stats.differentiatedPercentage,
    },
    {
      name: "Einheitlich",
      value: stats.unifiedCount,
      percentage: 100 - stats.differentiatedPercentage,
    },
  ];

  // Data for grouped bar chart (average rates comparison)
  const averageRatesData = [
    {
      category: "Wohngrundstücke",
      rate: Math.round(stats.residentialRates.mean),
      color: COLORS.residential,
    },
    {
      category: "Nichtwohngrundstücke",
      rate: Math.round(stats.nonResidentialRates.mean),
      color: COLORS.nonResidential,
    },
    {
      category: "Einheitlich",
      rate: Math.round(stats.unifiedRates.mean),
      color: COLORS.unified,
    },
  ];

  // Data for horizontal bar chart (municipality comparison)
  const municipalityData = sortedMunicipalities.map((m) => ({
    name: m.name,
    residential: m.residential || null,
    nonResidential: m.nonResidential || null,
    unified: m.unified || null,
    isDifferentiated: m.isDifferentiated,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{kreisName}</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyse der Grundsteuer B Hebesätze 2025
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Gemeinden gesamt
          </div>
          <div className="text-3xl font-bold">{stats.totalMunicipalities}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Mit Differenzierung
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.differentiatedCount}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.differentiatedPercentage.toFixed(0)}%
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ø Wohngrundstücke
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.residentialRates.mean > 0
              ? Math.round(stats.residentialRates.mean)
              : "-"}
            {stats.residentialRates.mean > 0 && "%"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.residentialRates.min > 0 &&
              `${stats.residentialRates.min}-${stats.residentialRates.max}%`}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ø Nichtwohngrundstücke
          </div>
          <div className="text-3xl font-bold text-red-600">
            {stats.nonResidentialRates.mean > 0
              ? Math.round(stats.nonResidentialRates.mean)
              : "-"}
            {stats.nonResidentialRates.mean > 0 && "%"}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stats.nonResidentialRates.min > 0 &&
              `${stats.nonResidentialRates.min}-${stats.nonResidentialRates.max}%`}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart - Differenzierung Split */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            Anteil Differenzierung
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={differentiationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percentage }) =>
                  `${name}: ${percentage.toFixed(0)}%`
                }
              >
                <Cell fill={COLORS.differentiated} />
                <Cell fill={COLORS.unified} />
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value} Gemeinden`}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {stats.differentiatedCount} von {stats.totalMunicipalities}{" "}
            Gemeinden nutzen differenzierte Hebesätze
          </div>
        </div>

        {/* Bar Chart - Average Rates Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            Durchschnittliche Hebesätze
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={averageRatesData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 12 }}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                label={{
                  value: "Hebesatz (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                {averageRatesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Differenzierte Hebesätze entlasten Wohngrundstücke um ~
            {stats.nonResidentialRates.mean > 0 && stats.residentialRates.mean > 0
              ? Math.round(
                  ((stats.nonResidentialRates.mean -
                    stats.residentialRates.mean) /
                    stats.nonResidentialRates.mean) *
                    100
                )
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart - Municipality Comparison */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">
          Hebesätze nach Gemeinde (sortiert)
        </h3>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={municipalityData}
            layout="vertical"
            margin={{ left: 120, right: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis type="number" label={{ value: "Hebesatz (%)", position: "insideBottom", offset: -5 }} />
            <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number | null) =>
                value !== null ? `${value}%` : "N/A"
              }
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="residential"
              fill={COLORS.residential}
              name="Wohngrundstücke"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="nonResidential"
              fill={COLORS.nonResidential}
              name="Nichtwohngrundstücke"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="unified"
              fill={COLORS.unified}
              name="Einheitlich"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Niedrigster Hebesatz: {sortedMunicipalities[0]?.name} • Höchster
          Hebesatz:{" "}
          {sortedMunicipalities[sortedMunicipalities.length - 1]?.name}
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Statistische Kennzahlen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Residential Stats */}
          <div>
            <h4 className="font-semibold text-blue-600 mb-3">
              Wohngrundstücke
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Durchschnitt:
                </dt>
                <dd className="font-semibold">
                  {Math.round(stats.residentialRates.mean)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Median:</dt>
                <dd className="font-semibold">
                  {Math.round(stats.residentialRates.median)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Spanne:
                </dt>
                <dd className="font-semibold">
                  {stats.residentialRates.min}-{stats.residentialRates.max}%
                </dd>
              </div>
            </dl>
          </div>

          {/* Non-Residential Stats */}
          <div>
            <h4 className="font-semibold text-red-600 mb-3">
              Nichtwohngrundstücke
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Durchschnitt:
                </dt>
                <dd className="font-semibold">
                  {Math.round(stats.nonResidentialRates.mean)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Median:</dt>
                <dd className="font-semibold">
                  {Math.round(stats.nonResidentialRates.median)}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Spanne:
                </dt>
                <dd className="font-semibold">
                  {stats.nonResidentialRates.min}-
                  {stats.nonResidentialRates.max}%
                </dd>
              </div>
            </dl>
          </div>

          {/* Unified Stats */}
          <div>
            <h4 className="font-semibold text-gray-600 mb-3">
              Einheitliche Hebesätze
            </h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Durchschnitt:
                </dt>
                <dd className="font-semibold">
                  {stats.unifiedRates.mean > 0
                    ? `${Math.round(stats.unifiedRates.mean)}%`
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Median:</dt>
                <dd className="font-semibold">
                  {stats.unifiedRates.median > 0
                    ? `${Math.round(stats.unifiedRates.median)}%`
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">
                  Spanne:
                </dt>
                <dd className="font-semibold">
                  {stats.unifiedRates.min > 0
                    ? `${stats.unifiedRates.min}-${stats.unifiedRates.max}%`
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
