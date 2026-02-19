/**
 * TEST 01: Bases y Navegación
 * RESUMEN: Valida que la aplicación carga correctamente y permite la navegación
 * fluida entre los módulos principales (Benchmark, Radar, Pareto, Stock).
 *
 * EJECUCIÓN: npx playwright test tests/e2e/01-navigation.spec.ts
 */
import { test, expect } from '@playwright/test';

test('User can navigate between main views', async ({ page }) => {
  await page.goto('/');

  // Navegar a Radar (Radar Referencial)
  await page.locator('nav').getByRole('button', { name: /radar/i }).click();
  await expect(page).toHaveURL(/.*radar-referencial/);

  // Navegar a Pareto
  await page
    .locator('nav')
    .getByRole('button', { name: /pareto/i })
    .click();
  await expect(page).toHaveURL(/.*benchmark/); // Pareto es un modo de benchmark

  // Navegar a Stock (en lugar de Chat)
  await page.locator('nav').getByRole('button', { name: /stock/i }).click();
  await expect(page).toHaveURL(/.*auditoria-stock/);
});
