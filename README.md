# VerifySA

**AI-powered identity and document verification for South African enterprises.**

Trust every identity. Verify every document.

**Live Demo:** [https://verify-sa.vercel.app/](https://verify-sa.vercel.app/)

## What is VerifySA?

VerifySA is a multi-tenant B2B SaaS platform that helps recruitment agencies, HR teams, universities, and enterprises detect document fraud using AI analysis and deterministic rule validation. It produces Trust Scores, audit trails, and compliance-ready PDF reports.

## Quick Start

```bash
npm install
cp .env.example .env          # Add Supabase + OpenAI keys
# Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
npm run dev                     # http://localhost:4028
```

## Documentation

**Full system documentation:** [docs/SYSTEM_DOCUMENTATION.md](./docs/SYSTEM_DOCUMENTATION.md)

Covers product theory, architecture, database schema, authentication, RBAC, API reference, verification engine, deployment, and security.

## Key Routes

| Route | Description |
|-------|-------------|
| `/` | Public marketing landing page |
| `/auth/signup` | Create account + organization |
| `/dashboard` | Document upload & verification |
| `/organization` | Team, settings, rules admin |
| `/analytics-dashboard` | Verification analytics |
| `/verification-history` | Audit history + PDF export |

## Tech Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase · OpenAI GPT-4o · Framer Motion

## Environment

See [.env.example](./.env.example). Use the **publishable** Supabase key in `NEXT_PUBLIC_SUPABASE_ANON_KEY` — never the secret key.

## License

Private — All rights reserved.
