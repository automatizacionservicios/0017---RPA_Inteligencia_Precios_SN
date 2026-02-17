import { test, expect } from '@playwright/test';

test.describe('Location Management', () => {
  test('User can change city and verify persistence', async ({ page }) => {
    await page.goto('/');

    // 1. Abrir selector de ubicación en el Header
    const locationBtn = page
      .locator('header')
      .getByRole('button')
      .filter({ has: page.locator('.lucide-map-pin') });
    await locationBtn.click();

    // 2. Seleccionar una ciudad diferente (ej: Medellín)
    const medellinOption = page
      .getByRole('option', { name: /medellín/i })
      .or(page.getByText(/medellín/i).first());
    await medellinOption.click();

    // 3. Verificar que el texto del botón cambie
    await expect(locationBtn).toContainText(/medellín/i);

    // 4. Verificar persistencia en LocalStorage
    const storedLocation = await page.evaluate(() => localStorage.getItem('selectedLocationId'));
    expect(storedLocation).toBe('medellin');

    // 5. Verificar que al recargar se mantenga
    await page.reload();
    await expect(page.locator('header')).toContainText(/medellín/i);
  });

  test('Location is sent correctly in search request', async ({ page }) => {
    await page.goto('/');

    // Interceptar la llamada a la Edge Function
    const requestPromise = page.waitForRequest(
      (request) => request.url().includes('price-scraper') && request.method() === 'POST'
    );

    // Realizar búsqueda
    await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Sal');
    await page
      .locator('form')
      .getByRole('button', { name: /buscar/i })
      .click();

    const request = await requestPromise;
    const postData = JSON.parse(request.postData() || '{}');

    // El default suele ser bogota, si lo cambiamos antes debería ser medellin
    expect(postData.locationId).toBeDefined();
  });
});
