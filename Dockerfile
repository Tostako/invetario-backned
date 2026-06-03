# ──────────────────────────────────────────────────────────────────────────────
# Dockerfile — Inventario Tiendas Backend (Node.js + TypeScript)
# ──────────────────────────────────────────────────────────────────────────────
# Multi-stage build: compila TypeScript en una imagen ligera y solo copia
# el dist/ + node_modules/ a la imagen final.
# Uso:
#   docker build -t saas-backend .
#   docker run -p 3000:3000 --env-file .env saas-backend
# ──────────────────────────────────────────────────────────────────────────────

# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo archivos de dependencias primero (cache de capas Docker)
COPY package*.json ./

# Instalar TODAS las dependencias (incluidas devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY tsconfig.json ./
COPY src ./src

# Compilar TypeScript → dist/
RUN npm run build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción (sin devDependencies)
RUN npm ci --only=production && npm cache clean --force

# Copiar el dist/ compilado desde el stage builder
COPY --from=builder /app/dist ./dist

# Crear directorio para uploads si no existe
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 3000

# Healthcheck básico
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "dist/server.js"]
