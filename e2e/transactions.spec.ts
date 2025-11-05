import { test, expect } from '@playwright/test';

test.describe('Transacciones', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe crear una transacción de retiro', async ({ page }) => {
    // Ir a transacciones
    await page.click('text=Transacciones');
    await expect(page).toHaveURL('/transactions');
    
    // Crear nueva transacción
    await page.click('text=Nueva Transacción');
    
    // Seleccionar tipo retiro
    await page.selectOption('[name=type]', 'withdrawal');
    
    // Llenar formulario
    await page.fill('[name=description]', 'Compra en supermercado');
    await page.fill('[name=amount]', '150.50');
    await page.selectOption('[name=sourceAccountId]', { index: 0 });
    
    // Guardar transacción
    await page.click('button[type=submit]');
    
    // Verificar que se creó
    await expect(page.getByText('Compra en supermercado')).toBeVisible();
  });

  test('debe crear una transacción de depósito', async ({ page }) => {
    await page.click('text=Transacciones');
    await page.click('text=Nueva Transacción');
    
    // Seleccionar tipo depósito
    await page.selectOption('[name=type]', 'deposit');
    
    // Llenar formulario
    await page.fill('[name=description]', 'Salario mensual');
    await page.fill('[name=amount]', '50000');
    await page.selectOption('[name=destinationAccountId]', { index: 0 });
    
    // Guardar
    await page.click('button[type=submit]');
    
    await expect(page.getByText('Salario mensual')).toBeVisible();
  });

  test('debe crear una transferencia', async ({ page }) => {
    await page.click('text=Transacciones');
    await page.click('text=Nueva Transacción');
    
    // Seleccionar tipo transferencia
    await page.selectOption('[name=type]', 'transfer');
    
    // Llenar formulario
    await page.fill('[name=description]', 'Transferencia entre cuentas');
    await page.fill('[name=amount]', '500');
    await page.selectOption('[name=sourceAccountId]', { index: 0 });
    await page.selectOption('[name=destinationAccountId]', { index: 1 });
    
    // Guardar
    await page.click('button[type=submit]');
    
    await expect(page.getByText('Transferencia entre cuentas')).toBeVisible();
  });

  test('debe mostrar errores de validación en transacciones', async ({ page }) => {
    await page.click('text=Transacciones');
    await page.click('text=Nueva Transacción');
    
    // Intentar enviar formulario vacío
    await page.click('button[type=submit]');
    
    // Verificar errores
    await expect(page.getByText('La descripción es requerida')).toBeVisible();
    await expect(page.getByText('El monto debe ser positivo')).toBeVisible();
  });

  test('debe editar una transacción existente', async ({ page }) => {
    await page.click('text=Transacciones');
    
    // Hacer clic en editar primera transacción
    await page.click('[data-testid="edit-transaction-button"]');
    
    // Modificar descripción
    await page.fill('[name=description]', 'Descripción Actualizada');
    
    // Guardar
    await page.click('button[type=submit]');
    
    await expect(page.getByText('Descripción Actualizada')).toBeVisible();
  });

  test('debe eliminar una transacción', async ({ page }) => {
    await page.click('text=Transacciones');
    
    // Eliminar primera transacción
    await page.click('[data-testid="delete-transaction-button"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verificar que se eliminó (no debería estar visible)
    await expect(page).toHaveURL('/transactions');
  });
});