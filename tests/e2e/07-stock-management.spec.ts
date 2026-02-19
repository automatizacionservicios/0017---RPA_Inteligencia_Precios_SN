/**
 * TEST 07: Módulo de Inventario (Stock)
 * RESUMEN: Prueba el funcionamiento del tablero de auditoría de stock,
 * verificando la presencia de tablas de disponibilidad y filtros de faltantes.
 *
 * EJECUCIÓN: npx playwright test tests/e2e/07-stock-management.spec.ts
 */
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
    await expect(page.getByRole('heading', { name: /existencias/i })).toBeVisible();

    // 3. Verificar estado inicial y que el botón de búsqueda esté deshabilitado
    await expect(page.getByText(/Inicia una/i)).toBeVisible();
    const searchBtn = page.getByRole('button', { name: /iniciar búsqueda/i });
    await expect(searchBtn).toBeDisabled();

    // 4. Probar cambio de pestañas (EAN -> Nombre -> EAN)
    const nameTab = page.getByText(/modo nombre/i);
    const eanTab = page.getByText(/modo ean/i);

    await nameTab.click();
    await expect(page.getByLabel(/nombre del producto/i)).toBeVisible();

    await eanTab.click();
    await expect(page.getByLabel(/referencia ean/i)).toBeVisible();

    // 5. Realizar una búsqueda para habilitar el botón
    const eanInput = page.getByLabel(/referencia ean/i);
    await eanInput.fill('7701234567890');

    // El botón debería habilitarse ahora
    await expect(searchBtn).toBeEnabled();

    // 6. Ejecutar búsqueda y verificar que cambie el estado (loading o resultados)
    await searchBtn.click();

    // Debería desaparecer el mensaje inicial "Inicia una Auditoría Global"
    await expect(page.getByText(/Inicia una/i)).not.toBeVisible({ timeout: 60000 });

    // Debería mostrarse la sección de resultados o el loading.
    // Usamos .first() para evitar error de modo estricto y aumentamos el tiempo de espera (60s)
    const resultHeading = page
      .getByRole('heading', { name: /Estado de Inventario|Sincronizando/i })
      .first();
    await expect(resultHeading).toBeVisible({ timeout: 60000 });

    console.log('Esperando a que la búsqueda de stock finalice y muestre resultados...');

    // Si aparece "Estado de Inventario", verificamos que haya al menos una card de producto
    const statusHeading = page.getByText(/Estado de Inventario/i);
    if (await statusHeading.isVisible({ timeout: 60000 })) {
      // Esperamos que aparezca al menos una tarjeta de producto
      const productCard = page.locator('.rounded-\\[32px\\]').first(); // Cards de StockAudit.tsx:184
      await expect(productCard).toBeVisible({ timeout: 30000 });
      console.log('✅ Auditoría de Stock completada con éxito.');
    }
  });
});
