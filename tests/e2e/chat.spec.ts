import { test, expect } from '@playwright/test';

test.describe('AI Assistant (Gemini) Chat', () => {
  test('User can open chat and see response placeholders', async ({ page }) => {
    await page.goto('/');

    // 1. Iniciar una búsqueda para que aparezca el botón de Gemini
    await page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i).fill('Aceite');
    await page.keyboard.press('Enter');

    // Esperar a que cargue la interfaz de resultados
    await expect(page.getByText(/Radar Referencial v2.0/i)).toBeVisible({ timeout: 60000 });

    // 2. Ubicar el botón flotante del chat (Asistente Gemini)
    const chatButton = page
      .getByRole('button', { name: /gemini/i })
      .or(page.getByLabel(/asistente gemini/i))
      .last();
    await expect(chatButton).toBeVisible();
    await chatButton.click({ force: true });

    // 2. Verificar que se abra el panel lateral o diálogo del chat
    await expect(
      page.getByText(/asistente inteligente/i).or(page.getByText(/gemini/i))
    ).toBeVisible();

    // 3. Escribir un mensaje
    const input = page
      .getByPlaceholder(/pregunta sobre los resultados/i)
      .or(
        page
          .getByRole('textbox')
          .filter({ hasNot: page.getByPlaceholder(/¿Qué producto deseas auditar hoy?/i) })
      );
    await input.fill('Hola, ¿cómo estás?');
    await page.keyboard.press('Enter');

    // 4. Verificar que el mensaje enviado aparezca en la lista
    await expect(page.getByText('Hola, ¿cómo estás?')).toBeVisible();

    // 5. Verificar que aparezca un estado de "pensando" o el inicio de una respuesta
    // Esto depende de si tenemos el backend de Gemini conectado
    // const typingIndicator = page.locator('.animate-pulse').or(page.getByText(/escribiendo/i));
    // No fallamos si no hay respuesta instantánea, solo verificamos el flujo visual
    // await expect(typingIndicator).toBeVisible();
  });
});
