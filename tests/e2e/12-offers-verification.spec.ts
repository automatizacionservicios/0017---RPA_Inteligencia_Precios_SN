import { test, expect } from '@playwright/test';

test.describe('Offers Verification', () => {
  test('User can see offers in Oportunidades page', async ({ page }) => {
    // 1. Navegar a Oportunidades
    await page.goto('/oportunidades');

    // 2. Verificar que el título principal sea visible
    await expect(page.getByRole('heading', { name: /Oportunidades de Mercado/i })).toBeVisible();

    // 3. Esperar a que el radar termine de cargar (LoadingProgress desaparezca)
    // El timeout se pone alto porque depende de scrapers reales o mockeados
    console.log('Esperando a que el Radar de Oportunidades termine de cargar...');
    await expect(page.getByText(/Sincronizando Radar/i)).not.toBeVisible({ timeout: 120000 });

    // 4. Verificar el estado de los resultados

    // Verificamos si hay tarjetas de productos O el mensaje de que no hay ofertas
    const productsVisible = (await page.locator('.rounded-3xl').count()) > 0;
    const noOffersVisible = await page.getByText(/Sin Ofertas Críticas/i).isVisible();

    if (productsVisible) {
      console.log('Se encontraron productos en oferta.');
      await expect(page.locator('.rounded-3xl').first()).toBeVisible();
      // Verificar que el precio esté presente
      await expect(page.locator('span:has-text("$")').first()).toBeVisible();
    } else if (noOffersVisible) {
      console.log('No se encontraron ofertas, pero la UI muestra el estado vacío correctamente.');
      await expect(page.getByText(/Sin Ofertas Críticas/i)).toBeVisible();
    } else {
      // Si no hay productos ni mensaje de vacío, algo falló en la carga
      throw new Error(
        'La página de Oportunidades no cargó productos ni el mensaje de estado vacío.'
      );
    }
  });
});
