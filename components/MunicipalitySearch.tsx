"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { GrundsteuerRate, MunicipalityData } from "@/lib/types";

interface MunicipalitySearchProps {
  municipalities: GrundsteuerRate[];
  onSelect: (m: MunicipalityData) => void;
  enriched: MunicipalityData[];
}

export default function MunicipalitySearch({
  municipalities,
  onSelect,
  enriched,
}: MunicipalitySearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return [];
    return municipalities
      .filter((m) => m.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query, municipalities]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const selectMunicipality = (rate: GrundsteuerRate) => {
    const enrichedMatch = enriched.find((m) => m.ags === rate.ags);
    if (enrichedMatch) {
      onSelect(enrichedMatch);
      setQuery(enrichedMatch.name);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[highlightedIndex];
      if (selected) selectMunicipality(selected);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Gemeinde suchen..."
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Suche zurücksetzen"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute z-[1000] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              Keine Gemeinden gefunden
            </div>
          ) : (
            <ul role="listbox">
              {results.map((rate, idx) => (
                <li
                  key={rate.ags}
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => selectMunicipality(rate)}
                  className={`px-4 py-2 cursor-pointer text-sm flex justify-between items-center ${
                    idx === highlightedIndex
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {rate.name}
                    </div>
                    {rate.kreis && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {rate.kreis}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-mono text-gray-600 dark:text-gray-300">
                    {rate.isDifferentiated
                      ? `${rate.residential}/${rate.nonResidential}`
                      : rate.unified}{" "}
                    v.H.
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
