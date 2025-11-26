# Project Structure

## Root Configuration

- `vite.config.ts`: Vite configuration with TanStack Start, Cloudflare, and Tailwind plugins
- `tsconfig.json`: TypeScript config with strict mode and path aliases
- `drizzle.config.ts`: Drizzle ORM configuration pointing to PostgreSQL
- `biome.json`: Code formatting and linting rules
- `wrangler.jsonc`: Cloudflare Workers deployment configuration
- `.env.local`: Environment variables (DATABASE_URL, etc.)

## Source Directory (`src/`)

### Core Files

- `router.tsx`: Router instance creation with TanStack Router
- `routeTree.gen.ts`: Auto-generated route tree (do not edit manually)
- `styles.css`: Global styles (excluded from Biome checks)

### Components (`src/components/`)

- Reusable React components
- Example: `Header.tsx` - Navigation header with sidebar menu

### Database (`src/db/`)

- `schema.ts`: Drizzle ORM schema definitions
- `index.ts`: Database connection and client setup

### Routes (`src/routes/`)

- File-based routing structure
- Routes are auto-generated into `routeTree.gen.ts`

### Data (`src/data/`)

- Static data and demo content
- Example: `demo.punk-songs.ts`

## Public Assets (`public/`)

- Static files served directly
- Images, icons, manifest, robots.txt

## Generated/Build Artifacts

- `.tanstack/`: TanStack framework cache
- `.wrangler/`: Cloudflare Workers local state
- `node_modules/`: Dependencies (managed by pnpm)
- `drizzle/`: Generated migration files

## Architecture Patterns

- **File-based routing**: Routes defined in `src/routes/` directory
- **Server functions**: TanStack Start server functions for backend logic
- **Type-safe database**: Drizzle ORM with TypeScript schemas
- **SSR support**: Multiple rendering modes (SPA, Full SSR, Data-only)
- **Component-based**: React components in `src/components/`
