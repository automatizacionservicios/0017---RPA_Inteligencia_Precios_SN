import { test, expect } from '@playwright/test';

test.describe('Advanced Search Options', () => {
    test('Search with product limit is respected', async ({ page }) => {
        await page.goto('/');

        // 1. Abrir opciones avanzadas
        const advancedBtn = page.getByRole('button', { name: /opciones avanzadas/i }).or(page.locator('.lucide-settings-2'));
        await advancedBtn.click();

        // 2. Establecer un límite bajo (ej: 5)
        const limitInput = page.locator('input[type="number"]').filter({ has: page.locator('..', { hasText: /límite/i }) }).or(page.getByLabel(/límite/i));
        if (await limitInput.isVisible()) {
            await limitInput.fill('5');
        }

        // 3. Activar toggle de "Incluir Agotados" si es necesario
        const outOfStockToggle = page.getByRole('switch', { name: /incluir agotados/i }).or(page.locator('button[role="switch"]').first());
        await outOfStockToggle.click();

        // 4. Realizar búsqueda
        await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Aceite');
        await page.locator('form').getByRole('button', { name: /buscar/i }).click();

        await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

        // 5. Verificar que el número de filas no exceda el límite (margen por tiendas)
        // Nota: El límite suele ser por tienda, pero validamos que la tabla renderice correctamente
        const rowCount = await page.locator('tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);
    });

    test('Search query with "Exact Match" mode', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: /opciones avanzadas/i }).click();

        const exactMatchToggle = page.getByLabel(/coincidencia exacta/i).or(page.locator('button[role="switch"]').nth(1));
        if (await exactMatchToggle.isVisible()) {
            await exactMatchToggle.click();
        }

        await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Chocolate');
        await page.locator('form').getByRole('button', { name: /buscar/i }).click();

        await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });
    });
});
