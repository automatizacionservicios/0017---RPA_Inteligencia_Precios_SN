/**
 * TEST 10: Experiencia de Usuario Móvil
 * RESUMEN: Simula un dispositivo móvil para verificar que la interfaz sea 
 * responsiva, el menú hamburguesa funcione y los elementos se adapten al viewport.
 * 
 * EJECUCIÓN: npx playwright test tests/e2e/10-mobile-responsive.spec.ts
 */
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // iPhone 13 Mini/Safe standard viewport

test.describe('Mobile Responsiveness', () => {
  test('Header adapts to mobile layout', async ({ page }) => {
    await page.goto('/');

    // 1. Verificar que el botón de búsqueda global está OCULTO
    await expect(page.getByText('Buscar módulo...')).toBeHidden();

    // 2. Verificar que el Monitor Live está OCULTO
    await expect(page.getByText(/monitor live/i)).toBeHidden();

    // 3. Verificar el Menú Hamburguesa (Trigger)
    // Usamos un selector más robusto para lucide-react o aria-label
    const menuBtn = page
      .getByRole('button', { name: /menu/i })
      .or(page.locator('button').filter({ has: page.locator('svg.lucide-menu') }));
    await expect(menuBtn).toBeVisible({ timeout: 10000 });
    await menuBtn.click();

    // 4. Verificar que las opciones del menú aparezcan (en el Search Dialog)
    await expect(page.getByText('Radar Referencial', { exact: false }).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Módulo Pareto', { exact: false }).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
