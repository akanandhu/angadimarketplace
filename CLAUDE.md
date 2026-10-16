# Angadi Marketplace

Kerala-first classifieds marketplace. V1 = used cars. Specs live in `docs/` (PRD, system design,
API, UI/UX) and are the V1 source of truth.

## Layout

- `apps/api` — NestJS modular monolith, REST under `/api/v1`, Prisma + PostgreSQL, Redis + BullMQ.
- `apps/web` — Next.js (App Router) + Tailwind + TanStack Query, wrapped by Capacitor for mobile.
- `docker-compose.yml` — local Postgres (port 5433) and Redis (port 6380).

## Conventions

- Keep files under ~200 lines. Split modules/components instead of growing files.
- Small, focused commits. No Claude co-author trailers.
- Responses: `{ data }`, paginated `{ data, meta }`, errors `{ error: { code, message, details } }`.
- Prices are integer INR. Timestamps ISO 8601 UTC.
- Business rules live in NestJS only. The frontend never decides authorization.

## Non-negotiable rules

- Public APIs never return seller/buyer phone, full registration, tokens, OTP state, push tokens.
  Public listing payloads expose only the RTO code (e.g. `KL07`).
- ContactRequest (listing-specific) and ContactConnection (directional Buyer -> Seller) are
  separate. The 4-day cooldown key is `buyer + seller + source listing`.
- Cars are category data (`CarDetails`) hanging off a generic `Listing`.
- Catalogue uses Angadi UUIDs; external provider IDs only in `*ExternalRef` tables.
- No microservices, dedicated search engine, chat or payments in V1.
