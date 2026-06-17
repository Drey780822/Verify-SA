# VerifySA — Complete System Documentation

**Version:** 0.1.0  
**Last updated:** June 2026  
**Platform:** Multi-tenant B2B SaaS · AI document verification for South Africa

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Domain & Product Theory](#2-problem-domain--product-theory)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Technology Stack](#4-technology-stack)
5. [Project Structure](#5-project-structure)
6. [Authentication & Session Management](#6-authentication--session-management)
7. [Role-Based Access Control (RBAC)](#7-role-based-access-control-rbac)
8. [Multi-Tenancy Model](#8-multi-tenancy-model)
9. [Database Schema](#9-database-schema)
10. [Row-Level Security (RLS)](#10-row-level-security-rls)
11. [Verification Engine](#11-verification-engine)
12. [Trust Score & Risk Assessment](#12-trust-score--risk-assessment)
13. [API Reference](#13-api-reference)
14. [Frontend Application](#14-frontend-application)
15. [Landing Page (Marketing Site)](#15-landing-page-marketing-site)
16. [PDF Report Generation](#16-pdf-report-generation)
17. [Analytics & Audit Logging](#17-analytics--audit-logging)
18. [Environment Variables](#18-environment-variables)
19. [Setup & Deployment](#19-setup--deployment)
20. [Security Model](#20-security-model)
21. [User Journeys](#21-user-journeys)
22. [Data Flow Diagrams](#22-data-flow-diagrams)
23. [Known Limitations & Roadmap](#23-known-limitations--roadmap)
24. [Glossary](#24-glossary)

---

## 1. Executive Summary

**VerifySA** is an AI-powered identity and document verification platform designed for South African organizations. It helps recruitment agencies, SMEs, HR teams, universities, insurance providers, and financial institutions detect fraudulent documents, validate South African identity numbers, and produce audit-ready verification reports.

The platform operates as a **multi-tenant B2B SaaS** product:

- Each **organization** (tenant) has isolated data
- **Users** belong to one or more organizations with assigned **roles**
- **Verifications** are scoped to the active organization
- All persistent data lives in **Supabase PostgreSQL** with **Row-Level Security**

The system combines:

1. **AI forensic analysis** (OpenAI GPT-4o via server-side proxy)
2. **Deterministic rule validation** (SA ID Luhn checksum, format checks, field consistency)
3. **Composite Trust Score** (0–100) with configurable strictness
4. **Enterprise controls** (RBAC, audit logs, team management, approval workflows)

---

## 2. Problem Domain & Product Theory

### 2.1 The Fraud Landscape

Modern hiring and onboarding in South Africa faces accelerating fraud vectors:

| Threat | Description |
|--------|-------------|
| **AI-generated identities** | Synthetic documents created by generative AI tools |
| **Forged certificates** | Fake matric, degree, and professional qualifications |
| **Identity theft** | Stolen or misused SA ID numbers in applications |
| **Hiring fraud** | Candidates using fraudulent credentials to gain employment |
| **Deepfake risk** | Increasing use of manipulated identity media in remote hiring |

Traditional manual verification (visual inspection, phone calls to institutions) is slow, inconsistent, and cannot scale. VerifySA automates the first line of defense with AI + rules, producing measurable **Trust Scores** and **audit trails** for compliance.

### 2.2 Product Philosophy

VerifySA is built on four pillars:

| Pillar | Meaning |
|--------|---------|
| **Trust** | Every verification produces a quantified Trust Score and explicit recommendation |
| **Security** | Tenant isolation, RBAC, encrypted transport, RLS at database level |
| **Auditability** | Immutable-style audit logs and per-verification audit trails |
| **Configurability** | Per-organization strictness, rules, workflows, and usage limits |

### 2.3 Target Users

| Persona | Primary use |
|---------|-------------|
| **Organization Admin** | Team setup, verification policy, usage monitoring |
| **HR Manager** | Bulk verification, approve flagged documents, analytics |
| **Recruiter** | Upload and verify candidate documents |
| **Viewer** | Read-only access to results and analytics |
| **Super Admin** | Platform-wide access (internal VerifySA operators) |

### 2.4 Supported Document Types

| Type | Code | Validation focus |
|------|------|------------------|
| SA Identity Document | `SA_ID` | 13-digit format, Luhn checksum, DOB/gender/citizenship digits |
| Certificate / Qualification | `CERTIFICATE` | Institution name, AI forgery indicators |
| Proof of Residence | `PROOF_OF_RESIDENCE` | Field extraction, consistency |
| Passport | `PASSPORT` | Format, AI analysis |
| Driver's Licence | `DRIVERS_LICENSE` | Institution/format checks |

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│  Landing Page (/)  │  Auth Pages  │  Dashboard  │  Org Admin  │ Charts  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Next.js 15 App Router (Node.js)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │ Middleware  │  │ API Routes   │  │ Server Components / Client UI   │ │
│  │ (Auth gate) │  │ /api/*       │  │ React 19 + Tailwind + Framer    │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────────────────────┘ │
│         │                │                                              │
│         │    ┌───────────┴───────────┐                                  │
│         │    │  Session + RBAC Layer │                                  │
│         │    │  lib/auth/session.ts  │                                  │
│         │    └───────────┬───────────┘                                  │
└─────────┼────────────────┼──────────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐
│ Supabase Auth   │  │ Supabase        │  │ OpenAI GPT-4o               │
│ (JWT sessions)  │  │ PostgreSQL+RLS  │  │ via /api/ai/chat-completion │
└─────────────────┘  └─────────────────┘  └─────────────────────────────┘
```

### 3.1 Architectural Layers

| Layer | Responsibility |
|-------|----------------|
| **Presentation** | React pages, dashboard UI, landing page, forms |
| **Edge / Middleware** | Session refresh, route protection, redirects |
| **Application (API)** | Business logic, RBAC checks, verification orchestration |
| **Domain** | Fraud detection, rule engine, trust scoring, PDF generation |
| **Infrastructure** | Supabase Auth, PostgreSQL, OpenAI API |

### 3.2 Request Lifecycle (Authenticated)

1. Browser sends request with Supabase session cookies
2. `middleware.ts` refreshes session via `@supabase/ssr`
3. Unauthenticated users → redirected to `/auth/login`
4. Authenticated users on `/` → redirected to `/dashboard`
5. API route calls `requireSession()` → loads user, profile, org, role
6. Permission check via `hasPermission(role, permission)`
7. Supabase query runs under user's JWT → RLS enforces tenant isolation
8. Response returned as JSON or rendered page

---

## 4. Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js (App Router) | 15.5.x | Full-stack React framework |
| Language | TypeScript | 5.x | Type safety |
| UI | React | 19.x | Component model |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS, dark theme |
| Animation | Framer Motion | 12.x | Landing page, scroll reveals |
| Icons | Lucide React | 1.x | Icon system |
| Charts | Recharts | 2.x | Analytics, trust gauge |
| Toasts | Sonner | 1.x | Notifications |
| Auth & DB | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) | 2.x | Auth, PostgreSQL, RLS |
| AI | OpenAI GPT-4o via `@rocketnew/llm-sdk` | — | Document fraud analysis |
| PDF | jsPDF + jspdf-autotable | 4.x / 5.x | Verification reports |
| Deployment | Netlify (plugin configured) | — | Hosting target |

---

## 5. Project Structure

```
verify-SA/
├── docs/                          # Documentation (this file)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database schema + RLS + triggers
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Public landing page (/)
│   │   ├── layout.tsx             # Root layout, fonts, toasts
│   │   ├── middleware.ts          # Re-exports supabase middleware
│   │   ├── dashboard/             # Document upload app (/dashboard)
│   │   ├── auth/                  # Login, signup, password reset
│   │   ├── organization/          # Org admin dashboard
│   │   ├── verification-history/  # Verification list + export
│   │   ├── verification-results-dashboard/
│   │   ├── analytics-dashboard/
│   │   ├── api/                   # REST API routes
│   │   └── components/            # Page-specific components
│   ├── components/
│   │   ├── landing/               # Marketing site (14 sections)
│   │   ├── ui/                    # Reusable UI primitives
│   │   ├── AppLayout.tsx          # Sidebar + main shell
│   │   └── Sidebar.tsx            # Navigation, org context, logout
│   ├── lib/
│   │   ├── supabase/              # Browser, server, middleware clients
│   │   ├── auth/session.ts        # Session context + RBAC helpers
│   │   ├── ai/                    # Fraud detection, chat completion
│   │   ├── audit/logger.ts        # Audit log writer
│   │   ├── reports/pdfGenerator.ts
│   │   └── hooks/useSession.ts    # Client session hook
│   ├── types/database.ts          # TypeScript types + RBAC matrix
│   └── styles/tailwind.css        # Design system (CSS variables)
├── .env.example
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

### 5.1 Route Map

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Marketing landing page |
| `/auth/login` | Public | Sign in |
| `/auth/signup` | Public | Register + create organization |
| `/auth/reset-password` | Public | Password reset email |
| `/auth/update-password` | Public (with token) | Set new password |
| `/dashboard` | Authenticated | Document upload & verification queue |
| `/verification-results-dashboard` | Authenticated | Detailed verification results |
| `/verification-history` | Authenticated | Searchable verification table |
| `/analytics-dashboard` | Authenticated | KPIs, charts, activity feed |
| `/organization` | Authenticated | Team, settings, rules, usage |

---

## 6. Authentication & Session Management

### 6.1 Auth Provider

VerifySA uses **Supabase Auth** with email/password. Sessions are stored in **HTTP-only cookies** managed by `@supabase/ssr`.

### 6.2 Supabase Client Variants

| File | Runtime | Usage |
|------|---------|-------|
| `src/lib/supabase/client.ts` | Browser | Auth forms, client-side sign in/out |
| `src/lib/supabase/server.ts` | Server (RSC, API routes) | Data queries with user session |
| `src/lib/supabase/middleware.ts` | Edge middleware | Session refresh on every request |

### 6.3 Environment Key Safety

`src/lib/supabase/env.ts` enforces:

- **Publishable (anon) key** → used in browser and server auth clients
- **Secret (service_role) key** → must NEVER use `NEXT_PUBLIC_` prefix
- Rejects `sb_secret_*` keys in public env vars with a clear error

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...   # Safe for browser
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...            # Server only
```

### 6.4 Signup Flow

1. User submits email, password, full name, organization name at `/auth/signup`
2. `supabase.auth.signUp()` creates row in `auth.users` with metadata
3. Database trigger `handle_new_user()` (on `auth.users` INSERT):
   - Creates `profiles` row
   - Creates `organizations` row with generated slug
   - Adds user as `organization_admin` in `organization_members`
   - Sets `profiles.active_organization_id`
   - Seeds 7 default `verification_rules`
4. User redirected to `/dashboard`

### 6.5 Login Flow

1. User signs in at `/auth/login`
2. Supabase sets session cookies
3. Middleware redirects authenticated users away from auth pages → `/dashboard`

### 6.6 Password Reset

1. `/auth/reset-password` → `resetPasswordForEmail()` sends magic link
2. User lands on `/auth/update-password` with token
3. `updateUser({ password })` sets new password

### 6.7 OAuth Callback

`GET /api/auth/callback` exchanges auth code for session (email confirmation links).

### 6.8 Middleware Route Rules

| Condition | Action |
|-----------|--------|
| No user + protected route | Redirect → `/auth/login?redirect=...` |
| User + `/` (landing) | Redirect → `/dashboard` |
| User + `/auth/*` (except callback) | Redirect → `/dashboard` |
| Public routes | `/`, `/auth/*`, `/api/auth/*` — no auth required |

### 6.9 Session Context (Server)

`getSessionContext()` returns:

```typescript
{
  user: { id, email },
  profile: Profile,
  organization: Organization,      // active org
  membership: OrganizationMember,
  role: UserRole                   // super_admin if profile.is_super_admin
}
```

Used by all API routes via `requireSession()` and `requirePermission()`.

---

## 7. Role-Based Access Control (RBAC)

### 7.1 Roles

| Role | Code | Description |
|------|------|-------------|
| Super Admin | `super_admin` | Platform-wide access (`profiles.is_super_admin = true`) |
| Organization Admin | `organization_admin` | Full org control |
| HR Manager | `hr_manager` | Verify, approve, analytics |
| Recruiter | `recruiter` | Create verifications, view results |
| Viewer | `viewer` | Read-only |

### 7.2 Permission Matrix

Defined in `src/types/database.ts`:

| Permission | Super Admin | Org Admin | HR Manager | Recruiter | Viewer |
|------------|:-----------:|:---------:|:----------:|:---------:|:------:|
| `*` (all) | ✓ | | | | |
| `org:manage` | ✓ | ✓ | | | |
| `team:manage` | ✓ | ✓ | | | |
| `verifications:create` | ✓ | ✓ | ✓ | ✓ | |
| `verifications:view` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `verifications:approve` | ✓ | ✓ | ✓ | | |
| `rules:manage` | ✓ | ✓ | | | |
| `analytics:view` | ✓ | ✓ | ✓ | | ✓ |
| `audit:view` | ✓ | ✓ | ✓ | | ✓ |
| `reports:generate` | ✓ | ✓ | ✓ | ✓ | |

### 7.3 Enforcement Layers

RBAC is enforced at **two levels**:

1. **Application layer** — API routes check `hasPermission()` before executing
2. **Database layer** — RLS policies use SQL functions like `can_verify()`, `can_manage_org()`

Defense in depth: even if application checks are bypassed, RLS prevents cross-tenant data access.

---

## 8. Multi-Tenancy Model

### 8.1 Tenant Definition

A **tenant** = one `organizations` row. All business data carries `organization_id`.

### 8.2 User ↔ Organization Relationship

```
User (auth.users)
  └── Profile (profiles)
        └── active_organization_id → current working org
  └── OrganizationMember[] (organization_members)
        └── role per org
```

- Users can belong to **multiple organizations** (via invitations)
- **Active organization** determines which data is shown in the dashboard
- Switch org: `POST /api/organizations/switch` updates `profiles.active_organization_id`

### 8.3 Invitation Flow

1. Org admin invites email + role → `invitations` row with token
2. Invitee signs up or logs in
3. `POST /api/invitations/accept` with token
4. Row added to `organization_members`, invitation marked `accepted`

### 8.4 Tenant Isolation Guarantees

- Every query filters by `organization_id` from session context
- PostgreSQL RLS policies enforce `auth.uid()` membership checks
- No shared verification data between organizations

---

## 9. Database Schema

Migration file: `supabase/migrations/001_initial_schema.sql`

### 9.1 Entity Relationship (Conceptual)

```
organizations ──┬── organization_members ── profiles ── auth.users
                ├── invitations
                ├── verifications
                ├── verification_rules
                └── audit_logs
```

### 9.2 Tables

#### `organizations`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Display name |
| slug | TEXT | Unique URL-safe identifier |
| plan | TEXT | Subscription tier (default: `starter`) |
| verification_strictness | ENUM | `lenient`, `standard`, `strict` |
| approval_workflow | ENUM | `auto_approve`, `manual_review`, `dual_approval` |
| settings | JSONB | Extensible org settings |
| verification_limit | INT | Plan quota (default: 500) |
| verifications_used | INT | Usage counter |

#### `profiles`

Extends Supabase `auth.users`. Links to active organization.

#### `organization_members`

Many-to-many: users ↔ organizations with role.

#### `invitations`

Pending team invites with 7-day expiry and unique token.

#### `verifications`

Core verification record. JSONB columns store flexible structured data:

| JSONB Column | Contents |
|--------------|----------|
| `extracted_data` | OCR/AI extracted fields |
| `rule_checks` | Array of rule validation results |
| `ai_findings` | Summary, indicators, recommendation |
| `audit_trail` | Per-verification event log |

#### `verification_rules`

Per-org configurable rules (enabled/disabled, strictness weight).

#### `audit_logs`

Organization-wide audit events for compliance and analytics activity feed.

### 9.3 Enums

- `user_role`, `verification_status`, `risk_level`, `strictness_level`
- `approval_workflow`, `audit_action`, `invitation_status`

### 9.4 Database Triggers

| Trigger | Event | Action |
|---------|-------|--------|
| `on_auth_user_created` | INSERT on `auth.users` | Profile, org, membership, default rules |
| `*_updated_at` | UPDATE on tables | Auto-set `updated_at` |

### 9.5 SQL Helper Functions

| Function | Purpose |
|----------|---------|
| `is_super_admin()` | Check platform admin flag |
| `get_user_org_ids()` | List orgs user belongs to |
| `has_org_role(org_id, roles[])` | Role check |
| `can_manage_org(org_id)` | Admin-level access |
| `can_verify(org_id)` | Can create/update verifications |
| `can_view_org(org_id)` | Read access to org data |

---

## 10. Row-Level Security (RLS)

RLS is **enabled on all application tables**. Policies use `auth.uid()` from the Supabase JWT.

### Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| organizations | Members + super admin | Super admin only | Org admins | — |
| profiles | Self + org members | (trigger) | Self | — |
| organization_members | Org viewers | Org admins | Org admins | Org admins |
| invitations | Admins + invitee email | Org admins | Org admins | Org admins |
| verifications | Org viewers | Verifiers (own user id) | Verifiers | — |
| verification_rules | Org viewers | Org admins | Org admins | Org admins |
| audit_logs | Org viewers | Org members | — | — |

**Theory:** RLS implements **mandatory access control** at the data layer. The application cannot accidentally leak another tenant's rows because PostgreSQL rejects unauthorized queries regardless of application code paths.

---

## 11. Verification Engine

Location: `src/lib/ai/fraudDetection.ts`  
Entry point: `analyzeDocumentForFraud(documentName, documentType, strictnessLevel)`

### 11.1 Pipeline Stages

```
Document metadata
       │
       ▼
┌──────────────────┐
│  AI Analysis     │  GPT-4o forensic prompt → JSON response
│  (GPT-4o)        │  Simulated OCR extraction + fraud indicators
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Rule Engine     │  Deterministic SA ID / field validation
│  runRuleChecks() │  Produces pass/fail/warning per rule
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Trust Score     │  AI score − rule penalties, clamped 0–100
│  Risk Level      │  LOW / MEDIUM / HIGH
└────────┬─────────┘
         │
         ▼
   Persist to Supabase + audit trail
```

### 11.2 AI Analysis

- **Model:** GPT-4o via `POST /api/ai/chat-completion`
- **Prompt:** Forensic document analysis specialized for South African documents
- **Strictness:** `lenient`, `standard`, `strict` — adjusts AI sensitivity
- **Output:** JSON with `extractedData`, `aiScore`, `summary`, `indicators`, `recommendation`

The AI proxy route supports multiple providers (OpenAI, Anthropic, Gemini, Perplexity) but verification uses OpenAI.

### 11.3 Rule Engine (Deterministic)

Rules in `runRuleChecks()`:

| Rule ID | Check | Penalty (on fail) |
|---------|-------|-------------------|
| `rule-name` | Full name present (>2 chars) | 15 |
| `rule-id-format` | 13-digit SA ID format | 25 |
| `rule-luhn` | Luhn checksum on ID number | 20 |
| `rule-dob` | DOB consistent with ID prefix | 5 |
| `rule-gender` | Gender digit matches extracted gender | 5 |
| `rule-citizenship` | Citizenship digit 0 or 1 | 10 |
| `rule-institution` | Institution name (certificates/licenses) | 10 |

Organization-level `verification_rules` table stores which rules are enabled and their weights (admin UI). The core engine implements the logic; org rules govern configuration.

### 11.4 API Orchestration

`POST /api/verifications`:

1. Validate session + `verifications:create` permission
2. Check org usage limit (`verifications_used < verification_limit`)
3. Insert verification with `status: processing`
4. Call `analyzeDocumentForFraud()`
5. Determine final status:
   - `complete` — normal finish
   - `flagged` — HIGH risk + workflow ≠ `auto_approve`
6. Update verification record with all results
7. Increment `organizations.verifications_used`
8. Write `audit_logs` entries

### 11.5 Current Limitation: OCR

Document **file bytes are not uploaded to the server** in the current implementation. The AI analyzes **document name and type metadata** and simulates OCR extraction. Production deployment should add Supabase Storage + vision API for real image analysis.

---

## 12. Trust Score & Risk Assessment

### 12.1 Formula

```
rawScore = aiScore - rulePenaltySum
trustScore = clamp(round(rawScore), 0, 100)
```

### 12.2 Risk Levels

| Trust Score | Risk Level | Typical Recommendation |
|-------------|------------|------------------------|
| 75–100 | LOW | APPROVE |
| 50–74 | MEDIUM | REVIEW |
| 0–49 | HIGH | REJECT / FLAG |

### 12.3 Approval Workflow Interaction

| Workflow | Behavior on HIGH risk |
|----------|----------------------|
| `auto_approve` | Status → `complete` |
| `manual_review` | Status → `flagged` |
| `dual_approval` | Status → `flagged` (requires two approvers — UI pending) |

### 12.4 Strictness Levels

| Level | AI behavior |
|-------|-------------|
| Lenient | Only obvious fraud flagged |
| Standard | Balanced (default) |
| Strict | Minor inconsistencies flagged |

Set per organization in `/organization` → Verification Settings.

---

## 13. API Reference

All authenticated routes require valid Supabase session cookies unless noted.

### 13.1 Session

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/session` | Returns user, profile, organization, role |

### 13.2 Auth

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/callback` | OAuth/email confirmation callback |

### 13.3 Verifications

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/verifications` | view | List org verifications (`?limit`, `?status`) |
| POST | `/api/verifications` | create | Run new verification |
| GET | `/api/verifications/[id]` | view | Single verification detail |
| GET | `/api/verifications/[id]/report` | reports:generate | Download PDF report |

**POST /api/verifications body:**
```json
{
  "documentName": "Sipho_Ndlovu_SA_ID.jpg",
  "documentType": "SA_ID"
}
```

### 13.4 Organizations

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/organizations` | — | Active org + all memberships |
| PATCH | `/api/organizations` | org:manage | Update name, strictness, workflow |
| POST | `/api/organizations/switch` | — | Switch active organization |

### 13.5 Team

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/team` | — | Members + pending invitations |
| POST | `/api/team` | team:manage | Invite member `{ email, role }` |
| PATCH | `/api/team` | team:manage | Change role `{ memberId, role }` |
| DELETE | `/api/team?memberId=` | team:manage | Remove member |
| DELETE | `/api/team?invitationId=` | team:manage | Revoke invitation |

### 13.6 Verification Rules

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/verification-rules` | — | List org rules |
| PATCH | `/api/verification-rules` | org:manage | Bulk update rules |

### 13.7 Analytics

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/analytics?period=30d` | analytics:view | KPIs, charts, activity, fraud patterns |

### 13.8 Audit Logs

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | `/api/audit-logs?limit=50` | audit:view | Organization audit history |

### 13.9 Invitations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/invitations/accept` | Accept invite `{ token }` |

### 13.10 AI Proxy

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/chat-completion` | LLM proxy (used internally by fraud engine) |

**Error responses:** `{ "error": "message" }` with HTTP 401, 403, 404, 429, or 500.

---

## 14. Frontend Application

### 14.1 App Shell

- `AppLayout.tsx` — Sidebar + scrollable main content
- `Sidebar.tsx` — Navigation, org name, user info, logout
- Uses `useSession()` hook → `GET /api/session`

### 14.2 Key Pages

| Page | Component | Data source |
|------|-----------|-------------|
| Document Upload | `DocumentUploadContent.tsx` | `POST /api/verifications` |
| Results Dashboard | `VerificationResultsContent.tsx` | `GET /api/verifications`, `GET /api/verifications/[id]` |
| Verification History | `VerificationHistoryContent.tsx` | `GET /api/verifications` + PDF export |
| Analytics | `AnalyticsDashboardContent.tsx` | `GET /api/analytics` |
| Organization Admin | `OrganizationAdminContent.tsx` | `/api/team`, `/api/organizations`, `/api/verification-rules` |

### 14.3 Design System

CSS variables in `src/styles/tailwind.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0f1a` | Page background |
| `--primary` | `#06b6d4` | Cyan accent |
| `--accent` | `#8b5cf6` | Violet accent |
| `--card` | `#111827` | Card surfaces |
| Risk colors | emerald/amber/red | Trust score badges |

Component classes: `.btn-primary`, `.card-elevated`, `.glass-panel`, `.sidebar-link-active`, etc.

### 14.4 Client Session Hook

`useSession()` in `src/lib/hooks/useSession.ts`:

- Fetches `/api/session` on mount
- Returns `{ session, loading, refresh }`
- Used by Sidebar, DocumentUpload, Analytics

---

## 15. Landing Page (Marketing Site)

Location: `src/components/landing/`

Public route at `/` — 14 sections:

1. Hero — parallax dashboard preview, animated counters
2. Problem — fraud statistics, timeline
3. How It Works — 6-step scroll animation
4. Features — 9 capability cards
5. Dashboard Preview — live React mock of product UI
6. Industries — 6 sector cards
7. Security — architecture diagram
8. Collaboration — team/settings UI preview
9. Analytics — metric cards + bar chart
10. Testimonials
11. Pricing — Starter / Professional / Enterprise
12. FAQ — accordion
13. CTA — conversion section
14. Footer — links, newsletter

Performance: below-fold sections lazy-loaded via `dynamic()`. Framer Motion for scroll reveals.

---

## 16. PDF Report Generation

Location: `src/lib/reports/pdfGenerator.ts`  
Endpoint: `GET /api/verifications/[id]/report`

### Report Contents

1. **Header** — VerifySA branding, generation timestamp
2. **Verification Summary** — org, document, status, ID
3. **Trust Score** — score /100, risk level, recommendation, OCR confidence
4. **Extracted Document Fields** — table of all extracted data
5. **AI Findings** — summary + indicator table
6. **Rule Validation Results** — pass/fail/warning per rule
7. **Audit Trail** — timestamped events
8. **Footer** — confidential notice, page numbers

Generated server-side with jsPDF; returned as `application/pdf` download.

---

## 17. Analytics & Audit Logging

### 17.1 Analytics (`GET /api/analytics`)

Computed from organization's `verifications` and `audit_logs`:

- **KPIs:** total verifications, pass rate, fraud detections, avg processing time, usage quota
- **Volume chart:** verifications per day
- **Risk distribution:** LOW / MEDIUM / HIGH counts
- **Document types:** breakdown by type
- **Activity feed:** recent audit log entries
- **Fraud patterns:** aggregated rule failures

Period filter: `?period=7d|30d|90d`

### 17.2 Audit Logging

`logAuditEvent()` in `src/lib/audit/logger.ts` writes to `audit_logs`.

Tracked actions: verification lifecycle, team changes, settings updates, report generation.

Each verification also maintains an embedded `audit_trail` JSONB array for document-level history.

---

## 18. Environment Variables

| Variable | Required | Exposure | Description |
|----------|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public | Publishable/anon key (`sb_publishable_*`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Optional | Public | Alias for anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | **Server only** | Admin operations (not used in current app routes) |
| `OPENAI_API_KEY` | Yes* | Server | GPT-4o verification (*required for AI) |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Public | Canonical site URL for auth redirects |
| `ANTHROPIC_API_KEY` | No | Server | Alternative LLM provider |
| `GEMINI_API_KEY` | No | Server | Alternative LLM provider |

**Never** put secret keys in `NEXT_PUBLIC_*` variables.

---

## 19. Setup & Deployment

### 19.1 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with Supabase publishable key + OpenAI key

# 3. Run database migration
# Open Supabase Dashboard → SQL Editor
# Paste and execute: supabase/migrations/001_initial_schema.sql

# 4. Configure Supabase Auth
# Authentication → URL Configuration:
#   Site URL: http://localhost:4028
#   Redirect URLs: http://localhost:4028/api/auth/callback

# 5. Start dev server
npm run dev
# → http://localhost:4028
```

### 19.2 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (port 4028) |
| `npm run build` | Production build |
| `npm run serve` | Production server |
| `npm run type-check` | TypeScript validation |
| `npm run lint` | ESLint |

### 19.3 Production Deployment (Netlify)

- `@netlify/plugin-nextjs` configured in devDependencies
- Set all env vars in Netlify dashboard
- Update Supabase Auth redirect URLs to production domain
- Ensure migration has been applied to production Supabase project

### 19.4 Post-Setup Checklist

- [ ] Migration applied successfully
- [ ] Supabase Auth email templates configured (optional)
- [ ] Publishable key in `.env` (not secret key)
- [ ] OpenAI API key set
- [ ] Test signup → dashboard → verification flow
- [ ] Test org admin: invite, rules, settings

---

## 20. Security Model

### 20.1 Defense in Depth

| Layer | Mechanism |
|-------|-----------|
| Transport | HTTPS (TLS 1.3 in production) |
| Authentication | Supabase JWT in HTTP-only cookies |
| Authorization | RBAC in application + RLS in database |
| Tenant isolation | `organization_id` + RLS policies |
| API keys | Server-side only; publishable key in browser |
| Input validation | Required field checks on API routes |

### 20.2 POPIA / Compliance Considerations

- Personal data (ID numbers, names) stored in PostgreSQL — ensure DPA with Supabase
- Audit logs support accountability requirements
- PDF reports should be handled per org data retention policy
- Users can be removed; CASCADE deletes clean up memberships

### 20.3 Recommendations for Production

1. Rotate secret keys if ever exposed in `NEXT_PUBLIC_*`
2. Enable Supabase email confirmation for signups
3. Add rate limiting on `/api/verifications`
4. Implement real file upload to Supabase Storage (not metadata-only)
5. Add CAPTCHA on signup
6. Enable Supabase database backups
7. Add CSP headers in `next.config.mjs`

---

## 21. User Journeys

### 21.1 New Organization Signup

```
Landing (/) → Sign Up → Supabase Auth → DB Trigger
  → Profile + Org + Admin role + Default rules
  → Dashboard → Upload document → Verify → Results
```

### 21.2 Team Member Invitation

```
Admin → /organization → Invite email + role
  → Invitation created → Email sent (manual/pending)
  → Invitee signs up → POST /api/invitations/accept
  → Added to org with assigned role
```

### 21.3 Document Verification

```
Recruiter → /dashboard → Upload file → Select type → Run verification
  → POST /api/verifications → AI + Rules → Trust Score
  → View in Results / History → Download PDF report
```

### 21.4 Organization Configuration

```
Admin → /organization
  → Team tab: invite, change roles, remove members
  → Settings tab: strictness, approval workflow
  → Rules tab: toggle validation rules
  → Usage tab: monitor quota
```

---

## 22. Data Flow Diagrams

### 22.1 Verification Data Flow

```
[Browser Upload UI]
        │ documentName, documentType
        ▼
[POST /api/verifications]
        │ requireSession(), hasPermission
        ▼
[Supabase INSERT verifications] status=processing
        │
        ▼
[analyzeDocumentForFraud()]
        ├──► POST /api/ai/chat-completion → OpenAI GPT-4o
        └──► runRuleChecks() → deterministic rules
        │
        ▼
[Supabase UPDATE verifications] status, trust_score, ai_findings, ...
        │
        ├──► audit_logs INSERT
        └──► organizations.verifications_used++
        │
        ▼
[JSON response → Browser UI update]
```

### 22.2 Authentication Data Flow

```
[Browser login form]
        ▼
[supabase.auth.signInWithPassword] (client.ts)
        ▼
[Supabase Auth] → JWT session cookies set
        ▼
[Middleware] refresh session on each request
        ▼
[API / Page] createClient() (server.ts) reads cookies
        ▼
[Supabase queries with auth.uid()] → RLS applied
```

---

## 23. Known Limitations & Roadmap

### 23.1 Current Limitations

| Area | Limitation |
|------|------------|
| OCR | Metadata-only analysis; files not uploaded to server |
| File storage | No Supabase Storage integration yet |
| Email invites | Invitation records created; email sending not wired |
| Billing | Plan limits tracked; Stripe not integrated |
| SSO/SAML | Not implemented (Enterprise roadmap) |
| Webhooks / API keys | Nav placeholders; routes not built |
| Dual approval | Workflow enum exists; UI workflow incomplete |
| Super admin UI | Flag exists; no dedicated admin console |

### 23.2 Suggested Roadmap

1. Supabase Storage + Vision API for real document OCR
2. Background job queue for batch verification
3. Stripe billing tied to `organizations.plan`
4. Email service for invitations (Resend/SendGrid)
5. Public REST API with API key auth
6. Webhook notifications on verification complete/flagged
7. Super admin platform dashboard

---

## 24. Glossary

| Term | Definition |
|------|------------|
| **Trust Score** | Composite 0–100 authenticity rating |
| **Risk Level** | LOW / MEDIUM / HIGH derived from Trust Score |
| **RLS** | Row-Level Security — PostgreSQL tenant isolation |
| **RBAC** | Role-Based Access Control |
| **Tenant** | An organization in the multi-tenant system |
| **Strictness** | AI sensitivity setting (lenient/standard/strict) |
| **Audit Trail** | Chronological log of verification events |
| **Luhn Checksum** | Algorithm validating SA ID check digit |
| **Publishable Key** | Supabase anon key safe for browser use |
| **Service Role Key** | Supabase admin key — server only |
| **POPIA** | Protection of Personal Information Act (South Africa) |

---

## Appendix A: TypeScript Types Reference

Primary types in `src/types/database.ts`:

- `Organization`, `Profile`, `OrganizationMember`, `Invitation`
- `Verification`, `VerificationRule`, `AuditLog`
- `ExtractedDocumentData`, `FraudIndicator`, `RuleCheckResult`, `AIFindings`
- `AnalyticsData`, `AnalyticsKPI`
- Helper functions: `hasPermission`, `canManageTeam`, `canCreateVerification`, `canManageOrg`

## Appendix B: Default Verification Rules (Seeded on Signup)

1. Full name present (weight: 15)
2. 13-digit SA ID format (weight: 25)
3. Luhn checksum validation (weight: 20)
4. DOB matches ID pattern (weight: 5)
5. Gender digit consistency (weight: 5)
6. Citizenship digit validation (weight: 10)
7. Institution name present (weight: 10)

---

*This document describes VerifySA as implemented in the codebase. For questions or contributions, refer to the source files cited in each section.*
