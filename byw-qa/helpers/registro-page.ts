import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { RegistroUser } from './registro';

export async function fillRegistroForm(
  page: Page,
  user: RegistroUser,
): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible();

  const email = page.getByRole('textbox', { name: 'Email' });
  const nombre = page.getByRole('textbox', { name: 'Nombre completo' });
  const dni = page.getByRole('textbox', { name: 'DNI' });
  const direccion = page.getByRole('textbox', { name: 'Direccion' });
  const telefono = page.getByRole('textbox', { name: 'Telefono' });
  const password = page.getByRole('textbox', { name: 'Contrasena' });

  await email.pressSequentially(user.email, { delay: 100 });
  await nombre.fill(user.nombreCompleto);
  await dni.fill(user.dni);
  await direccion.fill(user.direccion);
  await telefono.fill(user.telefono);
  await password.fill(user.password);

  await expect(email).toHaveValue(user.email);
}

export async function submitRegistro(page: Page): Promise<void> {
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/usuarios/registro') &&
        response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Registrarse' }).click(),
  ]);
}
