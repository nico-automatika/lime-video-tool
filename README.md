# Lime Video Editor

Aplicación web moderna para edición de video que permite cargar videos desde YouTube y Google Drive, cortar y extraer fragmentos específicos, combinar múltiples fragmentos y exportar con opciones de audio personalizadas.

## 🚀 Características

- **Carga de Videos**: Soporte para YouTube y Google Drive
- **Edición de Fragmentos**: Cortar y extraer segmentos específicos
- **Combinación**: Unir múltiples clips en un solo video
- **Exportación Avanzada**: Opciones de formato, calidad y audio
- **Integración con Google Workspace**: Subida automática a Google Drive
- **Notificaciones Slack**: Alertas cuando el procesamiento finaliza
- **Procesamiento Concurrente**: Sistema de colas para múltiples usuarios

## 📋 Requisitos Previos

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- FFmpeg
- Docker y Docker Compose (para despliegue)

## 🛠️ Instalación

### Desarrollo Local

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd lime-video-tool
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: Credenciales de OAuth de Google
- `NEXTAUTH_SECRET`: Secret para NextAuth (generar con `openssl rand -base64 32`)
- `REDIS_URL`: URL de conexión a Redis
- Credenciales de Google Drive y Slack (opcional)

4. Configurar la base de datos:
```bash
npx prisma generate
npx prisma db push
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

6. (Opcional) Iniciar el worker de procesamiento en otra terminal:
```bash
npm run worker
```

### Producción con Docker

1. Construir y levantar los servicios:
```bash
cd docker
docker-compose up -d
```

2. Verificar que todos los servicios estén corriendo:
```bash
docker-compose ps
```

3. Ver logs:
```bash
docker-compose logs -f app worker
```

## 📁 Estructura del Proyecto

```
lime-video-tool/
├── app/
│   ├── (auth)/           # Rutas de autenticación
│   ├── (dashboard)/      # Rutas protegidas del dashboard
│   ├── api/              # API Routes
│   └── layout.tsx        # Layout principal
├── components/           # Componentes React
│   ├── video/            # Componentes de video
│   ├── ui/               # Componentes UI base
│   └── layout/           # Componentes de layout
├── lib/
│   ├── video-processing/ # Utilidades de FFmpeg
│   ├── integrations/     # Integraciones (Drive, Slack)
│   ├── queue/            # Sistema de colas BullMQ
│   └── session/          # Gestión de sesiones concurrentes
├── prisma/               # Schema de Prisma
├── workers/              # Workers de procesamiento
└── docker/               # Configuración Docker
```

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run worker` - Worker de procesamiento de video
- `npm run db:generate` - Generar cliente de Prisma
- `npm run db:push` - Sincronizar schema con BD
- `npm run db:migrate` - Crear migración
- `npm run db:studio` - Abrir Prisma Studio

## 🐳 Docker

### Servicios

- **app**: Aplicación Next.js (puerto 3000)
- **worker**: Worker de procesamiento de video (múltiples réplicas)
- **postgres**: Base de datos PostgreSQL (puerto 5432)
- **redis**: Redis para colas y caché (puerto 6379)
- **nginx**: Reverse proxy y load balancer (puerto 80/443)
- **minio**: Almacenamiento compatible con S3 (puertos 9000/9001)

### Configuración

El archivo `docker/docker-compose.yml` define todos los servicios con límites de recursos. Para escalar workers:

```bash
docker-compose scale worker=3
```

## 📊 Sistema de Concurrencia

El sistema está diseñado para manejar múltiples usuarios concurrentes:

- **Máximo de usuarios simultáneos**: 10 (configurable)
- **Jobs por usuario**: 2 máximo en paralelo
- **Worker concurrency**: 3 jobs por worker
- **Workers recomendados**: 2-3 réplicas

### Monitoreo

Health check endpoint: `GET /api/health`

Métricas disponibles:
- Usuarios activos
- Tamaño de cola
- Estado de servicios (DB, Redis, Storage, Workers)

## 🔐 Autenticación

La aplicación usa NextAuth.js con Google OAuth 2.0. Los usuarios deben autenticarse con su cuenta de Google para acceder.

## 📝 Uso de la API

### Crear Proyecto
```bash
POST /api/projects
{
  "name": "My Project",
  "description": "Description"
}
```

### Agregar Clip
```bash
POST /api/clips
{
  "projectId": "project-id",
  "sourceUrl": "https://youtube.com/watch?v=...",
  "sourceType": "YOUTUBE",
  "startTime": 10,
  "endTime": 30,
  "order": 0,
  "title": "Clip 1"
}
```

### Iniciar Exportación
```bash
POST /api/export/process
{
  "projectId": "project-id",
  "clips": [...],
  "options": {
    "format": "mp4",
    "removeAudio": false,
    "notifySlack": true
  }
}
```

### Verificar Estado de Exportación
```bash
GET /api/export/{exportId}/status
```

## 🚨 Troubleshooting

### Error de conexión a BD
- Verificar que PostgreSQL esté corriendo
- Verificar `DATABASE_URL` en `.env`

### Worker no procesa videos
- Verificar que Redis esté corriendo
- Verificar que FFmpeg esté instalado
- Revisar logs del worker

### Error de autenticación
- Verificar credenciales de Google OAuth
- Verificar `NEXTAUTH_SECRET` y `NEXTAUTH_URL`

## 📄 Licencia

ISC
