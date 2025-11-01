# Guía de Configuración de Variables de Entorno (.env)

Esta guía explica dónde crear y configurar los archivos `.env` para desarrollo local y para Docker.

## ⚠️ IMPORTANTE: Archivo .env

**El archivo `.env` NO debe estar en el repositorio Git** por razones de seguridad. Ya está configurado en `.gitignore`.

**Debes crearlo localmente** siguiendo estos pasos:

1. Copia la plantilla de ejemplo:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus valores reales

3. **NO** hagas commit del archivo `.env` al repositorio

### ¿Qué archivos SÍ van en el repositorio?

- ✅ `.env.example` - Plantilla de ejemplo (sin valores reales)
- ❌ `.env` - Tu configuración real (NO debe estar en Git)

## 📍 Ubicación de Archivos .env

### 1. **Desarrollo Local** (sin Docker)

**Ubicación**: `lime-video-tool/.env` (raíz del proyecto)

```
lime-video-tool/
├── .env              ← CREA AQUÍ localmente (no en Git)
├── .env.example      ← ESTE SÍ va en el repositorio
├── package.json
└── ...
```

**Variables para desarrollo local:**
```env
# Database (conecta a PostgreSQL local o en Docker)
DATABASE_URL="postgresql://user:password@localhost:5432/videodb"

# NextAuth
NEXTAUTH_SECRET="tu-secret-aqui-generado-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Redis (conecta a Redis local o en Docker)
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Processing
CONCURRENT_JOBS=3
MAX_JOBS_PER_USER=2
```

### 2. **Producción con Docker**

**Ubicación**: `lime-video-tool/.env` (la misma raíz del proyecto)

El `docker-compose.yml` está configurado para leer automáticamente el archivo `.env` de la raíz del proyecto usando `env_file: ../.env`.

**Variables para Docker (mismo archivo pero con valores de producción):**

```env
# Database (usa los servicios de Docker Compose)
# Estas variables se usan para construir DATABASE_URL
POSTGRES_USER=user
POSTGRES_PASSWORD=password-segura
POSTGRES_DB=videodb

# DATABASE_URL se construye automáticamente, pero puedes sobrescribirla
# DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}"

# NextAuth
NEXTAUTH_SECRET="tu-secret-de-produccion"
NEXTAUTH_URL="https://tu-dominio.com"

# Google OAuth
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# Google Drive API
GOOGLE_DRIVE_API_KEY="tu-api-key"
GOOGLE_DRIVE_FOLDER_ID="tu-folder-id"
GOOGLE_APPLICATION_CREDENTIALS="/app/credentials/service-account-key.json"

# Slack Integration
SLACK_WEBHOOK_URL="tu-webhook-url"
SLACK_BOT_TOKEN="tu-bot-token"
SLACK_CHANNEL_ID="tu-channel-id"

# Redis (usa el servicio de Docker Compose)
REDIS_URL="redis://redis:6379"

# App
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"

# Processing
CONCURRENT_JOBS=3
MAX_JOBS_PER_USER=2
```

**Importante para Docker:**
- Las URLs de conexión a PostgreSQL y Redis apuntan a los nombres de los servicios Docker (`postgres` y `redis`), no a `localhost`
- El `DATABASE_URL` se construye automáticamente usando las variables `POSTGRES_USER`, `POSTGRES_PASSWORD`, y `POSTGRES_DB`

## 📦 Volúmenes de Docker

Los volúmenes persistentes de Docker se guardan en:
```
lime-video-tool/docker-volumes/lime-video-tool/
├── postgres/    # Datos de PostgreSQL
├── redis/       # Datos de Redis
├── minio/       # Datos de MinIO
├── uploads/     # Archivos subidos
└── temp/        # Archivos temporales de procesamiento
```

Este directorio está en `.gitignore` y se crea automáticamente cuando levantas los servicios.

## 🚀 Uso

### Desarrollo Local

1. Crear el archivo `.env` en la raíz:
```bash
cd lime-video-tool
cp .env.example .env
```

2. Editar el `.env` con tus valores

3. Asegúrate de tener PostgreSQL y Redis corriendo localmente (o en Docker):
```bash
# PostgreSQL en Docker
docker run --name postgres-video \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=videodb \
  -p 5432:5432 -d postgres:15-alpine

# Redis en Docker
docker run --name redis-video \
  -p 6379:6379 -d redis:7-alpine
```

4. Ejecutar la aplicación:
```bash
npm run dev
```

### Docker Compose

1. Crear/editar el `.env` en la raíz del proyecto con valores de producción

2. Levantar los servicios:
```bash
cd docker
docker-compose up -d
```

El `docker-compose.yml` automáticamente:
- Lee las variables del archivo `.env` de la raíz
- Crea los servicios PostgreSQL y Redis
- Crea los directorios de volúmenes en `docker-volumes/lime-video-tool/`
- Configura las conexiones entre servicios

## 🔒 Seguridad

- **NUNCA** commitees el archivo `.env` al repositorio (ya está en `.gitignore`)
- Para producción, usa un gestor de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)
- Genera `NEXTAUTH_SECRET` con:
```bash
openssl rand -base64 32
```

## 📝 Resumen

| Entorno | Ubicación del .env | Conexiones | Ubicación Volúmenes |
|---------|-------------------|----------------|---------------------|
| **Desarrollo Local** | `lime-video-tool/.env` | `localhost:5432`, `localhost:6379` | N/A (archivos locales) |
| **Docker Compose** | `lime-video-tool/.env` | `postgres:5432`, `redis:6379` | `docker-volumes/lime-video-tool/` |

**Ambos usan el mismo archivo `.env` en la raíz**, solo cambian los valores de las URLs de conexión y ubicación de volúmenes.
