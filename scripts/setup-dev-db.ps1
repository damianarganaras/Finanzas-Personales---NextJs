# Script para configurar la base de datos de desarrollo en Windows

Write-Host "🔧 Configurando base de datos de desarrollo..." -ForegroundColor Yellow

# Crear base de datos de desarrollo si no existe
Write-Host "📊 Creando base de datos firefly_next..." -ForegroundColor Cyan
$createDbQuery = "CREATE DATABASE IF NOT EXISTS firefly_next CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Ejecutar el comando MySQL
try {
    # Usar las credenciales proporcionadas:
    mysql -u root -pDamian123# -e $createDbQuery
    
    Write-Host "✅ Base de datos creada exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error creando la base de datos. Verifica tus credenciales de MySQL." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

# Aplicar migraciones a la base de datos de desarrollo
Write-Host "🔄 Aplicando migraciones..." -ForegroundColor Cyan

try {
    npx prisma db push
    Write-Host "✅ Migraciones aplicadas exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error aplicando migraciones." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Base de datos de desarrollo configurada correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor de desarrollo:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
