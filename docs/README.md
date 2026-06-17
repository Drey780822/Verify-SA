# VerifySA Documentation

Complete technical and product documentation for the VerifySA platform.

| Document | Description |
|----------|-------------|
| **[System Documentation](./SYSTEM_DOCUMENTATION.md)** | Full reference: product theory, architecture, database, auth, API, verification engine, deployment |
| **[Database Migration](../supabase/migrations/001_initial_schema.sql)** | PostgreSQL schema, RLS policies, triggers |
| **[Environment Template](../.env.example)** | Required environment variables |

## Quick Links

- **Landing page:** `/` (public)
- **App dashboard:** `/dashboard` (authenticated)
- **Sign up:** `/auth/signup`
- **Organization admin:** `/organization`

## Local Development

```bash
npm install
cp .env.example .env   # configure Supabase + OpenAI keys
# Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
npm run dev            # http://localhost:4028
```
