import { test, expect } from '@playwright/test';

test('User can interact with store badges', async ({ page }) => {
  await page.goto('/');

  // Verificar que los badges de tiendas populares sean visibles
  const exitoBadge = page.getByText('Éxito');
  const jumboBadge = page.getByText('Jumbo');

  await expect(exitoBadge).toBeVisible();
  await expect(jumboBadge).toBeVisible();

  // Simular desactivar una tienda (si la UI lo permite con click)
  // Nota: Esto depende de la implementación específica del componente de filtros.
  // Si son meramente visuales o checkboxes, ajustamos el selector.
  await exitoBadge.click();

  // Verificación visual de cambio de estado (transparencia, clase, check)
  // Por ejemplo, si al desactivar baja la opacidad:
  // await expect(exitoBadge).toHaveCSS('opacity', '0.5');
  // O si es un toggle real. Por ahora verificamos que sea interactuable.
});
