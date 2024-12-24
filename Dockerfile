# Usa la imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del proyecto
COPY . .

# Compila el proyecto TypeScript
RUN npm run build

# Expone el puerto de la aplicación
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["npm", "start"]
