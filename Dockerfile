# Dockerfile para aplicación Next.js 15 con TypeScript, Azure MSAL, MongoDB y Firebase
# Multi-stage build para optimizar el tamaño final de la imagen

# Etapa 1: Imagen base con Node.js
FROM node:18-alpine AS base

# Instalar dependencias necesarias para el sistema
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Etapa 2: Instalar dependencias
FROM base AS deps
# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias de producción y desarrollo
RUN npm ci --include=dev && npm cache clean --force

# Etapa 3: Build de la aplicación
FROM base AS builder
WORKDIR /app

# Copiar dependencias desde la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Crear directorio public si no existe
RUN mkdir -p ./public

# Variables de entorno para el build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Ejecutar el build de Next.js
RUN npm run build

# Verificar que se generó la salida standalone
RUN ls -la .next/ && \
    if [ ! -d ".next/standalone" ]; then \
        echo "ERROR: .next/standalone no encontrado. Verifica que output: 'standalone' esté configurado en next.config.ts"; \
        exit 1; \
    fi

# Etapa 4: Imagen de producción
FROM base AS runner
WORKDIR /app

# Instalar wget para health checks
RUN apk add --no-cache wget

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar la aplicación construida desde el builder
# Copiar el servidor standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copiar archivos estáticos
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar archivos públicos
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Verificar que server.js existe
RUN test -f server.js || (echo "ERROR: server.js no encontrado en la salida standalone" && exit 1)

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Cambiar al usuario no-root
USER nextjs

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
