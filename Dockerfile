# Usa la imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo de dependencias
COPY package*.json ./

# Copia los archivos de esquema de Prisma
COPY prisma/schema1.prisma ./prisma/
COPY prisma/schema2.prisma ./prisma/

# Instala las dependencias y actualiza los tipos
RUN npm install --legacy-peer-deps && npx prisma generate --schema=./prisma/schema1.prisma && npx prisma generate --schema=./prisma/schema2.prisma && npm update @types/node

# Copia el resto del proyecto
COPY . .

# Compila el proyecto TypeScript
RUN npm run build

# Expone el puerto de la aplicación
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["node", "build/server.js"]
