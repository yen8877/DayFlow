# DayFlow

DayFlow is an execution-focused productivity platform that combines task management, scheduling, and time blocking to help users turn plans into action.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Data fetching:** TanStack Query
- **Calendar:** FullCalendar
- **Drag & drop:** dnd-kit
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/              # Next.js App Router pages & layouts
├── components/       # UI components (calendar, tasks, shadcn/ui)
├── hooks/            # TanStack Query hooks
├── lib/              # Supabase clients & utilities
├── providers/        # React context providers
└── types/            # TypeScript types (database schema)
supabase/
└── migrations/       # PostgreSQL migrations
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Add your Supabase project URL and anon key from the [Supabase Dashboard](https://supabase.com/dashboard).

### 3. Run database migrations

Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Or run the SQL in `supabase/migrations/` directly in the Supabase SQL editor.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
4. Deploy.

Vercel auto-detects Next.js — no extra configuration required.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run start`   | Start production server  |
| `npm run lint`    | Run ESLint               |
| `npm run typecheck` | Run TypeScript check   |
