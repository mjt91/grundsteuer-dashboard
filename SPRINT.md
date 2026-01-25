# Sprint Backlog

## Current Sprint: NRW Map Dashboard Implementation
Started: 2026-01-25
Goal: Build interactive map showing Grundsteuer B rates for all NRW municipalities with differentiation support

## In Progress
<!-- Tasks currently being worked on -->

## Backlog (Prioritized)

### High Priority - Data Collection & Integration
- [ ] **[DATA-001]** Obtain and integrate NRW GeoJSON boundaries
  - Download from [opengeodata.nrw.de](https://www.opengeodata.nrw.de/produkte/geobasis/vkg/dvg/)
  - Convert Shapefile to GeoJSON if needed (use DVG2 - reduced density)
  - Verify AGS property exists in each feature
  - Save as `public/data/nrw-municipalities-geo.json`
  - Target file size: <2MB for performance

- [ ] **[DATA-002]** Expand Grundsteuer rates dataset
  - Currently: 10 major cities
  - Goal: All 396 NRW municipalities
  - Source: [Bund der Steuerzahler NRW PDF](https://steuerzahler.de/fileadmin/user_upload/LV_Nordrhein-Westfalen/Dateien/Grundsteuer_B_2025_NRW_Erhebung_BdSt.pdf)
  - Manual entry from PDF into `public/data/grundsteuer-rates.json`
  - Include AGS, name, Kreis, rates (unified or differentiated)

- [ ] **[DATA-003]** Verify data accuracy
  - Spot-check rates for 10-15 known municipalities
  - Verify AGS matching between GeoJSON and rates data
  - Test differentiated vs unified rate display
  - Confirm calculations match official sources

### Medium Priority - Features & Enhancements
- [ ] **[FEATURE-001]** Add municipality search/filter
  - Search bar to find municipality by name
  - Auto-zoom to selected municipality on map
  - Highlight selected municipality
  - Show details panel for selection

- [ ] **[FEATURE-002]** Implement click interactions
  - Click municipality to lock tooltip
  - Show detailed breakdown panel
  - Display calculation example for typical property
  - Add "Compare" functionality

- [ ] **[FEATURE-003]** Add chart visualizations
  - Distribution histogram of Hebesätze
  - Differentiated vs unified rates pie chart
  - Top 10 highest/lowest rates comparison
  - Regional comparisons (by Regierungsbezirk)

- [ ] **[FEATURE-004]** Export and sharing features
  - Export data as CSV
  - Share link to specific municipality
  - Generate PDF report
  - Download map as image

### Lower Priority - Improvements & Extras
- [ ] **[FEATURE-005]** Historical comparison
  - Add 2024 rates data
  - Show year-over-year changes
  - Highlight municipalities with significant changes
  - Timeline slider for historical view

- [ ] **[FEATURE-006]** Mobile optimization
  - Improve mobile map interactions
  - Touch-friendly tooltips
  - Responsive statistics panel
  - Bottom sheet for municipality details

- [ ] **[FEATURE-007]** Performance optimization
  - Lazy load GeoJSON by region
  - Implement map tile caching
  - Add service worker for offline support
  - Optimize bundle size

- [ ] **[CHORE-001]** Add unit tests
  - Test statistics calculations
  - Test color scale generation
  - Test data enrichment
  - Test tooltip generation

- [ ] **[DOCS-001]** Improve documentation
  - Add data collection guide
  - Document GeoJSON integration process
  - Create user guide for dashboard
  - Add API documentation (if implemented)

## Completed This Sprint
- [x] **[CHORE-000]** Initial project setup
  - Completed: 2026-01-25
  - Next.js 15 with TypeScript configured
  - Tailwind CSS and Recharts installed
  - Project structure created

- [x] **[SETUP-001]** Map infrastructure setup
  - Completed: 2026-01-25
  - Added Leaflet and react-leaflet dependencies
  - Created TypeScript type definitions (lib/types.ts)
  - Implemented statistics utility functions (lib/stats.ts)
  - Color scale calculation based on quartiles

- [x] **[SETUP-002]** Core components implementation
  - Completed: 2026-01-25
  - MapLegend component with color scale
  - StatsPanel component showing NRW statistics
  - MapTooltip component for municipality details
  - NRWMap component with Leaflet integration
  - Main dashboard page with responsive layout

- [x] **[DATA-004]** Sample dataset creation
  - Completed: 2026-01-25
  - Collected real data for 10 major NRW cities
  - Verified rates from official sources
  - Included differentiated and unified rates
  - AGS codes for all sample municipalities
  - Data stored in public/data/grundsteuer-rates.json

## Blocked
<!-- Tasks waiting on external dependencies or decisions -->

## Sprint History
<!-- Will be populated after first sprint completion -->
