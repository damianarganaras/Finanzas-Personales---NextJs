# 🔧 Guía de Configuración de Tests con MySQL

## ⚠️ Configuración Requerida

Para que los tests funcionen correctamente con tu base de datos MySQL, necesitas:

### 1. Verificar Credenciales de MySQL

Primero, verifica que puedas conectarte a MySQL. Abre una terminal y prueba:

```bash
# Si NO tienes contraseña en root:
mysql -u root

# Si SÍ tienes contraseña en root:
mysql -u root -p
```

### 2. Crear Base de Datos de Testing

Una vez conectado a MySQL, ejecuta:

```sql
CREATE DATABASE IF NOT EXISTS firefly_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
```

### 3. Configurar Variables de Entorno

Edita el archivo `.env.test` con tus credenciales correctas:

```env
# Si NO tienes contraseña en root:
DATABASE_URL="mysql://root:@localhost:3306/firefly_test"

# Si SÍ tienes contraseña en root:
DATABASE_URL="mysql://root:tu_password@localhost:3306/firefly_test"

# Si usas otro usuario:
DATABASE_URL="mysql://tu_usuario:tu_password@localhost:3306/firefly_test"
```

### 4. Aplicar el Esquema

```bash
# Aplicar el esquema de Prisma a la base de datos de testing
DATABASE_URL="mysql://root:@localhost:3306/firefly_test" npx prisma db push
```

### 5. Ejecutar Tests

```bash
# Ejecutar todos los tests
npm run test

# Ejecutar solo tests de base de datos
npm run test:db

# Ejecutar tests con coverage
npm run test:coverage
```

## 🔍 Solución de Problemas

### Error P1000: Authentication failed

Si ves este error, significa que las credenciales no son correctas. Verifica:

1. ¿El usuario `root` existe?
2. ¿Tiene contraseña o no?
3. ¿Puedes conectarte desde la terminal?
4. ¿El servicio MySQL está ejecutándose?

### Error: mysql command not found

Si no puedes ejecutar `mysql` desde la terminal, añade MySQL al PATH o usa:

- **Windows**: Usar MySQL Workbench o phpMyAdmin
- **XAMPP/WAMP**: Usar el panel de control
- **Docker**: `docker exec -it mysql_container mysql -u root -p`

### Cambiar Puerto o Host

Si MySQL no está en el puerto 3306 o localhost:

```env
DATABASE_URL="mysql://root:password@tu_host:tu_puerto/firefly_test"
```

## 📝 Próximos Pasos

1. Configura las credenciales correctas en `.env.test`
2. Crea la base de datos `firefly_test`
3. Ejecuta `npx prisma db push` con la URL correcta
4. Ejecuta `npm run test` para verificar que todo funcione

¡Los tests están listos para validar que tu esquema de base de datos funcione correctamente!
