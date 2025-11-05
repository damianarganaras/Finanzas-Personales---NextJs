import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/');
    await page.fill('[name=email]', 'test@example.com');
    await page.fill('[name=password]', 'password123');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe mostrar widgets del dashboard', async ({ page }) => {
    // Verificar que se muestran los widgets principales
    await expect(page.getByTestId('financial-metrics')).toBeVisible();
    await expect(page.getByTestId('account-summary')).toBeVisible();
    await expect(page.getByTestId('recent-transactions')).toBeVisible();
  });

  test('debe permitir configurar widgets del dashboard', async ({ page }) => {
    // Ir a configuración
    await page.click('text=Configuración');
    
    // Desactivar un widget
    await page.click('[data-testid="toggle-metrics-widget"]');
    
    // Guardar configuración
    await page.click('button[type=submit]');
    
    // Volver al dashboard
    await page.click('text=Dashboard');
    
    // Verificar que el widget se oculte
    await expect(page.getByTestId('financial-metrics')).not.toBeVisible();
  });

  test('debe navegar correctamente entre secciones', async ({ page }) => {
    // Probar navegación del sidebar
    await page.click('text=Cuentas');
    await expect(page).toHaveURL('/accounts');
    
    await page.click('text=Transacciones');
    await expect(page).toHaveURL('/transactions');
    
    await page.click('text=Presupuestos');
    await expect(page).toHaveURL('/budgets');
    
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe mostrar datos actualizados en el dashboard', async ({ page }) => {
    // Verificar que hay contenido en las métricas
    const metricsCard = page.getByTestId('financial-metrics');
    await expect(metricsCard.getByText(/\$/)).toBeVisible(); // Debe mostrar al menos un símbolo de dinero
    
    // Verificar lista de transacciones recientes
    const transactionsList = page.getByTestId('recent-transactions');
    await expect(transactionsList).toBeVisible();
  });
});