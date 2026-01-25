# CLAUDE.md

## Project Overview

Grundsteuer Dashboard is an interactive web application displaying Grundsteuer B (property tax) rates for all municipalities in North Rhine-Westphalia (NRW). The dashboard features an interactive map using Leaflet, showing color-coded tax rates and supporting differentiated rates (Wohn-/Nichtwohngrundstücke). Built with Next.js 15, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet 1.9 + react-leaflet 4.2
- **Data Visualization:** Recharts (for future charts)
- **Runtime:** Node.js 22

## Commands

```bash
# Install dependencies
npm install

# Development server (with Turbopack)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Production build
npm run build

# Start production server
npm start
```

## Architecture

### Directory Structure

```
grundsteuer-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page (client component)
│   ├── globals.css        # Global styles + Leaflet customization
│   └── api/               # API routes (for future use)
├── components/            # React components
│   ├── NRWMap.tsx        # Main Leaflet map component
│   ├── MapLegend.tsx     # Color scale legend
│   ├── MapTooltip.tsx    # Municipality tooltip (HTML generation)
│   └── StatsPanel.tsx    # Statistics overview panel
├── lib/                   # Utility functions, types
│   ├── types.ts          # TypeScript interfaces for data structures
│   └── stats.ts          # Statistics calculation functions
├── public/                # Static assets
│   └── data/             # Data files
│       ├── grundsteuer-rates.json        # Municipality tax rates
│       └── nrw-municipalities-geo.json   # GeoJSON boundaries (to be added)
├── .claude/               # Claude Code configuration
├── CLAUDE.md              # This file
└── SPRINT.md              # Sprint task tracking
```

### Key Patterns

- **App Router:** Use the Next.js 15 App Router for routing and layouts
- **Server Components:** Prefer Server Components by default, use 'use client' only when needed
- **Client Components:** Map components require 'use client' due to Leaflet's browser-only APIs
- **Dynamic Imports:** Use `dynamic` import from next/dynamic for Leaflet to avoid SSR issues
- **API Routes:** Place API endpoints in `app/api/` directory
- **TypeScript:** Strict mode enabled, always type your code
- **Tailwind:** Use utility classes for styling, extend theme in `tailwind.config.ts`

## Conventions

### Code Style

- Use functional components with TypeScript
- Prefer `const` over `let`
- Use destructuring for props
- Keep components small and focused
- Use async/await over promises

### File Naming

- Components: PascalCase (e.g., `PropertyCalculator.tsx`)
- Utilities: camelCase (e.g., `calculateTax.ts`)
- API routes: lowercase (e.g., `route.ts`)

### Commit Format

```
type: subject

body (optional)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Commit Rules

**IMPORTANT:** Before completing any task, you MUST run `/commit` to commit your changes.

- Only commit files YOU modified in this session — never commit unrelated changes
- Use atomic commits with descriptive messages
- If there are no changes to commit, skip this step
- Do not push unless explicitly asked

## Development Notes

### Grundsteuer Calculation

German property tax calculation typically involves:
- Property value (Grundstückswert)
- Assessment rate (Steuermesszahl)
- Municipal multiplier (Hebesatz)

Formula: `Tax = Property Value × Assessment Rate × Municipal Multiplier`

### Data Visualization

Use Recharts for all charts and graphs:
- Line charts for trends over time
- Bar charts for comparisons
- Pie charts for breakdowns

### API Routes

API routes should:
- Return proper HTTP status codes
- Handle errors gracefully
- Use TypeScript types for request/response
- Follow RESTful conventions

## Map Implementation

### Overview
The dashboard uses Leaflet for interactive map visualization of NRW municipalities with their Grundsteuer B rates.

### Data Sources

**Grundsteuer Rates:**
- Source: [Bund der Steuerzahler NRW](https://steuerzahler.de/)
- PDF: `Grundsteuer_B_2025_NRW_Erhebung_BdSt.pdf`
- Coverage: All 396 municipalities in NRW
- Current dataset: 10 major cities (sample)
- Data stored in: `public/data/grundsteuer-rates.json`

**GeoJSON Boundaries:**
- Source: [OpenGeoData NRW](https://www.opengeodata.nrw.de/produkte/geobasis/vkg/dvg/)
- Format: Shapefile (DVG2 - reduced density)
- Conversion: Use ogr2ogr or online tool to convert to GeoJSON
- Target location: `public/data/nrw-municipalities-geo.json`
- License: Data License Germany – Zero – Version 2.0
- Required property: AGS (Amtlicher Gemeindeschlüssel)

### Data Matching
- Municipality data is matched using AGS (8-digit official municipality code)
- GeoJSON features must have AGS property (may be named AGS, ags, or AGS_0)
- Rate data uses same AGS for matching

### Color Coding
- Color scale based on quartiles of all municipality rates
- For differentiated rates, average of Wohn-/Nichtwohn- is used for color
- Scale: Green (low) → Yellow (medium) → Orange → Red (high)
- Colors defined in `lib/stats.ts:getRateColor()`

### Components Architecture

**NRWMap.tsx:**
- Client component with dynamic import to avoid SSR issues
- Loads both rates data and GeoJSON
- Joins data using AGS matching
- Applies color styling based on rates
- Handles hover interactions and tooltips

**MapTooltip.tsx:**
- Generates HTML for Leaflet tooltips
- Shows municipality name, Kreis, rates (unified or differentiated)
- Displays comparison to NRW average
- Color-coded badges

**MapLegend.tsx:**
- Shows color scale with rate ranges
- Based on quartile breakpoints
- Explains differentiated rate averaging

**StatsPanel.tsx:**
- Displays NRW-wide statistics
- Total municipalities, differentiated count
- Average, min, max rates
- Info about Grundsteuerreform

### Leaflet Integration

**Important Notes:**
- Leaflet requires browser APIs, must use 'use client'
- Use `next/dynamic` with `{ ssr: false }` for Leaflet components
- Import Leaflet CSS: `import 'leaflet/dist/leaflet.css'`
- Custom tooltip styles in `app/globals.css`

**Map Configuration:**
- Center: [51.4332, 7.6616] (Dortmund/center of NRW)
- Default zoom: 8
- Tile layer: OpenStreetMap
- Interactive: hover shows tooltip, color changes on mouseover

### Adding New Data

**To expand to all 396 municipalities:**
1. Download latest PDF from Bund der Steuerzahler NRW
2. Manually extract data (AGS, name, Kreis, rates)
3. Update `public/data/grundsteuer-rates.json`
4. Verify AGS codes match GeoJSON

**To add GeoJSON boundaries:**
1. Download DVG2 from OpenGeoData NRW
2. Convert Shapefile to GeoJSON: `ogr2ogr -f GeoJSON output.json input.shp`
3. Simplify if needed: use mapshaper.org or similar
4. Verify AGS property exists in feature.properties
5. Save as `public/data/nrw-municipalities-geo.json`

### Known Issues & Legal Notes

**Differentiated Rates:**
- As of December 2025, Gelsenkirchen Administrative Court ruled differentiated rates violate tax fairness
- Several municipalities may need to switch to unified rates
- Data should be regularly updated to reflect legal changes

**Performance:**
- GeoJSON file should be <2MB for good performance
- Use DVG2 (reduced density) not DVG1
- Consider lazy loading for very large datasets
