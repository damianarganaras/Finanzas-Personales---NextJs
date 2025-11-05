import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test('debe permitir registro de usuario', async ({ page }) => {
    await page.goto('/');
    
    // Ir a la página de registro
    await page.click('text=Registrarse');
    
    // Llenar formulario de registro
    await page.fill('[name=name]', 'Usuario Test');
    await page.fill('[name=email]', `test${Date.now()}@example.com`);
    await page.fill('[name=password]', 'password123');
    await page.fill('[name=confirmPassword]', 'password123');
    
    // Enviar formulario
    await page.click('button[type=submit]');
    
    // Verificar que se redirige al dashboard o a verificación de email
    await expect(page).toHaveURL(/\/(dashboard|verify-email)/);
  });

  test('debe permitir login de usuario', async ({ page }) => {
    await page.goto('/');
    
    // Llenar formulario de login
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    
    // Enviar formulario
    await page.click('button[type=submit]');
    
    // Verificar redirección al dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe mostrar errores de validación en login', async ({ page }) => {
    await page.goto('/');
    
    // Intentar login con email inválido
    await page.fill('[name=email]', 'email-invalido');
    await page.fill('[name=password]', '123');
    await page.click('button[type=submit]');
    
    // Verificar mensajes de error
    await expect(page.getByText('Email inválido')).toBeVisible();
    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible();
  });
});