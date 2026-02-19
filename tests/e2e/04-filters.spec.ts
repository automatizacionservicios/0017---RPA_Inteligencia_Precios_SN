/**
 * TEST 04: Refinamiento Inteligente (Filtros)
 * RESUMEN: Prueba la capacidad de filtrar resultados por tienda y rango de precios, 
 * asegurando que la tabla de resultados refleje correctamente los criterios del usuario.
 * 
 * EJECUCIÓN: npx playwright test tests/e2e/04-filters.spec.ts
 */
import { test, expect } from '@playwright/test';

test.describe('Result Filtering', () => {
  test('User can filter results by store and price range', async ({ page }) => {
    await page.goto('/');

    // 1. Realizar una búsqueda desde el Home
    const searchInput = page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i);
    await searchInput.fill('Arroz Diana');
    await page.getByRole('button', { name: /^Buscar$/i }).click();

    // 2. Esperar a que el modal se abra automáticamente
    const filtersHeader = page.getByText(/Herramientas de Filtrado/i);

    // El autotrigger puede tardar dependiendo de la red/scraper
    await expect(filtersHeader).toBeVisible({ timeout: 60000 });

    // 3. Capturar estado inicial
    const initialRows = page.locator('table tbody tr');
    const initialCount = await initialRows.count();
    expect(initialCount).toBeGreaterThan(0);

    // 4. FILTRO DE TIENDA
    // Localizamos la sección de canales
    const channelsSection = page.locator('div').filter({ hasText: /^Canales \/ Tiendas/i }).first();
    const firstStoreItem = channelsSection.locator('..').locator('.custom-scrollbar div.cursor-pointer').first();
    const storeNameElement = firstStoreItem.locator('span').first();
    const storeName = await storeNameElement.textContent();

    if (storeName) {
      console.log(`Deseleccionando tienda: ${storeName}`);
      await firstStoreItem.click();
      await page.waitForTimeout(1500);

      const visibleStores = await page.locator('table tbody tr td:first-child').allTextContents();
      const stillVisible = visibleStores.some(s => s.trim().toUpperCase() === storeName.trim().toUpperCase());
      expect(stillVisible).toBeFalsy();
    }

    // 5. FILTRO DE PRECIO
    // Activar inputs de precisión (específicamente en la sección de Rango de Inversión)
    const investmentSection = page.locator('div').filter({ hasText: /^Rango de Inversión$/i }).first();
    const precisionBtn = investmentSection.locator('..').getByRole('button', { name: /ajuste preciso/i });
    await precisionBtn.click();

    // Llenar precio mínimo (ej: 5000)
    const minPriceInput = page.locator('#min-price');
    await minPriceInput.fill('5000');
    await page.keyboard.press('Tab');

    await page.waitForTimeout(2000);

    // Verificar precios visibles
    const allPrices = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
    for (const priceText of allPrices) {
      if (priceText.includes('$')) {
        const price = parseInt(priceText.replace(/\D/g, ''));
        if (!isNaN(price) && price > 0) {
          expect(price).toBeGreaterThanOrEqual(5000);
        }
      }
    }

    console.log('Test 04 completado exitosamente.');
  });
});
