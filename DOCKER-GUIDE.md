# Guía para Docker Compose

Esta guía te ayudará a levantar el proyecto completo con Docker Compose.

## 📋 Prerrequisitos

- **Docker** instalado (verifica con `docker --version`)
- **Docker Compose** instalado (verifica con `docker-compose --version`)
- Al menos **8GB de RAM** disponible
- Espacio en disco suficiente (al menos 10GB)

## 🚀 Pasos para Levantar el Proyecto

### Paso 1: Verificar Docker

```bash
# Verificar que Docker esté corriendo
docker ps

# Si da error, inicia Docker Desktop o el servicio Docker
```

### Paso 2: Configurar Variables de Entorno

**IMPORTANTE:** Necesitas crear el archivo `.env` en la raíz del proyecto antes de levantar Docker.

```bash
cd lime-video-tool

# Si no tienes .env, cópialo de la plantilla
cp .env.example .env

# Editar .env con tus valores
nano .env
# o
code .env
```

**Valores mínimos requeridos en `.env` para Docker:**

```env
# Database - Se construyen automáticamente con las variables POSTGRES_*
POSTGRES_USER=user
POSTGRES_PASSWORD=change-this-to-secure-password
POSTGRES_DB=videodb

# NextAuth
NEXTAUTH_SECRET=tu-secret-generado-con-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Redis (usa el servicio Docker)
REDIS_URL=redis://redis:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Processing
CONCURRENT_JOBS=3
MAX_JOBS_PER_USER=2
```

### Paso 3: Verificar Configuración de Docker Compose

El archivo `docker/docker-compose.yml` está configurado para:
- Leer variables de `.env` automáticamente
- Crear volúmenes en `docker-volumes/lime-video-tool/`
- Conectar servicios entre sí

### Paso 4: Levantar los Servicios

```bash
# Ir al directorio docker
cd docker

# Levantar todos los servicios en background
docker-compose up -d

# O ver los logs en tiempo real
docker-compose up
```

### Paso 5: Verificar que Todo Esté Corriendo

```bash
# Ver el estado de todos los servicios
docker-compose ps

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f worker
docker-compose logs -f postgres
docker-compose logs -f redis
```

Deberías ver algo como:

```
NAME              STATUS              PORTS
app               Up 2 minutes        0.0.0.0:3000->3000/tcp
worker            Up 2 minutes        
postgres          Up 2 minutes        0.0.0.0:5432->5432/tcp
redis             Up 2 minutes        0.0.0.0:6379->6379/tcp
nginx             Up 2 minutes        0.0.0.0:80->80/tcp
minio             Up 2 minutes        0.0.0.0:9000->9000/tcp
```

### Paso 6: Inicializar la Base de Datos

Una vez que los servicios estén corriendo:

```bash
# Entrar al contenedor de la app
docker-compose exec app sh

# Dentro del contenedor:
npx prisma generate
npx prisma db push

# Salir del contenedor
exit
```

O hacerlo desde tu máquina local (si tienes Prisma instalado):

```bash
# Desde la raíz del proyecto (no dentro de docker/)
cd ..
export DATABASE_URL="postgresql://user:password@localhost:5432/videodb"
npm run db:generate
npm run db:push
```

### Paso 7: Acceder a la Aplicación

- **Aplicación**: http://localhost:3000
- **Nginx** (si está configurado): http://localhost:80
- **MinIO Console**: http://localhost:9001 (usuario: minioadmin, password: minioadmin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🔧 Comandos Útiles de Docker Compose

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f app
docker-compose logs -f worker

# Últimas 100 líneas
docker-compose logs --tail=100 app
```

### Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ CUIDADO: borra datos)
docker-compose down -v
```

### Reiniciar Servicios

```bash
# Reiniciar un servicio específico
docker-compose restart app

# Reiniciar todos
docker-compose restart
```

### Reconstruir Imágenes

```bash
# Reconstruir todas las imágenes
docker-compose build

# Reconstruir y levantar
docker-compose up --build
```

### Escalar Workers

```bash
# Escalar workers (ejemplo: 3 workers)
docker-compose up -d --scale worker=3
```

