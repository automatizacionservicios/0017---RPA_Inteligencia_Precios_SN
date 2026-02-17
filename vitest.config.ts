import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'reports/coverage',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
      include: ['src/core/**', 'src/components/ui/PriceTag.tsx'],
    },
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'https://deno.land/std@0.168.0/http/server.ts': path.resolve(
        __dirname,
        './tests/mocks/deno-server.ts'
      ),
      'https://esm.sh/cheerio@1.0.0-rc.12': 'cheerio',
    },
  },
});
