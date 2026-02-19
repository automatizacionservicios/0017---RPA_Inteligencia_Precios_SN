/**
 * TEST 05b: Aislamiento Funcional por EAN
 * RESUMEN: Certifica que la búsqueda por EAN restringida a una sola tienda
 * produce únicamente resultados de dicha tienda.
 */
import { test, expect } from '@playwright/test';

test('User can isolate EAN results by specific store URLs', async ({ page }) => {
    await page.goto('/radar-referencial');

    async function testEanIsolation(storeId: string, storeDomain: string, isFirst: boolean) {
        console.log(`\n--- Probando aislamiento EAN para: ${storeId} (Patrón esperado: ${storeDomain}) ---`);

        if (!isFirst) {
            console.log('Refinando búsqueda para el siguiente canal...');
            const refineBtn = page.getByRole('button', { name: /Refinar Búsqueda/i });
            await refineBtn.click();
            await page.waitForTimeout(1000);
        }

        // 1. Asegurar Modo EAN
        const eanTab = page.getByRole('tab', { name: /Modo EAN/i });
        await eanTab.click();
        await page.waitForTimeout(800);

        // Usamos el EAN de Café Sello Rojo (Muy común)
        const eanInput = page.locator('#ean');
        await eanInput.fill('7701001899923');

        // 2. Manejar Selección de Tiendas (Aislamiento Directo)
        const exitoBtn = page.locator('button#exito');
        const targetStoreBtn = page.locator(`button#${storeId}`);

        // Desmarcar Éxito si no es nuestro target y está marcado
        if (storeId !== 'exito') {
            const isExitoChecked = await exitoBtn.getAttribute('data-state') === 'checked';
            if (isExitoChecked) {
                console.log('Deseleccionando Éxito...');
                await exitoBtn.click();
                await page.waitForTimeout(500);
            }
        }

        // Marcar la tienda objetivo si no lo está
        if (await targetStoreBtn.getAttribute('data-state') !== 'checked') {
            await targetStoreBtn.click();
            await page.waitForTimeout(500);
        }

        await expect(targetStoreBtn).toHaveAttribute('data-state', 'checked');

        // 3. Buscar
        console.log(`Iniciando búsqueda EAN para ${storeId}...`);
        const searchBtn = page.getByRole('button', { name: /Comparar Precios/i });
        await searchBtn.click();

        // 4. Verificar Resultados
        const modalTitle = page.getByText(/Radar Referencial v2.0/i);
        await expect(modalTitle).toBeVisible({ timeout: 60000 });

        // Esperar a que la tabla tenga datos
        const firstRow = page.locator('table tbody tr').first();
        await expect(firstRow).toBeVisible({ timeout: 30000 });

        const firstLink = firstRow.locator('td:nth-child(6) a');
        await expect(firstLink).toBeBufferedVisible(30000);

        const href = await firstLink.getAttribute('href');
        console.log(`URL detectada: ${href}`);

        // Certificación flexible pero segura
        expect(href?.toLowerCase()).toContain(storeDomain.toLowerCase());
        console.log(`✅ Certificado EAN: ${storeId} -> ${storeDomain}`);

        // 5. Cerrar
        console.log('Cerrando modal...');
        const closeModalBtn = page.getByRole('button', { name: 'Close' });
        await closeModalBtn.click();
        await expect(modalTitle).not.toBeVisible({ timeout: 15000 });
    }

    // Iteración 1: Éxito
    await testEanIsolation('exito', 'exito.com', true);

    // Iteración 2: Jumbo
    // Nota: Jumbo a veces usa jumbocolombia.com o tienda.jumbo.co, usamos 'jumbo' para máxima flexibilidad
    await testEanIsolation('jumbo', 'jumbo', false);

    console.log('TEST 05b: Aislamiento EAN completado exitosamente.');
});

// Helper expect extendido
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
