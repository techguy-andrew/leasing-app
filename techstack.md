# Technology Stack Documentation
**Application:** Leasing Application Portal
**Version:** 0.1.0
**Last Updated:** October 19, 2025
**Status:** Production Ready (100%)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Core Technologies](#core-technologies)
3. [Architecture & Structure](#architecture--structure)
4. [Dependencies](#dependencies)
5. [Infrastructure & Deployment](#infrastructure--deployment)
6. [Database & Storage](#database--storage)
7. [Authentication & Authorization](#authentication--authorization)
8. [APIs & Integration](#apis--integration)
9. [Development Tools](#development-tools)
10. [Configuration](#configuration)
11. [Security](#security)
12. [Performance Optimizations](#performance-optimizations)

---

## Executive Summary

This is a **production-ready**, full-stack leasing application portal built with modern web technologies. The application follows a monolithic architecture pattern using Next.js 15 App Router with React 19, TypeScript 5, and PostgreSQL database via Prisma ORM. The stack prioritizes type safety, security, performance, and developer experience.

**Key Characteristics:**
- 100% TypeScript for type safety across frontend and backend
- Server-side rendering with React Server Components
- Comprehensive authentication via Clerk
- Enterprise-grade security headers and validation
- Production-ready error handling with React Error Boundaries
- Serverless-ready architecture deployed on Vercel

**Production Readiness:**
- ✅ Authentication System (Clerk)
- ✅ Input Validation (Zod schemas)
- ✅ Security Headers (6+ configured)
- ✅ Error Boundaries (4 boundaries)
- ✅ Database Indexes
- ✅ API Protection
- ✅ Deployment Ready

---

## Core Technologies

### Programming Languages

#### TypeScript
- **Version:** 5.x (^5.9.3+)
- **Target:** ES2017
- **Purpose:** Primary language for all application code
- **Strict Mode:** Enabled
- **Module System:** ESNext with bundler resolution
- **Path Aliases:** `@/*` → `./src/*`
- **Configuration:** `tsconfig.json`

**Key Features Enabled:**
```json
{
  "strict": true,
  "noEmit": true,
  "esModuleInterop": true,
  "incremental": true,
  "isolatedModules": true
}
```

**Rationale:** Type safety, enhanced IDE support, early error detection, improved maintainability

---

#### JavaScript (ES2017+)
- **Purpose:** Runtime execution target
- **Usage:** Compiled output, configuration files (.mjs)
- **Compatibility:** All modern browsers (Chrome 60+, Firefox 54+, Safari 11+, Edge 15+)

---

### Frameworks

#### Next.js
- **Version:** 15.5.6 (exact)
- **Purpose:** Full-stack React framework providing SSR, SSG, routing, and API routes
- **Configuration:** `next.config.ts`
- **Bundler:** Turbopack (Rust-based, next-generation)
- **Rendering:** Hybrid (SSR, SSG, Client-side)

**Key Features:**
- App Router (file-based routing)
- React Server Components (default)
- API Routes (serverless functions)
- Image Optimization (AVIF, WebP)
- Font Optimization (automatic)
- Built-in Middleware support
- Streaming and Suspense

**Scripts:**
```bash
npm run dev      # Development server with Turbopack
npm run build    # Production build with DB migrations
npm run start    # Production server
```

**Rationale:** Industry-leading performance, built-in optimization, seamless full-stack development

---

#### React
- **Version:** 19.1.0 (exact)
- **DOM Renderer:** react-dom@19.1.0
- **Purpose:** UI component library and state management
- **Component Pattern:** Functional components with hooks

**Features Used:**
- ✅ React Server Components (default in App Router)
- ✅ Client Components (`'use client'` directive)
- ✅ Hooks (useState, useEffect, useCallback, useMemo, useRouter)
- ✅ Strict Mode (enabled globally)
- ✅ Suspense Boundaries
- ✅ Error Boundaries (Next.js 15 file-based)

**Rationale:** Component reusability, virtual DOM performance, extensive ecosystem

---

## Architecture & Structure

### Application Architecture Pattern

**Pattern:** Monolithic Full-Stack (Next.js App Router)

**Layers:**
```
┌─────────────────────────────────────┐
│   Presentation Layer (React)        │  Client/Server Components
├─────────────────────────────────────┤
│   Middleware Layer (Next.js)        │  Route Protection, Auth
├─────────────────────────────────────┤
│   API Layer (Next.js API Routes)    │  RESTful Endpoints
├─────────────────────────────────────┤
│   Business Logic Layer              │  Validation, Processing
├─────────────────────────────────────┤
│   Data Access Layer (Prisma ORM)    │  Type-safe Queries
├─────────────────────────────────────┤
│   Database Layer (PostgreSQL)       │  Persistent Storage
└─────────────────────────────────────┘
```

**Data Flow:**
```
User → Client Component → API Route → Prisma ORM → PostgreSQL
                ↓
         Server Component → Prisma ORM → PostgreSQL
```

---

### Directory Structure

```
application/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx           # Root layout (ClerkProvider wrapper)
│   │   ├── page.tsx             # Home page
│   │   ├── global-error.tsx     # Global error boundary
│   │   ├── error.tsx            # App-level error boundary
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── newapp/
│   │   │   └── page.tsx         # New application form
│   │   ├── applications/
│   │   │   ├── page.tsx         # Applications list
│   │   │   ├── error.tsx        # List error boundary
│   │   │   └── [appid]/
│   │   │       ├── page.tsx     # Application detail
│   │   │       └── error.tsx    # Detail error boundary
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx         # Clerk sign-in
│   │   ├── sign-up/[[...sign-up]]/
│   │   │   └── page.tsx         # Clerk sign-up
│   │   └── api/                 # API Routes
│   │       └── applications/
│   │           ├── route.ts     # GET, POST
│   │           └── [id]/
│   │               └── route.ts # GET, PUT, DELETE
│   │
│   ├── components/              # UI components
│   │   ├── Badges/
│   │   ├── Buttons/
│   │   ├── Cards/
│   │   ├── Field/
│   │   ├── Form/
│   │   ├── Items/
│   │   ├── Modals/
│   │   ├── Navigation/
│   │   └── Toast/
│   │
│   ├── lib/                     # Utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── constants.ts        # Application constants
│   │   ├── animations/
│   │   │   └── variants.ts
│   │   └── validations/
│   │       └── application.ts  # Zod schemas
│   │
│   ├── middleware.ts            # Clerk auth protection
│   └── generated/               # Prisma client
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── migrations/             # SQL migrations
│   └── seed.ts                 # Database seeding
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
└── postcss.config.mjs
```

---

### Component Architecture

**Pattern:** Atomic Design Methodology

**Hierarchy:**
- **Atoms:** Buttons, text fields, badges
- **Molecules:** Form fields with labels, status badges
- **Organisms:** Forms, navigation bars, cards
- **Templates:** NavigationLayout
- **Pages:** Applications list, detail pages

---

## Dependencies

### Production Dependencies (9 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `@clerk/nextjs` | ^6.33.7 | Authentication & user management |
| `@prisma/client` | ^6.17.1 | Type-safe database client |
| `lucide-react` | ^0.546.0 | Icon library (tree-shakeable) |
| `motion` | ^11.18.2 | Animation library (Framer Motion) |
| `next` | 15.5.6 | React framework with SSR/SSG |
| `prisma` | ^6.17.1 | Database toolkit & migration tool |
| `react` | 19.1.0 | UI library |
| `react-dom` | 19.1.0 | React DOM renderer |
| `zod` | ^3.23.8 | Schema validation library |

---

### Development Dependencies (9 packages)

| Package | Version | Purpose |
|---------|---------|---------|
| `@eslint/eslintrc` | ^3 | ESLint compatibility layer |
| `@tailwindcss/postcss` | ^4 | Tailwind CSS PostCSS plugin |
| `@types/node` | ^20 | Node.js type definitions |
| `@types/react` | ^19 | React type definitions |
| `@types/react-dom` | ^19 | React DOM type definitions |
| `eslint` | ^9 | JavaScript/TypeScript linter |
| `eslint-config-next` | 15.5.6 | Next.js ESLint rules |
| `tailwindcss` | ^4 | Utility-first CSS framework |
| `typescript` | ^5 | TypeScript compiler |

---

### System Requirements

**Minimum Versions:**
- **Node.js:** v18.17.0+ (v24.x recommended)
- **npm:** 9.x+ (11.x recommended)
- **pnpm:** 9.x+ (recommended package manager)

**Browser Compatibility:**
- Chrome/Edge 60+
- Firefox 54+
- Safari 11+

---

## Infrastructure & Deployment

### Build Tools

#### Turbopack
- **Version:** Bundled with Next.js 15.5.6
- **Purpose:** Next-generation bundler (Rust-based)
- **Usage:** Development and production builds
- **Performance:** 700x faster than Webpack

#### PostCSS
- **Version:** Via Tailwind CSS 4
- **Configuration:** `postcss.config.mjs`
- **Plugins:** `@tailwindcss/postcss@4`

---

### Package Manager

#### pnpm (Recommended)
- **Version:** 9.0+
- **Lockfile:** `pnpm-lock.yaml`
- **Features:**
  - Content-addressable storage
  - Strict dependency resolution
  - Faster than npm/yarn

---

### Deployment Platform

#### Vercel
- **Platform:** Serverless deployment
- **Features:**
  - Zero-config Next.js deployment
  - Edge Network CDN (global)
  - Automatic HTTPS
  - Serverless Functions
  - Image optimization

**Build Process:**
```bash
prisma migrate deploy
prisma generate
next build --turbopack
```

---

## Database & Storage

### Database System

#### PostgreSQL
- **Provider:** Neon (Serverless PostgreSQL)
- **Version:** Latest (cloud-managed)
- **Region:** AWS US-West-2
- **Connection:** SSL/TLS required
- **Environment Variable:** `DATABASE_URL`

---

### ORM Layer

#### Prisma
- **Version:** 6.17.1
- **Client:** @prisma/client@6.17.1
- **Configuration:** `prisma/schema.prisma`
- **Migrations:** `prisma/migrations/`

**Features:**
- Type-safe queries
- Auto-generated types
- Migration system
- Connection pooling (automatic)

---

### Database Schema

#### Application Model

```prisma
model Application {
  id         Int      @id @default(autoincrement())
  userId     String?  // Clerk user ID
  status     String   @default("New")
  moveInDate String
  property   String
  unitNumber String
  applicant  String
  email      String?
  phone      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([status])
  @@index([moveInDate])
  @@index([createdAt])
  @@index([userId])
}
```

**Performance Indexes:**
- `status` - Fast filtering
- `moveInDate` - Fast sorting
- `createdAt` - Chronological queries
- `userId` - Future RBAC support

---

## Authentication & Authorization

### Authentication System

#### Clerk
- **Package:** @clerk/nextjs@6.33.7
- **Purpose:** Authentication & user management
- **Type:** Managed service (SaaS)
- **Free Tier:** 10,000 MAU

**Features:**
- ✅ Email/password authentication
- ✅ Social login support
- ✅ Sign-in/sign-up pages
- ✅ UserButton component
- ✅ Middleware route protection
- ✅ Session management

**Integration:**
```tsx
// Root Layout
<ClerkProvider>
  <html lang="en">
    <body>{children}</body>
  </html>
</ClerkProvider>

// Middleware
const isPublicRoute = createRouteMatcher([
  '/', '/about(.*)' '/sign-in(.*)', '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

// API Routes
const { userId } = await auth()
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Protected Routes:**
- `/applications`
- `/applications/[appid]`
- `/newapp`
- `/api/applications`

**Public Routes:**
- `/` (landing)
- `/about`
- `/sign-in`
- `/sign-up`

---

### Authorization Model

**Current:** Basic authentication only

**Access Control:**
- All authenticated users see all applications
- No user-specific filtering (by design for MVP)
- userId tracked for future RBAC

---

## APIs & Integration

### API Architecture

**Pattern:** RESTful API via Next.js API Routes

**Base URL:** `/api`

**Content-Type:** `application/json`

---

### API Endpoints

#### Applications API

**1. List All Applications**
```
GET /api/applications
Auth: Required
Response: { success: true, data: Application[] }
Status: 200, 401, 500
```

**2. Create Application**
```
POST /api/applications
Auth: Required
Body: Application data (Zod validated)
Response: { success: true, data: Application }
Status: 201, 400, 401, 500
```

**3. Get Application**
```
GET /api/applications/[id]
Auth: Required
Response: { success: true, data: Application }
Status: 200, 400, 401, 404, 500
```

**4. Update Application**
```
PUT /api/applications/[id]
Auth: Required
Body: Partial application data (Zod validated)
Response: { success: true, data: Application }
Status: 200, 400, 401, 404, 500
```

**5. Delete Application**
```
DELETE /api/applications/[id]
Auth: Required
Response: { success: true, message: string }
Status: 200, 400, 401, 404, 500
```

---

### Validation System

#### Zod Schemas

**Location:** `src/lib/validations/application.ts`

**Create Schema:**
```typescript
z.object({
  name: z.string().trim().min(1),
  moveInDate: dateSchema, // MM/DD/YYYY
  property: z.enum(propertyValues),
  unitNumber: z.string().trim().min(1),
  email: emailSchema, // Valid or null
  phone: phoneSchema, // XXX-XXX-XXXX or null
  status: z.enum(statusValues).optional().default('New')
})
```

**Validation Rules:**
- **Date:** MM/DD/YYYY format, 1900-2100 range, validates actual date
- **Email:** Valid format or null, trimmed
- **Phone:** 10+ digits, flexible formatting, allows null
- **Property:** One of 10 predefined properties (enum)
- **Status:** New/Pending/Approved/Rejected (enum)

---

### Third-Party Integrations

1. **Clerk** - Authentication service
2. **Neon** - PostgreSQL hosting
3. **Vercel** - Deployment platform
4. **Google Fonts** - Geist Sans font

---

## Development Tools

### Code Quality

#### ESLint
- **Version:** 9.x
- **Configuration:** `eslint.config.mjs`
- **Extends:** next/core-web-vitals, next/typescript

**Run:**
```bash
npm run lint
```

---

#### TypeScript
- **Version:** 5.x
- **Mode:** Type-checking only (noEmit: true)
- **Strict:** Enabled

---

### Styling Framework

#### Tailwind CSS
- **Version:** 4.x
- **Plugin:** @tailwindcss/postcss@4
- **Configuration:** `src/app/globals.css`

**Features:**
- Utility-first CSS
- JIT compilation
- Auto-purging
- Mobile-first

---

### Animation Library

#### Motion (Framer Motion)
- **Package:** motion@11.18.2
- **Purpose:** Production-ready animations
- **Usage:** Fade, slide, scale animations

---

### Icon Library

#### Lucide React
- **Version:** 0.546.0
- **Features:** Tree-shakeable, consistent design

---

### Testing

**Status:** Not implemented (deferred for MVP)

**Recommended:** Vitest + React Testing Library + Playwright

---

## Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Environment
NODE_ENV="development" | "production"
```

---

### Application Constants

**Location:** `src/lib/constants.ts`

**Status Options:**
- New (default)
- Pending
- Approved
- Rejected

**Properties:** 10 apartment complexes
**Color Mappings:** Tailwind status colors

---

## Security

### Security Headers

**Configured in `next.config.ts`:**

1. **X-Frame-Options:** DENY (prevents clickjacking)
2. **X-Content-Type-Options:** nosniff
3. **X-XSS-Protection:** 1; mode=block
4. **Referrer-Policy:** strict-origin-when-cross-origin
5. **Permissions-Policy:** Restricts camera/mic/geolocation
6. **Content-Security-Policy:** Comprehensive CSP

**CSP Highlights:**
- `default-src 'self'`
- Clerk domains whitelisted
- Vercel Live allowed
- `upgrade-insecure-requests`
- `frame-ancestors 'none'`

---

### Input Validation

**Multi-layer Strategy:**

1. **Client-side:** Zod validation before API call
2. **Server-side:** Zod validation in API routes
3. **Database:** Prisma ORM (prevents SQL injection)

**Protected Against:**
- ✅ SQL Injection (Prisma)
- ✅ XSS (CSP headers)
- ✅ CSRF (Clerk tokens)
- ✅ Clickjacking (X-Frame-Options)

---

### Error Handling

**4 Error Boundaries:**

1. **Global:** `src/app/global-error.tsx` (root crashes)
2. **App:** `src/app/error.tsx` (main app errors)
3. **List:** `src/app/applications/error.tsx` (API failures)
4. **Detail:** `src/app/applications/[appid]/error.tsx` (invalid IDs)

**Features:**
- User-friendly messages
- Stack traces in dev mode
- Reset/retry functionality
- Navigation fallbacks

---

## Performance Optimizations

### Frontend

- **Image:** AVIF/WebP, lazy loading, 30-day cache
- **Font:** Auto-subsetting, preload, variable fonts
- **JavaScript:** Tree-shaking, code splitting, minification
- **CSS:** Purging, critical CSS, compression

### Backend

- **Database:** Connection pooling, strategic indexes
- **API:** Serverless functions, edge-ready
- **Build:** Turbopack (700x faster)

### Mobile

- Mobile-first responsive design
- Touch-friendly UI
- Font size 16px+ (prevents iOS zoom)
- Optimized tap targets

---

## Developer Onboarding

### Setup Steps

1. **Install Prerequisites:**
   ```bash
   # Node.js v18+
   # pnpm
   npm install -g pnpm
   ```

2. **Clone & Install:**
   ```bash
   git clone <repo>
   cd application
   pnpm install
   ```

3. **Configure Environment:**
   ```bash
   # Create .env with DATABASE_URL and Clerk keys
   ```

4. **Setup Database:**
   ```bash
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

5. **Start Development:**
   ```bash
   pnpm dev
   # http://localhost:3000
   ```

---

### Key Files

**Priority 1:**
1. `src/app/layout.tsx` - Root layout
2. `src/app/api/applications/route.ts` - API logic
3. `prisma/schema.prisma` - Database schema
4. `src/middleware.ts` - Route protection

**Priority 2:**
5. `next.config.ts` - Configuration
6. `tsconfig.json` - TypeScript settings
7. `.env` - Environment variables

**Priority 3:**
8. `src/components/Form/FormV2.tsx` - Application form
9. `src/lib/validations/application.ts` - Zod schemas

---

## Technology Decisions

### Why These Technologies?

**Next.js 15:** Industry-leading performance, built-in SSR/SSG, zero-config deployment

**TypeScript:** Type safety, early error detection, better DX

**Clerk:** Fastest to production (30 min), pre-built UI, managed service

**Zod:** Runtime validation, TypeScript integration, detailed errors

**Prisma:** Type-safe queries, auto-migrations, excellent DX

**Tailwind:** Rapid development, small bundle, mobile-first

**PostgreSQL (Neon):** ACID compliance, serverless scaling, cost-effective

---

## Production Readiness

### ✅ Completed

- [x] Authentication (Clerk)
- [x] Input validation (Zod)
- [x] Security headers
- [x] Error boundaries
- [x] Database indexes
- [x] API protection
- [x] Deployment setup

### ⏸️ Deferred (Not Critical)

- [ ] Rate limiting (Clerk handles)
- [ ] Testing infrastructure
- [ ] Error monitoring
- [ ] RBAC implementation

---

## Support

**Documentation:**
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TypeScript: https://typescriptlang.org/docs
- Prisma: https://prisma.io/docs
- Clerk: https://clerk.com/docs
- Tailwind: https://tailwindcss.com/docs
- Zod: https://zod.dev

**Internal:**
- `README.md` - Project overview
- `Production Readiness Implementation Log` - Security checklist

---

**Document Version:** 2.0
**Last Updated:** October 19, 2025
**Status:** Production Ready (100%)
**Maintained By:** Development Team
