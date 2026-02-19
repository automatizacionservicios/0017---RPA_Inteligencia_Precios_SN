/**
 * TEST 11: Resiliencia (Sad Paths)
 * RESUMEN: Prueba el manejo de errores del sistema ante entradas inválidas 
 * o búsquedas sin resultados, asegurando un feedback claro al usuario.
 * 
 * EJECUCIÓN: npx playwright test tests/e2e/11-resilience-errors.spec.ts
 */
import { test, expect } from '@playwright/test';

test.describe('Sad Paths & Error Handling', () => {
  test('Shows "No se encontraron resultados" for invalid products', async ({ page }) => {
    await page.goto('/');

    // 1. Buscar un término sin sentido
    const invalidTerm = 'xyz987654321nonexistent';
    await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill(invalidTerm);
    await page
      .locator('form')
      .getByRole('button', { name: /buscar/i })
      .click();

    // 2. Esperar navegación
    await expect(page).toHaveURL(/.*radar-referencial/);

    // 3. Verificar feedback visual de "No resultados"
    // El timeout debe ser suficiente para que fallen los scrapers o el orquestador retorne vacío
    const emptyState = page
      .getByText(/no se encontraron resultados/i)
      .or(page.getByText(/intenta con otros términos/i));
    await expect(emptyState).toBeVisible({ timeout: 60000 });
  });

  test('Handles malformed EAN entries in Pareto', async ({ page }) => {
    await page.goto('/');
    await page
      .locator('nav')
      .getByRole('button', { name: /pareto/i })
      .click();

    // Ingresar un EAN basura
    const textarea = page.getByPlaceholder(/ingresa los códigos EAN/i);
    await textarea.fill('basura123');

    // El botón auditar debería habilitarse solo con números (si hay validación)
    // O si no hay validación, al auditar debería mostrar error de formato
    const auditBtn = page.getByRole('button', { name: /auditar/i });
    await auditBtn.click();

    await expect(
      page.getByText(/formato inválido/i).or(page.getByText(/sin coincidencia/i))
    ).toBeVisible();
  });
});
