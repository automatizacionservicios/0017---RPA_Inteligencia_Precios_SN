/**
 * TEST 00: Demostración de Funcionalidades SN v2.0
 * RESUMEN: Suite personalizada para demostración rápida que valida la eliminación de ciudades,
 * búsqueda por nombre con escudo de timeout y auditoría Pareto (masivos) desde el Home.
 * 
 * EJECUCIÓN: npx playwright test tests/e2e/00-demo-presentation.spec.ts
 */
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

  test('Flujo: Auditoría Masiva (Pareto) - Demostración Real', async ({ page }) => {
    console.warn('[TEST] Iniciando flujo de Auditoría Masiva (Pareto)...');

    // 1. Ir a Home
    await page.goto('/');

    // 2. Presionar en el botón de Carga Pareto (Hero)
    const paretoHeroBtn = page.getByRole('button', { name: /carga pareto/i }).first();
    await paretoHeroBtn.click();

    // 3. Verificar que entramos al módulo Pareto
    // El título "Carga Masiva (Pareto)" debe ser visible
    await expect(page.getByText(/Carga Masiva \(Pareto\)/i)).toBeVisible({ timeout: 15000 });
    console.warn('[TEST] Módulo Pareto cargado.');

    // 4. Localizar el área de pegado manual y el recuadro "Pegado Manual"
    const pasteArea = page.getByPlaceholder(/Copia aquí tus datos de Excel.../i);
    await expect(pasteArea).toBeVisible();

    // 5. Pegar datos (Formato: Nombre\tKeywords\tEAN\tPrecio)
    // Cargamos un producto conocido para la demo
    const pasteData = 'Café Colcafé Clásico 170g\tCafé,Colcafé\t7702004000302\t15000';
    console.warn('[TEST] Cargando datos en el área de pegado manual...');
    await pasteArea.fill(pasteData);

    // 6. Esperar a que se procesen y aparezca el botón AUDITAR habilitado
    // Al llenar el textarea se dispara el handlePaste que pobla la lista
    const auditBtn = page.getByRole('button', { name: /AUDITAR/i });
    await expect(auditBtn).toBeEnabled({ timeout: 10000 });
    console.warn('[TEST] Datos procesados e items cargados. Botón AUDITAR habilitado.');

    // 7. Ejecutar Auditoría
    await auditBtn.click();
    console.warn('[TEST] Ejecución de auditoría iniciada...');

    // 8. Esperar a que aparezca el estado de progreso
    await expect(page.getByText(/Auditoría Masiva en Curso/i)).toBeVisible({ timeout: 15000 });

    // 9. Esperar resultados finales (Tabla de resultados)
    console.warn('[TEST] Esperando que finalice la recolección de precios...');
    const resultsTable = page.locator('table');
    await expect(resultsTable).toBeVisible({ timeout: 60000 });

    const firstResult = resultsTable.locator('tbody tr').first();
    await expect(firstResult).toBeVisible();

    console.warn('[SUCCESS] Flujo de Auditoría Masiva completado con éxito.');
  });
});
