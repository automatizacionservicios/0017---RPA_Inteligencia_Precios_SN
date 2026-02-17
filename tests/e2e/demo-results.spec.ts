import { test, expect } from '@playwright/test';

test.describe('Demostración de Funcionalidades SN v2.0', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página principal
    await page.goto('/');
  });

  test('Validar que no existe selector de ciudad (Regionalización eliminada)', async ({ page }) => {
    console.warn('[TEST] Verificando ausencia de selector de ciudad en el Header...');

    // El header antes tenía un dropdown de ciudad. Ya no debería existir.
    const citySelector = page.locator('select').filter({ hasText: /Bogotá|Medellín/i });
    await expect(citySelector).not.toBeVisible();

    console.warn('[SUCCESS] Confirmado: Selector de ciudad removido del Header.');
  });

  test('Flujo: Búsqueda por Nombre (Optimizado)', async ({ page }) => {
    console.warn('[TEST] Iniciando búsqueda por nombre: "Aceite"...');

    const searchInput = page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i);
    await searchInput.fill('Aceite');

    const searchButton = page.locator('form').getByRole('button', { name: /buscar/i });
    await searchButton.click();

    await expect(page).toHaveURL(/.*radar-referencial/);

    // Esperar resultados
    console.warn('[TEST] Esperando resultados del Radar (Timeout 15s/tienda activo)...');
    const resultsModal = page.getByText(/Radar Referencial v2.0/i);
    await expect(resultsModal).toBeVisible({ timeout: 45000 });

    const firstResult = page.locator('tbody tr').first();
    await expect(firstResult).toBeVisible();

    console.warn('[SUCCESS] Búsqueda por nombre completada exitosamente.');
  });

  test('Flujo: Búsqueda por EAN (Sin Timeout restrictivo)', async ({ page }) => {
    console.warn('[TEST] Iniciando búsqueda por EAN: 7701101359587...');

    // Ir a Benchmark
    await page.goto('/benchmark');

    // Asegurar que estamos en la pestaña "Localizador EAN" (que contiene el TabsList con Modo EAN)
    // El BenchmarkSearch usa Radix Tabs
    const eanTab = page.getByRole('tab', { name: /Modo EAN/i });
    await eanTab.click();
    console.warn('[TEST] Pestaña Modo EAN seleccionada.');

    // Buscar el input de búsqueda por ID
    const benchmarkInput = page.locator('#ean');
    await benchmarkInput.fill('7701101359587');

    // El switch de exactMatch está en la sección de opciones
    const exactMatchLabel = page.getByText(/Coincidencia Exacta/i);
    if (await exactMatchLabel.isVisible()) {
      await exactMatchLabel.click();
      console.warn('[TEST] Coincidencia Exacta activada.');
    }

    const searchButton = page.getByRole('button', { name: /buscar/i }).first();
    await searchButton.click();

    console.warn('[TEST] Esperando resultados EAN (Permitencia de 50s habilitada en Backend)...');

    // Esperar a que la tabla de resultados aparezca
    // En Benchmark se usa una tabla para los resultados
    const resultRow = page.locator('tbody tr').first();
    await expect(resultRow).toBeVisible({ timeout: 60000 });

    console.warn('[SUCCESS] Búsqueda por EAN validada con éxito.');
  });
});
