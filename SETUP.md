# Guía de Configuración

## Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/videodb"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Drive API (Opcional)
GOOGLE_DRIVE_API_KEY="your-google-drive-api-key"
GOOGLE_DRIVE_FOLDER_ID="your-folder-id"
GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"

# Slack Integration (Opcional)
SLACK_WEBHOOK_URL="your-slack-webhook-url"
SLACK_BOT_TOKEN="your-slack-bot-token"
SLACK_CHANNEL_ID="your-slack-channel-id"

# Redis
REDIS_URL="redis://localhost:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Processing
CONCURRENT_JOBS=3
MAX_JOBS_PER_USER=2
```

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google OAuth 2.0
4. Crea credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - URI de redirección autorizados: `http://localhost:3000/api/auth/callback/google`
5. Copia el Client ID y Client Secret a tu `.env`

## Configuración de PostgreSQL

```bash
# Con Docker
docker run --name postgres-video -e POSTGRES_PASSWORD=password -e POSTGRES_DB=videodb -p 5432:5432 -d postgres:15-alpine

# O instala PostgreSQL localmente
```

## Configuración de Redis

```bash
# Con Docker
docker run --name redis-video -p 6379:6379 -d redis:7-alpine

# O instala Redis localmente
```

## Instalación de FFmpeg

### macOS
```bash
brew install ffmpeg
```

### Linux
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Windows
Descarga desde [ffmpeg.org](https://ffmpeg.org/download.html)

## Pasos de Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Prisma:
```bash
npx prisma generate
npx prisma db push
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. En otra terminal, iniciar el worker:
```bash
npm run worker
```

## Próximos Pasos

La aplicación está lista para desarrollo. Puedes:

1. Acceder a `http://localhost:3000`
2. Iniciar sesión con Google
3. Crear proyectos y agregar clips
4. Exportar videos

Para producción, usa Docker Compose:
```bash
cd docker
docker-compose up -d
```

