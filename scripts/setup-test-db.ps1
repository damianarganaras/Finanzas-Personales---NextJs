# Script para configurar la base de datos de testing en Windows

Write-Host "🔧 Configurando base de datos de testing..." -ForegroundColor Yellow

# Crear base de datos de testing si no existe
Write-Host "📊 Creando base de datos firefly_test..." -ForegroundColor Cyan
$createDbQuery = "CREATE DATABASE IF NOT EXISTS firefly_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar el comando MySQL (ajusta las credenciales según tu configuración)
try {
    # Usar las credenciales proporcionadas:
    mysql -u root -pDamian123# -e $createDbQuery
    
    Write-Host "✅ Base de datos creada exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creando la base de datos. Verifica tus credenciales de MySQL." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Aplicar migraciones a la base de datos de testing
Write-Host "🔄 Aplicando migraciones..." -ForegroundColor Cyan
$env:DATABASE_URL = "mysql://root:Damian123%23@localhost:3306/firefly_test"

try {
    npx prisma migrate dev --name init
    Write-Host "✅ Migraciones aplicadas exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error aplicando migraciones." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Base de datos de testing configurada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar los tests:" -ForegroundColor Yellow
Write-Host "npm run test" -ForegroundColor White
Write-Host ""
Write-Host "Para ejecutar tests con coverage:" -ForegroundColor Yellow
Write-Host "npm run test:coverage" -ForegroundColor White
