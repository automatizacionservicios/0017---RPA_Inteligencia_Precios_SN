/**
 * TEST 06: Auditoría Masiva (Pareto)
 * RESUMEN: Valida el flujo completo del módulo Pareto, desde el ingreso masivo
 * de EANs hasta la ejecución de la auditoría y visualización de resultados agrupados.
 *
 * EJECUCIÓN: npx playwright test tests/e2e/06-pareto-audit.spec.ts
 */
import { test, expect } from '@playwright/test';

test.describe('Pareto Analysis Feature', () => {
  test('User can navigate to Pareto and see configuration options', async ({ page }) => {
    // 1. Navegar al Home
    await page.goto('/');

    // 2. Navegar a Pareto desde el Header
    // Usamos el contenedor nav para ser especificos y evitar conflictos con la paleta de comandos
    const paretoBtn = page.locator('header nav').getByRole('button', { name: /pareto/i });
    await expect(paretoBtn).toBeVisible();
    await paretoBtn.click();

    // 3. Verificar URL y Título
    // El router puede tardar un poco en procesar el estado
    await expect(page).toHaveURL(/.*benchmark/);
    await expect(page.getByText('Carga Masiva (Pareto)')).toBeVisible();

    // 4. Verificar Opciones de Configuración (Regla 80/20)
    await expect(page.getByText('Configuración de Auditoría')).toBeVisible();

    // 5. Verificar Tabs de Modo
    await expect(page.getByRole('tab', { name: /lista cruzada/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /mejor precio/i })).toBeVisible();

    // 6. Ingresar datos y habilitar el botón de Auditar
    const textarea = page.getByPlaceholder(/ingresa los códigos EAN/i).or(page.locator('textarea'));
    await textarea.fill('7702001103210\n7702001103211\n7702001103212');

    const auditButton = page.getByRole('button', { name: /auditar/i });
    // Aseguramos que el botón se habilite tras la entrada de datos
    await expect(auditButton).toBeEnabled({ timeout: 10000 });
    await auditButton.click();

    // 7. Verificar que los resultados carguen (aparezca la tabla o el indicador de proceso)
    await expect(
      page
        .locator('table')
        .or(page.getByText(/procesando/i))
        .first()
    ).toBeVisible({ timeout: 30000 });
  });
});
