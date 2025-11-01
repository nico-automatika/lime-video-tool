# Docker Compose - Guía Rápida

## 🚀 Inicio Rápido

### Comando para Levantar Todo

Desde el directorio `docker/`:

```bash
cd docker
docker-compose up -d
```

O desde la raíz del proyecto:

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Verificar Estado

```bash
docker-compose ps
```

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo la app
docker-compose logs -f app
```

### Detener Todo

```bash
docker-compose down
```

## ⚠️ Requisitos Previos

1. **Archivo `.env` configurado** en la raíz del proyecto (`lime-video-tool/.env`)
2. **Docker y Docker Compose** instalados y corriendo
3. **Puertos libres**: 3000, 5432, 6379, 80, 443, 9000, 9001

## 📝 Pasos Completos

Ver `DOCKER-GUIDE.md` en la raíz del proyecto para instrucciones detalladas.

