## Codebase Structure

- `src/app/`: Next.js application pages and API routes.
  - `src/app/api/`: Hono API routes.
  - `src/app/[feature]/page.tsx`: Server components for pages.
  - `src/app/[feature]/[Feature]Content.tsx`: Client components for interactive content.
- `src/application/`: Application layer, containing services and ports for business logic.
- `src/components/`: Reusable UI components.
  - `src/components/layout/`: Layout components.
  - `src/components/ui/`: Shadcn/ui components.
- `src/db/`: Database schema and connection.
- `src/domain/`: Domain layer, containing entities and value objects.
- `src/infrastructure/`: Infrastructure layer, containing implementations for repositories and external services.
- `src/lib/`: Utility functions and configurations.
- `src/types/`: TypeScript type definitions.
- `.gemini/`: Gemini AI assistant configuration and notes.
- `drizzle/`: Drizzle ORM migration files.