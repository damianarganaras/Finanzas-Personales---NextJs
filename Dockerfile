# 1. Usar una imagen base de Node.js
FROM node:20-alpine AS base

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Copiar package.json
COPY package*.json ./

# 4. (LA CORRECCIÓN) Copiar el schema de Prisma ANTES de instalar
# Esto es necesario para que el hook "postinstall" (prisma generate) funcione.
COPY prisma ./prisma

# 5. Instalar dependencias
# Ahora, 'npm install' correrá 'prisma generate' y SÍ encontrará el schema.
RUN npm install

# 6. Copiar el resto del código de la aplicación
COPY . .

# 7. Exponer el puerto de Next.js
EXPOSE 3000

# 8. Comando por defecto para iniciar la app en modo desarrollo
CMD ["npm", "run", "dev"]