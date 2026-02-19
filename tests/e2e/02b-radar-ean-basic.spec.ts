/**
 * TEST 02b: Búsqueda por EAN desde Home
 * RESUMEN: Verifica que al ingresar un EAN en el Home, el sistema lo detecte,
 * navegue al Radar Referencial y active la búsqueda automática en modo EAN.
 */
import { test, expect } from '@playwright/test';

test('User can search by EAN from Home and reach Radar results', async ({ page }) => {
    await page.goto('/');

    // 1. Ingresar EAN en el buscador del Hero
    const ean = '7701001899923'; // EAN válido (Arroz Diana)
    const searchInput = page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i);
    await searchInput.fill(ean);

    // 2. Hacer clic en "Buscar"
    const searchButton = page.locator('form').getByRole('button', { name: /buscar/i });
    await searchButton.click();

    // 3. Verificar redirección y modo EAN activo
    await expect(page).toHaveURL(/.*radar-referencial/);

    // 4. Validar apertura automática del modal
    const modalTitle = page.getByText(/Radar Referencial v2.0/i);
    await expect(modalTitle).toBeVisible({ timeout: 60000 });

    // 5. Confirmar que hay resultados
    const tableRow = page.locator('table tbody tr').first();
    await expect(tableRow).toBeVisible({ timeout: 20000 });

    console.log('Test 02b: Búsqueda básica por EAN completada.');
});
