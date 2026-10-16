# Angadi Marketplace

Kerala-first classifieds marketplace. V1 covers second-hand cars, built on a category-agnostic
listing model so bikes, property and other categories can follow.

## Repository

| Path                   | What it is                                                                   |
| ---------------------- | ---------------------------------------------------------------------------- |
| `apps/api`             | NestJS modular monolith — REST `/api/v1`, Prisma + PostgreSQL, Redis, BullMQ |
| `apps/web`             | Next.js web app (SSR SEO pages) + Capacitor static export for Android/iOS    |
| `apps/image-processor` | Photo pipeline: AWS Lambda (S3 → SQS) in prod, BullMQ worker locally         |
| `infra/local`          | Local bootstrap scripts used by `docker-compose.yml`                         |
| `docs/`                | V1 specs (PRD, system design, API, UI/UX) — the source of truth              |

## Local setup

Requirements: Node 24, pnpm 10, Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/image-processor/.env.example apps/image-processor/.env

pnpm infra:up      # Postgres :5433, Redis :6380, S3-compatible storage :9000
pnpm db:migrate
pnpm db:seed       # Kerala districts, Cars category, vehicle catalogue, optional admin

pnpm dev:api       # http://localhost:4000/api/v1  (Swagger: /api/docs)
pnpm dev:worker    # processes uploaded photos
pnpm dev:web       # http://localhost:3200
```

Login uses phone + OTP. In development the OTP is printed in the API log
(`[SMS] OTP for +91…`). The phone in `SEED_ADMIN_PHONE` is seeded as an admin.

## Tests

```bash
pnpm test        # unit tests (API domain rules, image transforms)
pnpm test:e2e    # API e2e against a separate angadi_test database
pnpm typecheck
```

## Web vs mobile builds

One Next.js codebase, two targets selected by `BUILD_TARGET`:

- `pnpm --filter @angadi/web build` — web. Files named `*.web.tsx` / `route.web.ts` are
  included: server-rendered `/cars/...`, `/car/[slug]`, `/dealers/[slug]`, sitemap, robots.
- `pnpm --filter @angadi/web build:mobile` — static export to `apps/web/out` for Capacitor.
  `*.mobile.tsx` files are included instead and dynamic pages use query strings
  (`/listing?slug=`, `/search?…`, `/dealer?slug=`). `lib/routes.ts` builds the right links.

First-time native setup (needs Android Studio / Xcode):

```bash
cd apps/web
pnpm build:mobile
npx cap add android && npx cap add ios
npx cap sync
```

For push notifications add `google-services.json` (Android) / APNs via FCM (iOS) and set
`FIREBASE_SERVICE_ACCOUNT_JSON` on the API. Without it, pushes are logged instead of sent.

## Key rules (see `CLAUDE.md`)

- Phones and full registration numbers never leave the API on public endpoints.
- A contact request is per listing; the 4-day cooldown key is buyer + seller + listing.
- Approval creates a Buyer → Seller connection that covers all the seller's listings.

## Production notes (AWS)

- API on ECS/Fargate behind an ALB; RDS PostgreSQL; ElastiCache Redis.
- S3 bucket stays private; CloudFront serves `listings/**/{thumb,card,detail}.webp` and
  `users/**` variants only — block `*/source.*` at the CloudFront behaviour level.
- S3 `ObjectCreated` on `listings/` and `users/` → SQS → `apps/image-processor` Lambda
  (`dist/lambda.handler`). It calls back `POST /api/v1/internal/media/...` with
  `INTERNAL_API_SECRET`. Set `MEDIA_LOCAL_PROCESSING=false` on the API.
- Next.js web on an AWS-compatible Node runtime; `API_INTERNAL_URL` can point at the
  internal ALB for SSR fetches.