### Ejecutar Comandos en Contenedores

```bash
# Entrar al contenedor de la app
docker-compose exec app sh

# Ejecutar comando específico
docker-compose exec app npm run db:generate
docker-compose exec app npx prisma studio
```

## 📦 Volúmenes de Datos

Los datos persistentes se guardan en:
```
lime-video-tool/docker-volumes/lime-video-tool/
├── postgres/    # Datos de PostgreSQL
├── redis/       # Datos de Redis
├── minio/       # Datos de MinIO
├── uploads/     # Archivos subidos
└── temp/        # Archivos temporales
```

**Estos directorios se crean automáticamente** cuando levantas los servicios.

## 🐛 Solución de Problemas

### Error: "Cannot find .env file"

**Solución:**
```bash
cd lime-video-tool
cp .env.example .env
# Editar .env con tus valores
```

### Error: "Port already in use"

**Solución:**
```bash
# Verificar qué está usando el puerto
lsof -i :3000  # Para puerto 3000
lsof -i :5432  # Para puerto 5432
lsof -i :6379  # Para puerto 6379

# Detener el proceso o cambiar el puerto en docker-compose.yml
```

### Error: "Build failed"

**Solución:**
```bash
# Limpiar imágenes y volúmenes
docker-compose down -v
docker system prune -a

# Reconstruir
docker-compose build --no-cache
docker-compose up -d
```

### Error: "Database connection refused"

**Solución:**
1. Verificar que PostgreSQL esté corriendo: `docker-compose ps postgres`
2. Verificar logs: `docker-compose logs postgres`
3. Verificar variables en `.env`: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

### Error: "Worker no procesa jobs"

**Solución:**
```bash
# Verificar que Redis esté corriendo
docker-compose ps redis

# Verificar logs del worker
docker-compose logs worker

# Reiniciar worker
docker-compose restart worker
```

### Contenedor se reinicia constantemente

**Solución:**
```bash
# Ver logs para identificar el error
docker-compose logs app

# Verificar configuración de .env
cat .env

# Verificar que las variables requeridas estén presentes
```

## 📊 Monitoreo

### Ver Uso de Recursos

```bash
# Ver estadísticas de todos los contenedores
docker stats

# Ver estadísticas de un contenedor específico
docker stats app
```

### Health Checks

```bash
# Health check endpoint (si está configurado)
curl http://localhost:3000/api/health
```

### Acceder a la Base de Datos

```bash
# Desde tu máquina local
psql -h localhost -U user -d videodb

# O desde dentro del contenedor
docker-compose exec postgres psql -U user -d videodb
```

### Acceder a Redis

```bash
# CLI de Redis
docker-compose exec redis redis-cli

# Ver todas las claves
# (dentro de redis-cli)
KEYS *
```

## 🔒 Seguridad

1. **Nunca commitees el `.env`** (ya está en `.gitignore`)
2. **Cambia las contraseñas por defecto** en producción
3. **Usa secrets management** para producción (AWS Secrets Manager, HashiCorp Vault, etc.)
4. **Limita acceso a puertos** en producción (no exponer todos los puertos)

## 🎯 Flujo Completo de Inicio

```bash
# 1. Ir al directorio del proyecto
cd lime-video-tool

# 2. Crear .env si no existe
cp .env.example .env
# Editar .env con tus valores

# 3. Ir al directorio docker
cd docker

# 4. Levantar servicios
docker-compose up -d

# 5. Verificar que estén corriendo
docker-compose ps

# 6. Inicializar base de datos (desde raíz del proyecto)
cd ..
export DATABASE_URL="postgresql://user:password@localhost:5432/videodb"
npm run db:generate
npm run db:push

# 7. Acceder a la aplicación
# http://localhost:3000
```

## 🆘 ¿Problemas?

1. Verifica los logs: `docker-compose logs`
2. Verifica que Docker esté corriendo: `docker ps`
3. Verifica recursos disponibles: `docker stats`
4. Verifica variables de entorno: `cat .env`
5. Consulta la documentación de Docker Compose

