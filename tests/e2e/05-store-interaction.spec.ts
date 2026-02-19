/**
 * TEST 05: Comparativa en Tiempo Real (Aislamiento Funcional)
 * RESUMEN: Verifica que la selección de una tienda única restringe los resultados.
 * Sigue el flujo manual: Buscar -> Cerrar Modal -> Refinar Búsqueda -> Cambiar Tienda -> Buscar.
 * 
 * EJECUCIÓN: npx playwright test tests/e2e/05-store-interaction.spec.ts
 */
import { test, expect } from '@playwright/test';

test('User can search and isolate results by specific store URLs following the manual refine flow', async ({ page }) => {
  await page.goto('/radar-referencial');

  // Helper para realizar la primera búsqueda o refinarla
  async function performStoreSearch(storeId: string, storeDomain: string, isFirstSearch: boolean) {
    console.log(`\n--- Probando aislamiento para tienda: ${storeId} (Dominio: ${storeDomain}) ---`);

    if (!isFirstSearch) {
      console.log('Haciendo clic en "Refinar Búsqueda" para volver al formulario...');
      const refineBtn = page.getByRole('button', { name: /Refinar Búsqueda/i });
      await refineBtn.click();
      await page.waitForTimeout(500);
    }

    // 1. Asegurar que el input de búsqueda no esté vacío (habilita el botón)
    const productNameInput = page.locator('#productName');
    await productNameInput.fill('Cafe');
    console.log('Input de búsqueda llenado: Cafe');

    // 2. Manejar selección de tienda
    if (isFirstSearch) {
      // En la primera búsqueda, resetear y seleccionar
      const toggleAllBtn = page.getByRole('button', { name: /Alternar Selección/i });
      const exitoBtn = page.locator('button#exito');
      const isExitoChecked = await exitoBtn.getAttribute('data-state') === 'checked';

      if (isExitoChecked) {
        console.log('Resetting selection to start clean...');
        await toggleAllBtn.click();
        await page.waitForTimeout(500);
      }

      const targetStoreBtn = page.locator(`button#${storeId}`);
      await targetStoreBtn.click();
      await expect(targetStoreBtn).toHaveAttribute('data-state', 'checked');
    } else {
      // En refinamiento, desmarcar la anterior (éxito) y marcar la nueva
      console.log('Cambiando selección de tienda...');
      const exitoBtn = page.locator('button#exito');
      const targetStoreBtn = page.locator(`button#${storeId}`);

      if (await exitoBtn.getAttribute('data-state') === 'checked') {
        await exitoBtn.click();
      }

      if (await targetStoreBtn.getAttribute('data-state') !== 'checked') {
        await targetStoreBtn.click();
      }

      await expect(targetStoreBtn).toHaveAttribute('data-state', 'checked');
      await expect(exitoBtn).toHaveAttribute('data-state', 'unchecked');
    }

    // 3. Iniciar Búsqueda
    const searchBtn = page.locator('button.group\\/btn');
    await expect(searchBtn).toBeEnabled();
    console.log('Starting search...');
    await searchBtn.click();

    // 4. Esperar apertura automática del modal
    const modalTitle = page.getByText(/Radar Referencial v2.0/i);
    await expect(modalTitle).toBeVisible({ timeout: 60000 });

    // 5. Verificar primer resultado en la columna 6 (Enlace)
    const firstLink = page.locator('table tbody tr td:nth-child(6) a').first();
    await expect(firstLink).toBeBufferedVisible(30000); // Helper personalizado o simplemente visible

    const href = await firstLink.getAttribute('href');
    console.log(`URL detectada: ${href}`);

    // Certificar el dominio
    expect(href).toContain(storeDomain);
    console.log(`✅ Certificado: La búsqueda para ${storeId} produce resultados de ${storeDomain}`);

    // 6. Cerrar modal (clic en la X)
    console.log('Closing modal (Clicking X)...');
    const closeModalBtn = page.getByRole('button', { name: 'Close' });
    await closeModalBtn.click();
    await expect(modalTitle).not.toBeVisible({ timeout: 15000 });

    console.log(`=== CICLO PARA ${storeId} COMPLETADO ===\n`);
  }

  // Extensión para timeout de visibilidad más robusto
  test.slow();

  // Iteración 1: Éxito
  await performStoreSearch('exito', 'exito.com', true);

  // Iteración 2: Jumbo (siguiendo el flujo de refinamiento)
  await performStoreSearch('jumbo', 'jumbo', false);

  console.log('TEST 05: Aislamiento funcional validado siguiendo el flujo manual de refinamiento.');
});

// Helper simple para esperar visibilidad sin fallar prematuramente si el DOM está cargando
async function isBufferedVisible(locator, timeout) {
  try {
    await locator.waitFor({ state: 'visible', timeout });
    return true;
  } catch (e) {
    return false;
  }
}
// Aplicamos el helper directamente en el test con expect
expect.extend({
  async toBeBufferedVisible(locator, timeout) {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return { pass: true, message: () => 'Element is visible' };
    } catch (e) {
      return { pass: false, message: () => `Element not visible after ${timeout}ms` };
    }
  }
});
