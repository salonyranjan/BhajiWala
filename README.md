# Bhajiwala

A mobile-first Pav Bhaji ordering experience . Customers can place food orders, reserve tables, track orders, download bills, and chat with Bhaji Buddy in English or Hindi.owner manages live orders and reservations from a password-protected owner dashboard.

## What is included

- Responsive food menu with search, cart, quantity controls, and cash-on-delivery checkout
- Accurate menu pricing, bulk-order messaging, and delivery inside Science Centre
- Printable one-page bill / PDF export from the customer order confirmation
- Customer order tracker and one-tap reorder
- Table reservations visible in the owner dashboard
- Owner dashboard for order status: New → Accepted → Cooking → Ready → Out for delivery → Delivered
- English/Hindi Bhaji Buddy customer support chat, powered by Groq when configured
- Kitchen email alerts for orders and reservations through Resend (optional)
- PostgreSQL persistence with Prisma migrations and automatic menu seeding
- Railway deployment configuration and database-aware health check
- Branded SVG logo, browser icon, and installable PWA manifest

## Architecture

```mermaid
flowchart TD
  C[Customer on mobile or desktop] --> W[Next.js Bhajiwala app]
  O[Owner / Rajiv] --> A[/admin dashboard]
  W -->|Place / track order| ORD[/api/orders]
  W -->|Reserve a table| RES[/api/reservations]
  W -->|English or Hindi support| BOT[/api/waiter]
  A -->|View orders and reservations| ORD
  A --> RES
  ORD --> P[(PostgreSQL via Prisma)]
  RES --> P
  BOT --> P
  BOT --> G[Groq AI]
  ORD -->|optional alert| E[Resend email]
  RES -->|optional alert| E
  H[/api/health] --> P
```

## Tech stack

| Area | Used technology |
| --- | --- |
| Frontend / server | Next.js 14 App Router, React, TypeScript |
| Styling | Tailwind tooling and custom responsive CSS |
| Database | PostgreSQL + Prisma ORM |
| Validation | Zod |
| AI assistant | Vercel AI SDK + Groq |
| Email alerts | Resend REST API |
| Deployment | Railway + Railway PostgreSQL |

## Project map

```text
app/
  page.tsx                 Customer app entry point
  admin/page.tsx           Owner dashboard
  api/orders/              Create, track, and update orders
  api/reservations/        Create and list reservations
  api/waiter/              Bhaji Buddy bilingual support
  api/recommendations/     AI menu recommendations
  api/health/              Railway database health check
components/
  adda-experience.tsx      Customer menu, cart, tracker, bill, chat, reservation UI
lib/
  prisma.ts                Shared Prisma client
  menu-context.ts          Database menu context for AI
prisma/
  schema.prisma            PostgreSQL data model
  migrations/              Versioned production schema migrations
  seed.ts                  Idempotent menu seed data
public/logo.svg            Bhajiwala brand mark
railway.toml               Railway build, start, and health-check settings
```

## Requirements

- Node.js 20 or newer
- npm
- A PostgreSQL database for local development or Railway deployment

## Environment variables

Copy the example file first:

```bash
copy .env.example .env
```

On macOS/Linux, use `cp .env.example .env` instead.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma |
| `ADMIN_PASSWORD` | Yes | Password required to view the owner dashboard data |
| `GROQ_API_KEY` | Recommended | Enables Bhaji Buddy and AI recommendations |
| `RESEND_API_KEY` | Optional | Enables email notifications |
| `ORDER_NOTIFICATION_EMAIL` | Optional | Rajiv's notification inbox |
| `ORDER_FROM_EMAIL` | Optional | Verified Resend sender, e.g. `Bhajiwala <orders@example.com>` |

