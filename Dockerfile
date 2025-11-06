# 1. Usar una imagen base de Node.js
FROM node:24-alpine AS base

# 2. Establecer el directorio de trabajo
WORKDIR /app

# 3. Instalar dependencias
# Copiamos package.json y package-lock.json primero para cachear la capa de dependencias
COPY package*.json ./
RUN npm install

# 4. Copiar el resto del código de la aplicación
COPY . .

# 5. Exponer el puerto de Next.js
EXPOSE 3000

# 6. Comando por defecto para iniciar la app en modo desarrollo
CMD ["npm", "run", "dev"]