import { test, expect } from '@playwright/test';

test.describe('Gestión de Cuentas', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe crear una nueva cuenta', async ({ page }) => {
    // Ir a la página de cuentas
    await page.click('text=Cuentas');
    await expect(page).toHaveURL('/accounts');
    
    // Hacer clic en crear cuenta
    await page.click('text=Crear Cuenta');
    
    // Llenar formulario
    await page.fill('[name=name]', 'Mi Nueva Cuenta');
    await page.selectOption('[name=accountTypeId]', 'ASSET');
    await page.selectOption('[name=currencyId]', { index: 0 }); // Seleccionar primera opción
    await page.fill('[name=virtualBalance]', '1000');
    
    // Guardar cuenta
    await page.click('button[type=submit]');
    
    // Verificar que se creó la cuenta
    await expect(page.getByText('Mi Nueva Cuenta')).toBeVisible();
  });

  test('debe mostrar errores de validación al crear cuenta', async ({ page }) => {
    await page.click('text=Cuentas');
    await page.click('text=Crear Cuenta');
    
    // Intentar enviar formulario vacío
    await page.click('button[type=submit]');
    
    // Verificar mensajes de error
    await expect(page.getByText('El nombre es requerido')).toBeVisible();
    await expect(page.getByText('El tipo de cuenta es requerido')).toBeVisible();
  });

  test('debe editar una cuenta existente', async ({ page }) => {
    await page.click('text=Cuentas');
    
    // Buscar una cuenta y hacer clic en editar
    await page.click('[data-testid="edit-account-button"]');
    
    // Modificar el nombre
    await page.fill('[name=name]', 'Cuenta Modificada');
    
    // Guardar cambios
    await page.click('button[type=submit]');
    
    // Verificar que se guardaron los cambios
    await expect(page.getByText('Cuenta Modificada')).toBeVisible();
  });

  test('debe eliminar una cuenta sin transacciones', async ({ page }) => {
    await page.click('text=Cuentas');
    
    // Hacer clic en eliminar (si la cuenta no tiene transacciones)
    await page.click('[data-testid="delete-account-trigger"]');
    
    // Confirmar eliminación en el diálogo
    await page.click('[data-testid="delete-account-confirm"]');
    
    // Verificar redirección a la lista de cuentas
    await expect(page).toHaveURL('/accounts');
  });
});