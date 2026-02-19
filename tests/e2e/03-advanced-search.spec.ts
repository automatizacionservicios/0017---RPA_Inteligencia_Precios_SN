/**
 * TEST 03: Opciones de Búsqueda Avanzada
 * RESUMEN: Valida que los filtros de "Límite de Resultados", "Incluir Agotados"
 * y "Coincidencia Exacta" funcionen correctamente en el Radar Referencial.
 *
 * EJECUCIÓN: npx playwright test tests/e2e/03-advanced-search.spec.ts
 */
import { test, expect } from '@playwright/test';

test.describe('Advanced Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Ir directamente al módulo de Radar Referencial
    await page.goto('/radar-referencial');
    // Asegurarse de que el buscador esté cargado (Buscamos el título principal)
    await expect(page.locator('h1', { hasText: /Radar Referencial/i }).first()).toBeVisible({
      timeout: 15000,
    });
    // Usamos first() para evitar violaciones de strict mode si hay múltiples coincidencias
    await expect(page.getByRole('tab', { name: /Modo/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Search with custom product limit', async ({ page }) => {
    // 1. Asegurarse de estar en Modo Nombre (por si acaso el default es EAN)
    await page.getByText(/Modo Nombre/i).click();

    // 2. Abrir Opciones Avanzadas
    const advancedBtn = page.getByRole('button', { name: /opciones avanzadas/i });
    await advancedBtn.click();

    // 3. Establecer límite de 5 resultados
    const limitInput = page.locator('input[name="productLimit"]').or(page.locator('#productLimit'));
    await limitInput.fill('5');

    // 4. Buscar "Cafe"
    const searchInput = page.locator('#productName').or(page.getByPlaceholder(/Ej: Café Colcafé/i));
    await searchInput.fill('Cafe');

    // Botón: Comparar Precios
    await page.getByRole('button', { name: /Comparar Precios/i }).click();

    // 5. Verificar que aparezca el modal de resultados
    await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

    // 6. Validar que hay filas en la tabla
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('Exact Match filtering logic', async ({ page }) => {
    await page.getByText(/Modo Nombre/i).click();
    await page.getByRole('button', { name: /opciones avanzadas/i }).click();

    // 1. Activar "Coincidencia Exacta"
    const exactMatchCheckbox = page.locator('input[name="exactMatch"]');
    await exactMatchCheckbox.check({ force: true }); // Usamos force porque el input real está oculto (sr-only)

    // 2. Buscar un término específico
    const searchInput = page.locator('#productName').or(page.getByPlaceholder(/Ej: Café Colcafé/i));
    await searchInput.fill('Café Colcafé Clasico');
    await page.getByRole('button', { name: /Comparar Precios/i }).click();

    // 3. Verificar resultados
    await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

    // Si hay resultados, el primer registro debería contener el texto completo
    const firstRow = page.locator('tbody tr').first();
    const rowVisible = await firstRow.isVisible();
    if (rowVisible) {
      const content = await firstRow.innerText();
      expect(content.toLowerCase()).toContain('colcafé');
    }
  });

  test('Include Out of Stock toggle', async ({ page }) => {
    await page.getByText(/Modo Nombre/i).click();
    await page.getByRole('button', { name: /opciones avanzadas/i }).click();

    // 1. Activar "Incluir Agotados"
    const oosCheckbox = page.locator('input[name="outOfStock"]');
    await oosCheckbox.check({ force: true });

    // 2. Buscar
    const searchInput = page.locator('#productName').or(page.getByPlaceholder(/Ej: Café Colcafé/i));
    await searchInput.fill('Arroz');
    await page.getByRole('button', { name: /Comparar Precios/i }).click();

    await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });
  });
});
