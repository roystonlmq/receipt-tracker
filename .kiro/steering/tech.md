# Tech Stack

## Framework & Core Libraries

- **TanStack Start**: Full-stack React framework with SSR support
- **TanStack Router**: File-based routing with type-safe navigation
- **React 19**: UI library
- **Vite**: Build tool and dev server
- **TypeScript**: Strict mode enabled with ES2022 target

## Database & ORM

- **Drizzle ORM**: Type-safe database interactions
- **PostgreSQL**: Primary database
- Database schema located in `src/db/schema.ts`

## Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **Lucide React**: Icon library

## Code Quality

- **Biome**: Formatter and linter (replaces ESLint/Prettier)
  - Tab indentation
  - Double quotes for JavaScript/TypeScript
  - Excludes: `src/routeTree.gen.ts`, `src/styles.css`

## Deployment

- **Cloudflare Workers**: Deployment target via Wrangler
- Node.js compatibility enabled

## Package Manager

- **pnpm**: Required for all dependency management

## Common Commands

```bash
# Development
pnpm dev              # Start dev server on port 3000
pnpm build            # Production build
pnpm serve            # Preview production build

# Testing
pnpm test             # Run tests with Vitest

# Code Quality
pnpm format           # Format code with Biome
pnpm lint             # Lint code with Biome
pnpm check            # Run both format and lint checks

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes
pnpm db:pull          # Pull schema from database
pnpm db:studio        # Open Drizzle Studio

# Deployment
pnpm deploy           # Deploy to Cloudflare Workers
```

## Path Aliases

- `@/*` maps to `./src/*` for cleaner imports
