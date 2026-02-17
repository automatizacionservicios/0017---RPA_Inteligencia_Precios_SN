import { test, expect } from '@playwright/test';

test.describe('Stock Audit Module', () => {
  test('User can navigate to Stock and see audit table', async ({ page }) => {
    await page.goto('/');

    // 1. Navegar a Stock (Auditoria de Stock)
    const stockBtn = page.locator('nav').getByRole('button', { name: /stock/i });
    await expect(stockBtn).toBeVisible();
    await stockBtn.click();

    // 2. Verificar URL y Título de Sección
    await expect(page).toHaveURL(/.*auditoria-stock/);
    await expect(page.getByText(/auditoría de disponibilidad y stock/i)).toBeVisible();

    // 3. Verificar que la tabla esté presente
    const stockTable = page.locator('table');
    await expect(stockTable).toBeVisible();

    // 4. Verificar presencia de cabeceras críticas
    await expect(stockTable.getByText(/producto/i)).toBeVisible();
    await expect(stockTable.getByText(/tienda/i)).toBeVisible();
    await expect(stockTable.getByText(/disponibilidad/i)).toBeVisible();

    // 5. Verificar filtros de stock (si existen)
    const outletToggle = page.getByLabel(/solo faltantes/i).or(page.getByText(/solo faltantes/i));
    if (await outletToggle.isVisible()) {
      await expect(outletToggle).toBeVisible();
    }
  });
});
