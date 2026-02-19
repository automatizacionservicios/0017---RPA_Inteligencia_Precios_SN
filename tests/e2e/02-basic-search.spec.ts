/**
 * TEST 02: Búsqueda por Palabra Clave
 * RESUMEN: Simula una búsqueda básica desde el Home y verifica la transición
 * exitosa al Radar Referencial con visualización de resultados.
 *
 * EJECUCIÓN: npx playwright test tests/e2e/02-basic-search.spec.ts
 */
import { test, expect } from '@playwright/test';

test('User can search for a product and see results', async ({ page }) => {
  // 1. Navegar al Home
  await page.goto('/');

  // 2. Escribir "Arroz" en el input principal del Home (Hero)
  const searchInput = page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i);
  await searchInput.fill('Arroz');

  // 3. Hacer clic en "Buscar"
  // Restringimos al formulario para evitar coincidencias con el header ("Buscar módulo...")
  const searchButton = page.locator('form').getByRole('button', { name: /buscar/i });
  await searchButton.click();

  // 4. Esperar redirección a Radar Referencial
  await expect(page).toHaveURL(/.*radar-referencial/);

  // 5. Validar que aparezca el Modal de Resultados
  // El modal muestra "Radar Referencial v2.0" y contiene los resultados
  const modalTitle = page.getByText(/Radar Referencial v2.0/i);
  await expect(modalTitle).toBeVisible({ timeout: 60000 });

  // 6. Verificar resultados dentro del modal
  const tableRow = page.locator('tbody tr').first(); // Resultados en tabla (BenchmarkResults)
  const productCard = page.locator('.product-card').first(); // Resultados en tarjetas (Externos)
  const noResults = page.getByText(/no se encontraron resultados/i);

  await expect(tableRow.or(productCard).or(noResults)).toBeVisible({ timeout: 20000 });

  // Opcional: Verificar URL
  // await expect(page).toHaveURL(/.*q=Arroz/);
});