Example local database URL:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/bhajiwala?schema=public"
ADMIN_PASSWORD="use-a-long-unique-password"
```

### Quick local PostgreSQL with Docker (optional)

If Docker Desktop is installed, this starts a local PostgreSQL database without a separate database installation:

```bash
docker run --name bhajiwala-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=bhajiwala -p 5432:5432 -d postgres:16
```

Use the example `DATABASE_URL` above with the same password. To stop it later, run `docker stop bhajiwala-postgres`; to start it again, run `docker start bhajiwala-postgres`.

Never commit `.env`. It is already ignored by Git.

## Run locally

1. Install dependencies.

   ```bash
   npm install
   ```

2. Create `.env` and set a working local PostgreSQL `DATABASE_URL` plus `ADMIN_PASSWORD`.

3. Generate Prisma Client and create the database tables.

   ```bash
   npm run db:generate
   npm run db:migrate:dev
   ```

4. Add the standard menu inventory.

   ```bash
   npm run db:seed
   ```

5. Start the app.

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). The customer app is at `/`; the owner dashboard is at `/admin`.

## Daily owner workflow

1. Open `/admin` and enter `ADMIN_PASSWORD`.
2. Review new orders and reservations.
3. Update the order status as food moves through preparation and delivery.
4. Customers can check that status with their order code and phone number.
5. If Resend is configured, each order and reservation also arrives by email.

Orders are paid to Rajiv at delivery. The app does not collect online payments.

## API overview

| Endpoint | Method | Use |
| --- | --- | --- |
| `/api/orders` | `POST` | Creates a validated customer order and optional email alert |
| `/api/orders` | `GET` | Tracks an order for the supplied order suffix and phone number; owner view requires password header |
| `/api/orders` | `PATCH` | Changes an order status; owner password required |
| `/api/reservations` | `POST` | Saves a table reservation and optional email alert |
| `/api/reservations` | `GET` | Lists reservations; owner password required |
| `/api/waiter` | `POST` | Generates Bhaji Buddy support replies |
| `/api/recommendations` | `POST` | Returns menu suggestions for a craving |
| `/api/health` | `GET` | Returns `200` only when PostgreSQL is reachable |

## Deploy to Railway

### 1. Push the project to GitHub

Create a new GitHub repository, then run these commands from the project folder:

```bash
git init
git add .
git commit -m "Prepare Bhajiwala for Railway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Do not add `.env` or `prisma/dev.db`; they are intentionally ignored.

### 2. Create Railway services

1. In Railway, create a **New Project** and choose **Deploy from GitHub Repo**.
2. Select this repository. Railway detects `railway.toml` automatically.
3. In the same project, click **New** → **Database** → **Add PostgreSQL**.

### 3. Add app variables

Open the **web app service** → **Variables**. If the database service is called `Postgres`, paste this exact value:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

If your database service has a different name, replace `Postgres` with that exact service name. Then add:

```env
ADMIN_PASSWORD=use-a-long-unique-owner-password
GROQ_API_KEY=your-groq-api-key
```

For kitchen email alerts, add:

```env
RESEND_API_KEY=your-resend-api-key
ORDER_NOTIFICATION_EMAIL=rajivs-inbox@example.com
ORDER_FROM_EMAIL=Bhajiwala <orders@your-verified-domain.com>
```

### 4. Deploy

Railway runs this lifecycle automatically:

```mermaid
flowchart LR
  A[GitHub push] --> B[npm run build]
  B --> C[prisma generate]
  C --> D[next build]
  D --> E[prisma migrate deploy]
  E --> F[prisma db seed]
  F --> G[next start]
  G --> H[/api/health checks PostgreSQL]
```

`prisma db seed` uses upserts, so every restart safely refreshes the standard menu without creating duplicates. Once the service is healthy, Railway gives you a public URL; add a custom domain from the Railway service settings if desired.

## Database commands

| Command | When to use it |
| --- | --- |
| `npm run db:generate` | After changing `schema.prisma` |
| `npm run db:migrate:dev` | Create and apply a new migration locally |
| `npm run db:migrate:deploy` | Apply committed migrations in a production environment |
| `npm run db:seed` | Add or refresh the menu inventory |
| `npm run check` | Verify TypeScript before committing or deploying |
| `npm run check` | Verify TypeScript before committing or deploying |
| `npm run build` | Run a production build locally |
| `npm run start` | Run migrations, seed data, then serve production build |

### Important migration note

The old local `prisma/dev.db` SQLite database is not migrated automatically to PostgreSQL. Railway starts with the seeded menu. If you must preserve old local orders or reservations, export them before replacing the local database setup and import them into PostgreSQL deliberately.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Railway health check fails | Confirm `DATABASE_URL` is a Railway variable reference and the PostgreSQL service is running. |
| Owner dashboard rejects password | Set `ADMIN_PASSWORD` in the web service variables, redeploy, then enter that exact password at `/admin`. |
| No order emails | Check all three Resend variables and verify the sender domain in Resend. Orders still save when email is not configured. |
| Bhaji Buddy does not answer | Add a valid `GROQ_API_KEY`. Core ordering and reservations work without it. |
| Prisma cannot connect locally | Start PostgreSQL and confirm the local `DATABASE_URL` database name, port, user, and password. |
| Menu is missing after deployment | Confirm startup completed; run `npm run db:seed` in the Railway service shell if needed. |

## Security notes

- Use a long, unique `ADMIN_PASSWORD`; do not use a phone number or a common word.
- Keep API keys only in Railway Variables or `.env`, never in source code.
- Rotate keys immediately if they are shared publicly.
- The owner dashboard validates the password on every protected API request.

## License

Private project for Bhajiwala.
