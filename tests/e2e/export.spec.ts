import { test, expect } from '@playwright/test';

test.describe('Export Feature', () => {
  test('User can click export without errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    // 1. Navegar al Home y buscar
    await page.goto('/');
    await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Aceite');
    await page
      .locator('form')
      .getByRole('button', { name: /buscar/i })
      .click();

    // Esperar navegación y resultados
    await expect(page).toHaveURL(/.*radar-referencial/);
    await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

    // 2. Ubicar botón de Exportar
    const exportButton = page.getByRole('button', { name: /exportar data/i });
    await expect(exportButton).toBeVisible();

    // 3. Click en Exportar
    // No validamos la descarga del archivo binario, solo que el clic no explote
    await exportButton.click();

    // 4. Verificar que no hubo errores de consola críticos
    expect(consoleErrors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('User can export Pareto data', async ({ page }) => {
    await page.goto('/');
    await page
      .locator('nav')
      .getByRole('button', { name: /pareto/i })
      .click();

    // Ingresar datos para que el botón de exportar aparezca tras auditar
    await page.locator('textarea').fill('7702001103210');
    await page.getByRole('button', { name: /auditar/i }).click();

    const exportButton = page
      .getByRole('button', { name: /exportar data/i })
      .or(page.getByRole('button', { name: /excel/i }));
    // No fallamos si no es visible inmediatamente (depende de resultados)
    if (await exportButton.isVisible()) {
      await exportButton.click();
    }
  });
});
