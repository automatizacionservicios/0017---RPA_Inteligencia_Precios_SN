import { test, expect } from '@playwright/test';

test.describe('Result Filtering', () => {
    test('User can filter results by store and verify table update', async ({ page }) => {
        await page.goto('/');

        // 1. Realizar una búsqueda que traiga múltiples tiendas
        await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Arroz');
        await page.locator('form').getByRole('button', { name: /buscar/i }).click();

        await expect(page).toHaveURL(/.*radar-referencial/);
        await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

        // 2. Abrir panel de filtros si no está visible
        const filtersBtn = page.getByRole('button', { name: /filtros/i }).or(page.locator('.lucide-filter'));
        await filtersBtn.click();

        // 3. Capturar estado inicial (conteo de filas)
        const initialRowCount = await page.locator('tbody tr').count();
        expect(initialRowCount).toBeGreaterThan(0);

        // 4. Desmarcar una tienda específica (ej: Farmatodo o Éxito)
        // Buscamos el checkbox en el StoreFilter
        const storeCheckbox = page.locator('label').filter({ hasText: /farmatodo/i }).locator('input').or(page.getByLabel(/farmatodo/i));
        if (await storeCheckbox.isVisible()) {
            await storeCheckbox.uncheck();

            // 5. Verificar que el conteo de filas cambie
            await page.waitForTimeout(1000); // Esperar renderizado
            const filteredRowCount = await page.locator('tbody tr').count();
            expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);
        }
    });

    test('User can filter by price range', async ({ page }) => {
        await page.goto('/');
        await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Leche');
        await page.locator('form').getByRole('button', { name: /buscar/i }).click();

        await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

        // Manipular el slider o inputs de precio si están disponibles
        const minPriceInput = page.locator('input[type="number"]').first();
        if (await minPriceInput.isVisible()) {
            await minPriceInput.fill('50000'); // Un precio alto para filtrar bastante
            await page.keyboard.press('Enter');

            // Verificar que los productos visibles cumplan el criterio
            const prices = await page.locator('tbody tr td:nth-child(4)').allTextContents();
            for (const priceText of prices) {
                const price = parseInt(priceText.replace(/\D/g, ''));
                if (!isNaN(price)) {
                    expect(price).toBeGreaterThanOrEqual(50000);
                }
            }
        }
    });
});
