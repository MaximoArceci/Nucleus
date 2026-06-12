FROM node:18

# Establecer el directorio de trabajo
WORKDIR /backoffice

# Copiar los archivos necesarios para instalar las dependencias
COPY package*.json ./


# Instalar dependencias con manejo de conflictos
RUN npm install


# Copiar el resto de los archivos
COPY . .

# Exponer el puerto
EXPOSE 5173

# Construir la aplicación
RUN npm run build

# Instalar serve globalmente para servir la aplicación
RUN npm install -g serve

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "5173"]
