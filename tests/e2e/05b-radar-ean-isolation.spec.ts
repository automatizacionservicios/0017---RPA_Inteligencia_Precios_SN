import { test, expect, type Locator } from '@playwright/test';

test('User can isolate EAN results by specific store URLs', async ({ page }) => {
  await page.goto('/radar-referencial');

  async function testEanIsolation(storeId: string, storeDomain: string, isFirst: boolean) {
    console.log(
      `\n--- Probando aislamiento EAN para: ${storeId} (Patrón esperado: ${storeDomain}) ---`
    );

    if (!isFirst) {
      console.log('Refinando búsqueda para el siguiente canal...');
      const refineBtn = page.getByRole('button', { name: /Refinar Búsqueda/i });
      await refineBtn.click();
      await page.waitForTimeout(1000);
    }

    // 1. Asegurar Modo EAN
    const eanTab = page.getByRole('tab', { name: /Modo EAN/i });
    await eanTab.click();
    await page.waitForTimeout(800);

    // Usamos un EAN universal (proporcionado por el usuario)
    const eanInput = page.locator('#ean');
    await eanInput.fill('7441163412430');

    // 2. Manejar Selección de Tiendas (Aislamiento Directo)
    const exitoBtn = page.locator('button#exito');
    const targetStoreBtn = page.locator(`button#${storeId}`);

    // Desmarcar Éxito si no es nuestro target y está marcado
    if (storeId !== 'exito') {
      const isExitoChecked = (await exitoBtn.getAttribute('data-state')) === 'checked';
      if (isExitoChecked) {
        console.log('Deseleccionando Éxito...');
        await exitoBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // Marcar la tienda objetivo si no lo está
    if ((await targetStoreBtn.getAttribute('data-state')) !== 'checked') {
      await targetStoreBtn.click();
      await page.waitForTimeout(500);
    }

    await expect(targetStoreBtn).toHaveAttribute('data-state', 'checked');

    // 3. Buscar
    console.log(`Iniciando búsqueda EAN para ${storeId}...`);
    const searchBtn = page.getByRole('button', { name: /Comparar Precios/i });
    await searchBtn.click();

    // 4. Verificar Resultados
    const modalTitle = page.getByText(/Radar Referencial v2.0/i);
    await expect(modalTitle).toBeVisible({ timeout: 60000 });

    // Buscamos la fila que corresponde a la tienda objetivo
    // El nombre en la tabla está en mayúsculas y puede tener acentos (ej: "ÉXITO")
    const displayNames: Record<string, string> = {
      exito: 'ÉXITO',
      jumbo: 'JUMBO',
      carulla: 'CARULLA',
      olimpica: 'OLÍMPICA',
    };
    const targetName = displayNames[storeId] || storeId.toUpperCase();
    console.log(`Buscando fila para la tienda: ${targetName}`);

    const storeRow = page.locator('tr').filter({ hasText: targetName }).first();
    await expect(storeRow).toBeVisible({ timeout: 30000 });

    const productLink = storeRow.getByLabel(/ver producto/i);
    // @ts-expect-error - custom matcher
    await expect(productLink).toBeBufferedVisible(15000);

    const href = await productLink.getAttribute('href');
    const hrefLower = href?.toLowerCase() || '';
    const domainLower = storeDomain.toLowerCase();

    console.log(`URL detectada para ${storeId}: ${hrefLower}`);
    console.log(`Validando que contenga: "${domainLower}"`);

    expect(hrefLower).toContain(domainLower);
    console.log(`✅ Certificado EAN: ${storeId} -> ${storeDomain}`);

    // 5. Cerrar
    console.log('Cerrando modal...');
    const closeModalBtn = page.getByRole('button', { name: 'Close' });
    await closeModalBtn.click();
    await expect(modalTitle).not.toBeVisible({ timeout: 15000 });
  }

  // Iteración 1: Éxito
  await testEanIsolation('exito', 'exito.com', true);

  // Iteración 2: Jumbo
  await testEanIsolation('jumbo', 'jumbo', false);

  console.log('TEST 05b: Aislamiento EAN completado exitosamente.');
});

// Helper expect extendido
expect.extend({
  async toBeBufferedVisible(locator: Locator, timeout: number) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return { pass: true, message: () => 'Element is visible' };
    } catch {
      return { pass: false, message: () => `Element not visible after ${timeout}ms` };
    }
  },
});
