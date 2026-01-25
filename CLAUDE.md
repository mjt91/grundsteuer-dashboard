# CLAUDE.md

## Project Overview

Grundsteuer Dashboard is a Next.js-based web application for calculating and visualizing German property tax (Grundsteuer) data. The project features data visualization capabilities using Recharts and follows a modern full-stack architecture with integrated API routes.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts
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
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── api/               # API routes
├── components/            # React components
├── lib/                   # Utility functions, types
├── public/                # Static assets
├── .claude/               # Claude Code configuration
├── CLAUDE.md              # This file
└── SPRINT.md              # Sprint task tracking
```

### Key Patterns

- **App Router:** Use the Next.js 15 App Router for routing and layouts
- **Server Components:** Prefer Server Components by default, use 'use client' only when needed
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
