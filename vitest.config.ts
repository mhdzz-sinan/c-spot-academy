// ============================================================================
// C-Spot Academy — Vitest Test Runner Configuration
// Resolves `@/*` TypeScript path aliases to `./src/*` during test execution
// File: vitest.config.ts
// ============================================================================

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
