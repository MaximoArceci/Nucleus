# Usa la imagen base de Python 3.11
FROM python:3.11

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del backend al contenedor
COPY ./. /app

# Instala las dependencias del proyecto
RUN pip install .

# Expone el puerto 80 dentro del contenedor
EXPOSE 80

# Runtime configuration is provided by compose.yml, .env, or the deploy platform.
ENV DATABASE_NAME=nucleus
ENV ENV=dev
ENV JWT_ALGORITHM=HS256
ENV TEST=true

# Comando para ejecutar la aplicación
CMD ["python", "start.py", "--reload"]
