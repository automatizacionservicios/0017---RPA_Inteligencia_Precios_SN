/**
 * TEST 04b: Filtros en Resultados EAN
 * RESUMEN: Valida que los filtros de Canal y Rango de Precio funcionen correctamente
 * sobre los resultados obtenidos específicamente mediante una búsqueda EAN.
 */
import { test, expect } from '@playwright/test';

test('User can filter EAN results by store and price', async ({ page }) => {
  await page.goto('/radar-referencial');

  // 1. Asegurar Modo EAN
  await page.getByText(/Modo EAN/i).click();

  // 2. Realizar búsqueda
  await page.locator('#ean').fill('7701001899923');
  await page.getByRole('button', { name: /Comparar Precios/i }).click();

  // 3. Esperar Modal
  const filtersHeader = page.getByText(/Herramientas de Filtrado/i);
  await expect(filtersHeader).toBeVisible({ timeout: 60000 });

  // 4. Filtrar por Tienda (Deseleccionar la primera disponible en el modal)
  const channelsSection = page
    .locator('div')
    .filter({ hasText: /^Canales \/ Tiendas/i })
    .first();
  const firstStoreItem = channelsSection
    .locator('..')
    .locator('.custom-scrollbar div.cursor-pointer')
    .first();
  const storeName = await firstStoreItem.locator('span').first().textContent();

  if (storeName) {
    console.log(`Deseleccionando tienda en resultados EAN: ${storeName}`);
    await firstStoreItem.click();
    await page.waitForTimeout(1000);

    const visibleStores = await page.locator('table tbody tr td:first-child').allTextContents();
    const stillVisible = visibleStores.some(
      (s) => s.trim().toUpperCase() === storeName.trim().toUpperCase()
    );
    expect(stillVisible).toBeFalsy();
  }

  // 5. Filtrar por Rango de Precio
  const investmentSection = page
    .locator('div')
    .filter({ hasText: /^Rango de Inversión$/i })
    .first();
  await investmentSection
    .locator('..')
    .getByRole('button', { name: /ajuste preciso/i })
    .click();

  await page.locator('#min-price').fill('5000');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);

  const allPrices = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
  for (const priceText of allPrices) {
    const price = parseInt(priceText.replace(/\D/g, ''));
    if (!isNaN(price) && price > 0) {
      expect(price).toBeGreaterThanOrEqual(5000);
    }
  }

  console.log('Test 04b: Filtros EAN completados.');
});
