# Arica Toucan - ISO 27001/27002 Compliance SaaS

## Overview
Arica Toucan is an ISO 27001/27002 Compliance SaaS application that helps organizations assess, track, and improve their security compliance posture. The platform provides questionnaires, compliance reports, and an admin dashboard for managing multiple organizations.

## Current State
- **Version**: MVP (Minimum Viable Product)
- **Status**: Fully functional with all core features implemented
- **Last Updated**: January 19, 2026

## Features
1. **Login Page** - User authentication interface
2. **User Questionnaire** - 8 ISO compliance questions for organization employees
3. **Provider Questionnaire** - 5 internal review questions for service providers
4. **Report Preview** - Visual compliance report with score, pie chart, gaps, and remedies
5. **Admin Dashboard** - Overview of all scanned organizations with search/filter

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Charts**: Recharts
- **Styling**: Tailwind CSS with custom design tokens

### Backend (server/)
- **Framework**: Express.js
- **Storage**: In-memory (MemStorage class)
- **API**: RESTful endpoints prefixed with `/api`

### Shared (shared/)
- **Schema definitions**: Drizzle ORM schemas and Zod validation

## Key Files
- `client/src/App.tsx` - Main application with routing
- `client/src/pages/` - All page components
- `client/src/components/layout/` - Navbar and Footer components
- `client/src/index.css` - Design tokens and color scheme
- `server/routes.ts` - API route definitions
- `server/storage.ts` - In-memory data storage
- `shared/schema.ts` - Data models and validation schemas

## API Endpoints
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create new organization
- `POST /api/questionnaire/user` - Submit user questionnaire
- `GET /api/questionnaire/user` - Get user questionnaire responses
- `POST /api/questionnaire/provider` - Submit provider questionnaire
- `GET /api/questionnaire/provider` - Get provider questionnaire responses

## Color Scheme
- **Primary**: Blue (199 89% 48%) - Main brand color
- **Accent**: Teal (172 66% 50%) - Secondary actions
- **Status Colors**:
  - Green: Compliant
  - Amber: Partial compliance
  - Red: Critical gaps

## Running the Application
The application runs via the "Start application" workflow which executes `npm run dev`. This starts both the Express backend and Vite frontend development server on port 5000.

## Development Notes
- In-memory storage is used (data resets on restart)
- Mock organization data is seeded on startup
- Login is UI-only (no actual authentication implemented)
- All pages are responsive and support dark mode (via CSS variables)

## User Preferences
- None documented yet

## Recent Changes
- Initial MVP implementation with all core pages
- Professional blue/teal color scheme
- Responsive navigation with mobile menu
- Progress tracking on questionnaires
- Visual compliance reports with charts
