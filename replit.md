# Arica Toucan - ISO 27001/27002 Compliance SaaS

## Overview

Arica Toucan is an ISO 27001/27002 compliance SaaS platform that helps organizations assess, track, and maintain their security compliance. The application provides structured questionnaires for both organization employees and service providers, generates compliance reports with visual analytics, and offers an admin dashboard for managing multiple organizations.

Key features:
- User questionnaires aligned with ISO 27001/27002 controls
- Provider/internal review questionnaires
- Compliance report previews with scoring and gap analysis
- Admin dashboard for viewing all scanned organizations
- Multi-organization support with compliance tracking

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **Build Tool**: Vite for frontend, esbuild for server bundling
- **API Design**: RESTful JSON APIs under `/api/*` prefix

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with PostgreSQL schema ready for migration
- **Database Migrations**: Drizzle Kit with migrations output to `./migrations`

### Project Structure
```
├── client/           # React frontend application
│   ├── src/
│   │   ├── components/   # UI components (layout, shadcn/ui)
│   │   ├── pages/        # Route page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Data storage layer
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client and server
│   └── schema.ts     # Drizzle schema and Zod validators
└── script/           # Build scripts
```

### API Structure
- `GET /api/organizations` - List all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization
- `POST /api/questionnaire/user` - Submit user questionnaire
- `POST /api/questionnaire/provider` - Submit provider questionnaire

### Development vs Production
- Development: Vite dev server with HMR, served through Express middleware
- Production: Static files built to `dist/public`, server bundled to `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Recharts**: Charting library for compliance visualizations

### Form & Validation
- **Zod**: Schema validation for API requests and forms
- **React Hook Form**: Form state management
- **drizzle-zod**: Generate Zod schemas from Drizzle tables

### Build Tools
- **Vite**: Frontend build and dev server
- **esbuild**: Server bundling for production
- **TypeScript**: Type checking across the entire codebase