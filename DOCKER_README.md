# 🐳 Docker — SaaS Inventario Tiendas Backend

Esta carpeta incluye todo lo necesario para ejecutar el backend en Docker, tanto en **desarrollo** como en **producción**.

---

## 📁 Archivos Docker

| Archivo | Propósito |
|---|---|
| `Dockerfile` | Multi-stage build: compila TypeScript y genera imagen ligera |
| `docker-compose.yml` | Orquestación del backend + PostgreSQL + servicios futuros |
| `docker-compose.override.yml` | Configuración extra para desarrollo (hot-reload) |
| `.dockerignore` | Evita copiar archivos innecesarios al contenedor |
| `.env.docker.example` | Plantilla de variables de entorno |

---

## 🚀 Uso Rápido

### 1. Preparar variables de entorno

```bash
cp .env.docker.example .env
# Edita .env con tus valores reales (DB_URL, JWT_SECRET, etc.)
```

### 2. Construir e iniciar

```bash
# Producción (imagen compilada, sin hot-reload)
docker-compose up -d

# Desarrollo (con tsx watch, hot-reload de código)
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# O simplemente (docker-compose carga override.yml automáticamente)
docker-compose up -d
```

### 3. Verificar que funciona

```bash
# Logs del backend
docker-compose logs -f backend

# Health check
curl http://localhost:3000/health
```

### 4. Detener

```bash
docker-compose down

# Para eliminar también los volúmenes (base de datos y uploads)
docker-compose down -v
```

---

## 🔧 Comandos Útiles

```bash
# Reconstruir imagen después de cambios en el Dockerfile
docker-compose build

# Reconstruir sin caché
docker-compose build --no-cache

# Entrar al contenedor del backend
docker-compose exec backend sh

# Ver base de datos local (si usas postgres en docker-compose)
docker-compose exec postgres psql -U saas -d saas_db

# Escalar el backend (si tienes múltiples réplicas)
docker-compose up -d --scale backend=2
```

---

## 🏗️ Multi-App / Microservicios

El `docker-compose.yml` está preparado para que agregues más aplicaciones. Servicios comentados que puedes activar:

### Añadir un Frontend (React/Vue/Angular)

1. Descomenta el servicio `frontend` en `docker-compose.yml`.
2. Ajusta `context: ../ruta-de-tu-frontend`.
3. El Dockerfile del frontend debe exponer el puerto 80 (nginx).

### Añadir Redis (cache/sesiones)

1. Descomenta el servicio `redis` en `docker-compose.yml`.
2. En tu `.env` agrega: `REDIS_URL=redis://redis:6379`.
3. Usa Redis en tu código para rate-limiting o sesiones.

### Añadir Nginx como Reverse Proxy

1. Descomenta el servicio `nginx` en `docker-compose.yml`.
2. Crea `nginx/nginx.conf` (ver ejemplo abajo).
3. Expone solo el puerto 80/443 al mundo exterior.

---

## 📦 Imagen Docker Manual

Si prefieres no usar docker-compose, puedes construir y correr la imagen directamente:

```bash
# Build
docker build -t saas-backend .

# Run (requiere .env)
docker run -d \
  --name saas-backend \
  -p 3000:3000 \
  --env-file .env \
  -v saas-uploads:/app/uploads \
  saas-backend

# Parar
docker stop saas-backend && docker rm saas-backend
```

---

## 🛡️ Seguridad en Producción

1. **Nunca uses el `docker-compose.override.yml` en producción.**
2. **Usa secretos de Docker Swarm o un vault** en lugar de `.env` plano.
3. **Expón solo el puerto 80/443** vía Nginx o un load balancer.
4. **Configura SSL/TLS** (Let's Encrypt, Cloudflare, etc.).
5. **El servicio PostgreSQL** debe estar en una red privada (no expuesto a internet).

---

## 📝 Ejemplo de nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3000;
    }

    server {
        listen 80;
        server_name tu-dominio.com;

        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
    }
}
```

---

*Última actualización: Junio 2026*
