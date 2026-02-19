import { test, expect } from '@playwright/test';

test.describe('EAN Numeric Validation', () => {
  test('EAN input only accepts numeric characters', async ({ page }) => {
    // 1. Navegar a Radar Referencial
    await page.goto('/radar-referencial');

    // 2. Cambiar a Modo EAN
    const eanTab = page.getByRole('tab', { name: /Modo EAN/i });
    await eanTab.click();

    // 3. Intentar escribir caracteres no numéricos uno a uno
    const eanInput = page.locator('#ean');
    await eanInput.click();
    await eanInput.pressSequentially('abc123def!@#');

    // 4. Verificar que solo los números se mantienen en el valor del input
    // 'abc' -> ignorados, '123' -> aceptados, 'def!@#' -> ignorados
    await expect(eanInput).toHaveValue('123');

    // 5. Verificar que el mensaje de ayuda es visible
    const helperMsg = page.getByText(/Solo números admitidos/i);
    await expect(helperMsg).toBeVisible();

    // 6. Intentar borrar y escribir más números
    await eanInput.fill('7701234567890');
    await expect(eanInput).toHaveValue('7701234567890');

    // 7. Intentar añadir una letra al final
    await eanInput.press('a');
    await expect(eanInput).toHaveValue('7701234567890');
  });
});
