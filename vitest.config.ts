import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
// Standalone Vitest config. Independent of the Next.js build (`next build` does
// not read this file), so wiring it up cannot affect the production build.
// Vitest handles TypeScript + ESM out of the box.
export default defineConfig({
  // Resolve the `@/*` path alias (see tsconfig.json) so tests can import modules
  // by the same specifier the app uses (e.g. `@/auth`). This mirrors the alias
  // rather than changing it, so the Next build is unaffected.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // Test files arrive in later tasks; do not fail the run when none exist yet.
    passWithNoTests: true,
    // Pick up test files anywhere in the repo, including the pure helpers under
    // app/admin/travel-planner/. Test files are added in later tasks.
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
  },
});
