"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GrundsteuerRate } from "@/lib/types";

interface RateHistogramProps {
  municipalities: GrundsteuerRate[];
}

interface BucketData {
  range: string;
  count: number;
  unifiedCount: number;
  differentiatedCount: number;
  minRate: number;
  maxRate: number;
  color: string;
}

export default function RateHistogram({ municipalities }: RateHistogramProps) {
  const data = useMemo(() => {
    // Define buckets (Hebesatz ranges)
    const buckets: { min: number; max: number; label: string; color: string }[] = [
      { min: 0, max: 600, label: "0-600", color: "#22c55e" }, // green
      { min: 601, max: 700, label: "601-700", color: "#84cc16" }, // lime
      { min: 701, max: 800, label: "701-800", color: "#eab308" }, // yellow
      { min: 801, max: 900, label: "801-900", color: "#f97316" }, // orange
      { min: 901, max: 1000, label: "901-1000", color: "#f97316" }, // orange
      { min: 1001, max: 1200, label: "1001-1200", color: "#ef4444" }, // red
      { min: 1201, max: 1500, label: "1201-1500", color: "#dc2626" }, // darker red
      { min: 1501, max: 2500, label: "1500+", color: "#991b1b" }, // darkest red
    ];

    // Count municipalities in each bucket
    const bucketData: BucketData[] = buckets.map((bucket) => {
      const inBucket = municipalities.filter((m) => {
        // Use average for differentiated rates
        const rate = m.isDifferentiated && m.residential && m.nonResidential
          ? (m.residential + m.nonResidential) / 2
          : m.unified || 0;
        return rate >= bucket.min && rate <= bucket.max;
      });

      const unifiedCount = inBucket.filter((m) => !m.isDifferentiated).length;
      const differentiatedCount = inBucket.filter((m) => m.isDifferentiated).length;

      // Get actual min/max rates in this bucket
      const rates = inBucket.map((m) =>
        m.isDifferentiated && m.residential && m.nonResidential
          ? (m.residential + m.nonResidential) / 2
          : m.unified || 0
      );

      return {
        range: bucket.label,
        count: inBucket.length,
        unifiedCount,
        differentiatedCount,
        minRate: rates.length > 0 ? Math.min(...rates) : bucket.min,
        maxRate: rates.length > 0 ? Math.max(...rates) : bucket.max,
        color: bucket.color,
      };
    });

    // Filter out empty buckets
    return bucketData.filter((b) => b.count > 0);
  }, [municipalities]);

  const totalCount = municipalities.length;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Verteilung der Hebesätze</h3>
        <div className="text-sm text-gray-500">
          {totalCount} Gemeinden insgesamt
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ left: 0, right: 20, top: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
            label={{
              value: "Hebesatz (v.H.)",
              position: "insideBottom",
              offset: -40,
              style: { textAnchor: "middle" },
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            allowDecimals={false}
            label={{
              value: "Anzahl Gemeinden",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length > 0) {
                const data = payload[0].payload as BucketData;
                const percentage = ((data.count / totalCount) * 100).toFixed(1);
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 border rounded-lg shadow-lg">
                    <div className="font-semibold mb-2">
                      {data.range} v.H.
                    </div>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium">{data.count}</span> Gemeinden ({percentage}%)
                      </div>
                      <div className="text-xs text-gray-500">
                        Einheitlich: {data.unifiedCount}
                      </div>
                      <div className="text-xs text-gray-500">
                        Differenziert: {data.differentiatedCount}
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#22c55e" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Niedrig</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#84cc16" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Mittel-niedrig</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#eab308" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Mittel</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#f97316" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Mittel-hoch</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span className="text-gray-600 dark:text-gray-400">Hoch</span>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Für differenzierte Sätze wird der Durchschnitt aus Wohn- und Nichtwohnhebesatz verwendet
      </p>
    </div>
  );
}
