# Guía Paso a Paso para Build Local

Esta guía te ayudará a hacer el build de la aplicación localmente, paso a paso.

## 📋 Prerrequisitos

Asegúrate de tener instalado:
- **Node.js** 20+ (verifica con `node --version`)
- **npm** o **yarn** (verifica con `npm --version`)
- **PostgreSQL** (opcional, para desarrollo puedes usar Docker)
- **Redis** (opcional, para desarrollo puedes usar Docker)

## 🚀 Pasos para el Build Local

### Paso 1: Limpiar Instalaciones Previas (IMPORTANTE)

Si tienes problemas previos, limpia todo primero:

```bash
cd lime-video-tool

# Eliminar node_modules y cache
rm -rf node_modules package-lock.json .next node_modules/.cache
```

### Paso 2: Instalar Dependencias Correctas

```bash
# Instalar todas las dependencias base
npm install

# Verificar que Tailwind CSS v3 esté instalado (NO v4)
npm list tailwindcss

# Si muestra v4, forzar instalación de v3:
npm uninstall tailwindcss tailwindcss-animate
npm install tailwindcss@3.4.1 tailwindcss-animate@1.0.7
```

### Paso 3: Verificar Configuración de PostCSS

Verifica que `postcss.config.js` tenga la configuración correcta:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},    // NO '@tailwindcss/postcss'
    autoprefixer: {},
  },
}
```

### Paso 4: Configurar Variables de Entorno

```bash
# Copiar la plantilla
cp .env.example .env

# Editar el archivo .env con tus valores
# Usa un editor de texto de tu preferencia
nano .env
# o
code .env
```

**Valores mínimos requeridos para desarrollo:**
- `DATABASE_URL` - URL de conexión a PostgreSQL
- `NEXTAUTH_SECRET` - Genera uno con: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000`
- `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` - Para autenticación
- `REDIS_URL` - `redis://localhost:6379`

### Paso 5: Configurar Base de Datos

```bash
# Generar el cliente de Prisma
npm run db:generate

# Sincronizar el schema con la base de datos
npm run db:push
```

**Si no tienes PostgreSQL corriendo localmente, puedes usar Docker:**
```bash
docker run --name postgres-video \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=videodb \
  -p 5432:5432 -d postgres:15-alpine
```

### Paso 6: Limpiar Builds Anteriores

```bash
# Eliminar carpeta .next si existe
rm -rf .next

# Limpiar cache de Next.js
rm -rf .next/cache
```

### Paso 7: Ejecutar el Build

**IMPORTANTE:** Usa siempre el flag `--webpack` para evitar problemas con Turbopack:

```bash
npm run build -- --webpack
```

### Paso 8: Verificar el Build

Si el build es exitoso, verás un mensaje como:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully
```

La carpeta `.next` se habrá creado con el build de producción.

### Paso 9: Iniciar el Servidor de Producción (Opcional)

```bash
npm run start
```

Esto iniciará el servidor en `http://localhost:3000`

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module '@tailwindcss/postcss'"

Este error ocurre cuando hay un conflicto entre Tailwind CSS v4 (que requiere @tailwindcss/postcss) y Tailwind CSS v3.

**Solución completa:**
```bash
# 1. Desinstalar dependencias de Tailwind
npm uninstall tailwindcss tailwindcss-animate @tailwindcss/postcss

# 2. Instalar Tailwind CSS v3 (estable)
npm install tailwindcss@3.4.1 tailwindcss-animate@1.0.7

# 3. Verificar que postcss.config.js use la sintaxis correcta
# Debe tener:
# module.exports = {
#   plugins: {
#     tailwindcss: {},
#     autoprefixer: {},
#   },
# }

# 4. Limpiar y rebuild
rm -rf .next node_modules/.cache
npm run build -- --webpack
```

### Error: "Turbopack/Webpack config conflict"

**Solución:**
Agrega `--webpack` al comando:
```bash
npm run build -- --webpack
```

### Error: "Cannot find module"

**Solución:**
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json .next
npm install
npm run build -- --webpack
```

### Error: "Database connection failed"

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Verifica que `DATABASE_URL` en `.env` sea correcta
3. Si usas Docker:
   ```bash
   docker ps | grep postgres
   ```

### Error: "Prisma client not generated"

**Solución:**
```bash
npm run db:generate
```

### Error: "Type errors"

**Solución:**
```bash
# Verificar tipos de TypeScript
npx tsc --noEmit

# Si hay errores, revisa los archivos mencionados
```

## 📦 Estructura del Build

Después de un build exitoso, encontrarás:

```
lime-video-tool/
├── .next/              # Carpeta de build (generada)
│   ├── static/         # Assets estáticos
│   ├── server/         # Código del servidor
│   └── ...
├── node_modules/       # Dependencias
└── ...
```

## ✅ Verificación Final

Después del build, puedes verificar que todo está correcto:

1. **Build exitoso**: No hay errores en la consola
2. **Carpeta .next creada**: Verifica con `ls -la .next`
3. **Servidor inicia**: `npm run start` debe iniciar sin errores

## 🎯 Comandos Útiles

```bash
# Desarrollo local
npm run dev              # Servidor de desarrollo

# Build y producción
npm run build -- --webpack  # Build de producción (SIEMPRE con --webpack)
npm run start           # Servidor de producción

# Base de datos
npm run db:generate     # Generar cliente Prisma
npm run db:push         # Sincronizar schema
npm run db:migrate      # Crear migración
npm run db:studio       # Abrir Prisma Studio

# Utilidades
npm run lint            # Verificar código
```

## 📝 Notas Importantes

1. **El build puede tardar varios minutos** la primera vez
2. **Asegúrate de tener suficiente espacio** (al menos 500MB libres)
3. **El archivo `.env` NO debe estar en Git** (ya está en `.gitignore`)
4. **Para producción**, asegúrate de usar valores seguros en `.env`
5. **SIEMPRE usa `--webpack`** para el build para evitar problemas con Turbopack

## 🔄 Comando de Build Completo (Desde Cero)

Si quieres empezar completamente desde cero:

```bash
# 1. Limpiar todo
cd lime-video-tool
rm -rf node_modules package-lock.json .next node_modules/.cache

# 2. Instalar dependencias
npm install

# 3. Asegurar Tailwind CSS v3
npm uninstall tailwindcss tailwindcss-animate 2>/dev/null
npm install tailwindcss@3.4.1 tailwindcss-animate@1.0.7

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 5. Generar Prisma client
npm run db:generate

# 6. Build
npm run build -- --webpack
```

## 🆘 ¿Aún tienes problemas?

1. **Revisa los logs completos del build** para identificar el error específico
2. **Verifica que todas las dependencias estén instaladas**: `npm list`
3. **Asegúrate de estar usando Node.js 20+**: `node --version`
4. **Verifica la versión de Tailwind CSS**: `npm list tailwindcss` (debe ser v3.x)
5. **Limpia todo y reinstala desde cero** (ver comando arriba)
