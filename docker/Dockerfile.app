FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de sistema para FFmpeg
RUN apk add --no-cache ffmpeg python3 make g++

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Build de Next.js
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Instalar FFmpeg
RUN apk add --no-cache ffmpeg

# Copiar archivos necesarios desde builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Crear directorios para archivos temporales
RUN mkdir -p /app/uploads /app/temp && \
    chmod -R 777 /app/uploads /app/temp

EXPOSE 3000

CMD ["npm", "run", "start"]

