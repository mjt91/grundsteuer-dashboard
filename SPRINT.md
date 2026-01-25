# Sprint Backlog

## Current Sprint: Initial Setup
Started: 2026-01-25
Goal: Set up project foundation and core infrastructure

## In Progress
<!-- Tasks currently being worked on -->

## Backlog (Prioritized)

### High Priority
- [ ] **[FEATURE-001]** Implement property tax calculation form
  - Create input form for property details (value, location, type)
  - Add validation for required fields
  - Implement calculation logic based on German tax rules

- [ ] **[FEATURE-002]** Build calculation results display
  - Show breakdown of tax calculation
  - Display final tax amount
  - Add explanation of calculation steps

- [ ] **[FEATURE-003]** Add data visualization for tax breakdown
  - Create pie chart showing tax components
  - Add bar chart for comparison with average values
  - Use Recharts library

### Medium Priority
- [ ] **[FEATURE-004]** Create API endpoint for calculations
  - POST /api/calculate endpoint
  - Input validation
  - Return structured calculation results

- [ ] **[FEATURE-005]** Add calculation history feature
  - Store previous calculations (localStorage initially)
  - Display list of past calculations
  - Allow viewing/comparing previous results

- [ ] **[FEATURE-006]** Improve UI/UX
  - Add responsive design for mobile devices
  - Improve form layout and styling
  - Add loading states and error handling

### Lower Priority
- [ ] **[FEATURE-007]** Add municipality-specific multipliers
  - Create database/file of German municipalities
  - Auto-populate Hebesatz based on selected municipality
  - Add search/autocomplete for municipality selection

- [ ] **[CHORE-001]** Add unit tests
  - Test calculation logic
  - Test API endpoints
  - Add test runner configuration

- [ ] **[DOCS-001]** Create user documentation
  - Add usage guide to README
  - Document calculation methodology
  - Add examples

## Completed This Sprint
- [x] **[CHORE-000]** Initial project setup
  - Completed: 2026-01-25
  - Next.js 15 with TypeScript configured
  - Tailwind CSS and Recharts installed
  - Project structure created

## Blocked
<!-- Tasks waiting on external dependencies or decisions -->

## Sprint History
<!-- Will be populated after first sprint completion -->
