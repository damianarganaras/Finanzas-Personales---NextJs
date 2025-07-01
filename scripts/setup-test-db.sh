#!/bin/bash

# Script para configurar la base de datos de testing

echo "🔧 Configurando base de datos de testing..."

# Crear base de datos de testing si no existe
echo "📊 Creando base de datos firefly_test..."
mysql -u root -pDamian123# -e "CREATE DATABASE IF NOT EXISTS firefly_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Aplicar migraciones a la base de datos de testing
echo "🔄 Aplicando migraciones..."
DATABASE_URL="mysql://root:Damian123%23@localhost:3306/firefly_test" npx prisma migrate dev --name init

echo "✅ Base de datos de testing configurada correctamente!"
echo ""
echo "Para ejecutar los tests:"
echo "npm run test"
echo ""
echo "Para ejecutar tests con coverage:"
echo "npm run test:coverage"
