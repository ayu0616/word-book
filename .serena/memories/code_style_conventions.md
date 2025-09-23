## Code Style and Conventions

- **Formatting:** Biome is used for formatting. Indent style is `space` with an `indentWidth` of `2`.
- **Linting:** Biome is enabled with recommended rules for general, Next.js, and React domains. `noUnknownAtRules` is turned off.
- **Imports:** Imports are organized on save.
- **File Naming:** (Inferred from file structure) `page.tsx` for server components, `*Content.tsx` for client components.
- **Architecture:** (Inferred from file structure and `GEMINI.md`) Pages are server components responsible for data fetching and layout. Content components are client components handling user interaction.