# backend/Dockerfile
FROM python:3.11-slim

# Variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalar dependencias del sistema (si necesitas, por ej. gcc, libpq-dev, etc)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements (si tienes requirements.txt)
COPY backend/requirements.txt .

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copiar todo el código de Django
COPY backend/ .

# Exponer puerto para Django (por defecto 8000)
EXPOSE 8000

# Comando para ejecutar el servidor Django en modo desarrollo
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
