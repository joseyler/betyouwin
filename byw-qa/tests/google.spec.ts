import { test, expect, type Page } from '@playwright/test';

async function dismissGoogleConsentIfVisible(page: Page): Promise<void> {
  const consentButton = page.getByRole('button', {
    name: /aceptar todo|accept all|acepto|i agree/i,
  });

  if (await consentButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await consentButton.click();
  }
}

test.describe('google', { tag: '@google' }, () => {
  test('busqueda cursos de IA muestra al menos 5 resultados', async ({ page }) => {
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded' });

    await dismissGoogleConsentIfVisible(page);

    const searchBox = page
      .getByRole('combobox', { name: /buscar|search/i })
      .or(page.locator('textarea[name="q"]'))
      .or(page.locator('input[name="q"]'));

    await expect(searchBox.first()).toBeVisible();
    await searchBox.first().click();
    await searchBox.first().pressSequentially('cursos de IA', { delay: 75 });
    await searchBox.first().press('Enter');

    await page.waitForLoadState('domcontentloaded');

    if (page.url().includes('/sorry/')) {
      test.skip(
        true,
        'Google detecto automatizacion (CAPTCHA). Reintentar mas tarde con: npm run test:google',
      );
    }

    await expect(page.locator('#search')).toBeVisible({ timeout: 15000 });

    const resultHeadings = page.locator('#search a h3');
    await expect
      .poll(async () => resultHeadings.count(), { timeout: 15000 })
      .toBeGreaterThanOrEqual(5);
  });
});
