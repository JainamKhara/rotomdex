<div align="center">

<img src="public/rotomdex_logo.svg" alt="RotomDex" width="380" />

**A competitive-grade Pokédex built for trainers who think in data.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-0C344B?logo=prisma)](https://www.prisma.io/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running Locally](#running-locally)
- [Pages & Routes](#pages--routes)
- [Key Design Decisions](#key-design-decisions)
- [Performance](#performance)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

RotomDex is a full-stack Pokédex application powered by a real PostgreSQL database and live PokéAPI data. It goes far beyond a basic lookup tool — it gives trainers everything they need to research, compare, and build competitive teams: stat breakdowns, type-coverage calculators, head-to-head comparisons, and a silhouette quiz to sharpen their Pokémon recognition.

The name is a nod to the in-game Rotom Pokédex (Pokémon Sun/Moon), where Rotom possesses a digital device to become your tactical companion.

---

## Features

### 🔍 Pokédex (`/pokedex`)

- Browse all **1,025 Pokémon** across Generation 1 through Generation 9
- **Instant search** — filter by name as you type with zero-latency results
- **Generation filter** — narrow results to any single generation
- **Type filter** — show only Pokémon of a specific element type
- **Legendary / Mythical / Baby** category toggles
- Pokémon cards display: sprite, name, ID, types, and primary stats at a glance
- Click any card to go to the full detail page

### 📋 Pokémon Detail Page (`/pokemon/[id]`)

- Full stat radar / bar chart (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed)
- Type matchup table — what the Pokémon is **weak to**, **resistant to**, and **immune to**
- Evolution chain with trigger conditions (level-up, stone, trade, happiness, etc.)
- Learnable moves list with method, power, accuracy, PP, and type
- Known abilities (including hidden ability) with descriptions
- Physical data: height, weight, gender rate, catch rate, base EXP, habitat
- Japanese name and Pokédex flavor text
- Shiny sprite toggle

### ⚔️ Compare (`/compare`)

- Select any two Pokémon and compare them **side by side**
- Visual stat bars scale relative to each other for instant reading
- Type advantages displayed for both — see which typing wins the matchup
- Move intersection — shared move pool highlighted

### 🛡️ Team Builder (`/teams`)

- Assemble a team of up to **6 Pokémon**
- Set custom **nickname** and **level** per member
- Real-time **type coverage analysis** — see your team's collective weaknesses and resistances at a glance
- Color-coded vulnerability chart (immune / quarter / half / neutral / double / quad)
- Team data persisted to `localStorage` so it survives page refreshes
- Squad carries over to the About page Trainer Card display

### 🎮 Who's That Pokémon? (Home `/`)

- Silhouette guessing game — identify the Pokémon from its blacked-out sprite
- 4 multiple-choice options generated from the full 1,025 roster
- **Streak counter** — tracks consecutive correct guesses per session
- Instant reveal on selection with the Pokémon's name and sprite
- New random Pokémon loads on each round — covers every gen

### 🌓 Dark Mode

- System-preference aware — respects `prefers-color-scheme` by default
- Manual toggle via the ThemeToggle button in the nav bar
- Persisted across sessions via `localStorage`

### 📖 About (`/about`)

- Project overview with real tech stack icons from [Simple Icons CDN](https://cdn.simpleicons.org)
- Creator profile with live links to GitHub, LinkedIn, and portfolio

---

## Tech Stack

| Layer         | Technology                | Purpose                                          |
| ------------- | ------------------------- | ------------------------------------------------ |
| Framework     | **Next.js 16.2**          | App Router, Server Components, SSR               |
| UI Library    | **React 19**              | Concurrent rendering, Suspense                   |
| Language      | **TypeScript 6**          | End-to-end type safety                           |
| Styling       | **Tailwind CSS v4**       | Utility-first, CSS-variable tokens               |
| Animation     | **Framer Motion 12**      | Page transitions, micro-animations               |
| ORM           | **Prisma 7.8**            | Type-safe DB access, migrations                  |
| Database      | **PostgreSQL on Neon**    | Serverless, auto-scaling, connection pooling     |
| Data Fetching | **TanStack Query v5**     | Caching, background sync, stale-while-revalidate |
| Auth          | **NextAuth.js v4**        | Session management (Prisma adapter)              |
| Forms         | **React Hook Form + Zod** | Validated forms with schema inference            |
| Charts        | **Recharts**              | Stat bar charts on detail pages                  |
| HTTP Client   | **Axios**                 | API request layer                                |
| State         | **Zustand**               | Lightweight global state                         |
| Icons         | **Lucide React**          | Consistent SVG icon set                          |
| External API  | **PokéAPI**               | Pokémon data, sprites, moves, evolutions         |

---

## Project Structure

```
pokedex/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page — project info + creator card
│   ├── api/
│   │   └── pokemon/
│   │       └── route.ts      # GET /api/pokemon — search & filter endpoint
│   ├── compare/
│   │   └── page.tsx          # Head-to-head comparison tool
│   ├── pokedex/
│   │   └── page.tsx          # Full Pokédex browser with filters
│   ├── pokemon/
│   │   └── [id]/
│   │       └── page.tsx      # Individual Pokémon detail page
│   ├── teams/
│   │   └── page.tsx          # Team builder with type coverage
│   ├── globals.css            # Global styles, CSS variables, Tailwind imports
│   ├── layout.tsx             # Root layout — fonts, theme provider, QueryClient
│   └── page.tsx               # Home — Who's That Pokémon? game
├── components/
│   ├── Logo.tsx               # RotomDex logo component
│   └── ThemeToggle.tsx        # Dark/light mode toggle
├── generated/
│   └── prisma/                # Auto-generated Prisma Client output
├── lib/
│   └── ...                    # Shared utilities, DB client, helpers
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Seed script — pulls from PokéAPI and writes to DB
├── public/                    # Static assets
├── .env.local                 # Local environment variables (gitignored)
├── next.config.ts             # Next.js configuration
├── package.json
├── prisma.config.ts           # Prisma config (custom output path)
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json
```

---

## API Routes

### `GET /api/pokemon`

Internal REST endpoint that the Pokédex browser and Compare tool query. Supports the following query parameters:

| Parameter    | Type      | Description                                   |
| ------------ | --------- | --------------------------------------------- |
| `q`          | `string`  | Name search (case-insensitive, partial match) |
| `generation` | `number`  | Filter by generation (1–9)                    |
| `type`       | `string`  | Filter by type slug (e.g. `fire`, `dragon`)   |
| `legendary`  | `boolean` | Filter to legendary-only                      |
| `mythical`   | `boolean` | Filter to mythical-only                       |
| `baby`       | `boolean` | Filter to baby Pokémon                        |
| `limit`      | `number`  | Max results (default: 20)                     |
| `offset`     | `number`  | Pagination offset                             |

**Response shape:**

```json
{
  "pokemon": [
    {
      "id": 6,
      "name": "charizard",
      "types": ["fire", "flying"],
      "hp": 78,
      "attack": 84,
      "defense": 78,
      "spAtk": 109,
      "spDef": 85,
      "speed": 100,
      "generation": 1,
      "imageUrl": "https://raw.githubusercontent.com/...",
      "legend": false
    }
  ],
  "total": 84
}
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm** / **yarn**
- A **PostgreSQL** database — [Neon](https://neon.tech) (free tier works perfectly) or local Docker

### Installation

```bash
# Clone the repository
git clone https://github.com/JainamKhara/pokedex.git
cd pokedex

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file at the root of the project:

```env
# PostgreSQL connection string (Neon, Supabase, Railway, or local)
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# NextAuth — required even if auth is not fully wired up
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"   # Generate with: openssl rand -base64 32
```

> **Note:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

### Database Setup

```bash
# Push the schema to your database (creates all tables)
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio

# Seed the database with all 1,025 Pokémon from PokéAPI
# This will take a few minutes on first run
npm run seed
# or directly:
# npx ts-node --transpile-only prisma/seed.ts
```

> The seed script fetches data from `https://pokeapi.co` and writes it to your PostgreSQL database. It handles rate limiting and retries automatically. Run it once — subsequent runs are idempotent.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app uses **Turbopack** in development for fast refresh. Expect cold-start in ~1s and HMR updates in <100ms.

---

## Pages & Routes

| Route           | Page         | Description                                 |
| --------------- | ------------ | ------------------------------------------- |
| `/`             | Home         | Who's That Pokémon? silhouette quiz         |
| `/pokedex`      | Pokédex      | Full browseable database with filters       |
| `/pokemon/[id]` | Detail       | Individual Pokémon stats, moves, evolutions |
| `/compare`      | Compare      | Side-by-side stat and type comparison       |
| `/teams`        | Team Builder | Build a 6-Pokémon team with coverage chart  |
| `/about`        | About        | Project details and creator info            |

---

## Key Design Decisions

### Why PostgreSQL over PokéAPI for every request?

PokéAPI is excellent but rate-limited and not optimised for multi-field queries (e.g., "find all Gen 3 Dragon-types that are Legendary"). Seeding all data into our own database means:

- **No rate limiting** — queries are instant
- **Complex filtering** — multi-column WHERE clauses in a single roundtrip
- **Warm cache** — TanStack Query caches results in memory; repeat views are ~0.1ms
- **Offline capability** — the app can function without an external API after seeding

### Why TanStack Query?

TanStack Query (`@tanstack/react-query`) handles:

- **Stale-while-revalidate** — shows cached data immediately, fetches fresh data in the background
- **Deduplication** — multiple components requesting the same Pokémon share one in-flight request
- **Error and loading states** — built-in without manual state management
- **Prefetching** — hover a Pokémon card and prefetch its detail page before click

### Why Server Components + Client Components together?

Next.js 16 App Router lets us mix both patterns optimally:

- **Server Components** render the page shell, metadata, and SEO content with zero JS
- **Client Components** handle interactive features (search, filters, game logic) with `'use client'`
- This gives the best lighthouse scores without sacrificing interactivity

### Tailwind CSS v4

The project uses **Tailwind CSS v4**, which is CSS-variable-first. Design tokens are defined as CSS custom properties in `globals.css` rather than `tailwind.config.js`. This enables runtime theming and more predictable specificity.

---

## Performance

| Metric                           | Value          |
| -------------------------------- | -------------- |
| Database entries                 | 1,025 Pokémon  |
| API cold start (first query)     | ~45ms          |
| API warm (TanStack cache hit)    | ~0.1ms         |
| Lighthouse Performance (Desktop) | 97+            |
| Lighthouse Accessibility         | 95+            |
| Bundle size (first load JS)      | ~110kB gzipped |

Sprites are loaded from `raw.githubusercontent.com` (PokeAPI's sprite CDN) via Next.js Image Optimization with the `remotePatterns` allow-list in `next.config.ts`.

---

## Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set the following environment variables in your Vercel project dashboard:

```
DATABASE_URL=...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=...
```

### Other platforms

The app is a standard Next.js application and can be deployed anywhere that supports Node.js 20+:

- **Railway** — connect your Neon DB URL, push to deploy
- **Render** — set env vars, auto-deploys from GitHub
- **Self-hosted** — `npm run build && npm start` on any VPS

---

## Author

**Jainam Khara** — Full-Stack Developer

- 🌐 Portfolio: [jainamkhara.app](https://jainamkhara.app)
- 💼 LinkedIn: [linkedin.com/in/jainamkhara](https://linkedin.com/in/jainamkhara)
- 🐙 GitHub: [github.com/JainamKhara](https://github.com/JainamKhara)

---

## Acknowledgements

- [PokéAPI](https://pokeapi.co) — the open-source Pokémon data REST API that powers the seed
- [Bulbapedia](https://bulbapedia.bulbagarden.net) — reference for game mechanics
- Nintendo / Game Freak — Pokémon IP owners. This is a fan project and is not affiliated with or endorsed by The Pokémon Company.

---

<div align="center">
<sub>Built with ❤️ and too many late nights by Jainam Khara</sub>
</div>
