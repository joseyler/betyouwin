import { test, expect } from '@playwright/test';
import { getApiUrl } from '../helpers/env';
import { createUniqueUser } from '../helpers/registro';
import { fillRegistroForm, submitRegistro } from '../helpers/registro-page';

test.describe('registro', () => {
  test.describe.configure({ mode: 'serial' });

  test('registro exitoso redirige a login con mensaje', async ({ page }) => {
    const user = createUniqueUser();

    await page.goto('/registro');
    await fillRegistroForm(page, user);
    await submitRegistro(page);

    await expect(page).toHaveURL(/\/login\?registered=1/);
    await expect(
      page.getByRole('alert').filter({ hasText: 'Registro exitoso' }),
    ).toBeVisible();
  });

  test('rechaza email duplicado con error en UI', async ({ page, request }) => {
    const user = createUniqueUser();

    const apiResponse = await request.post(`${getApiUrl()}/usuarios/registro`, {
      data: user,
    });
    expect(apiResponse.ok()).toBeTruthy();

    await page.goto('/registro');
    await fillRegistroForm(page, user);
    await submitRegistro(page);

    await expect(page).toHaveURL(/\/registro/);
    await expect(
      page.getByRole('alert').filter({ hasText: 'email o dni ya registrado' }),
    ).toBeVisible();
  });
});
