# Deploy - Admisión en Línea (Nexo)

Guía paso a paso para desplegar en Ubuntu 22.04.

---

## 1. Conectarse al servidor

```bash
ssh root@<IP_O_DOMINIO>
```

---

## 2. Actualizar sistema e instalar dependencias base

```bash
apt update && apt upgrade -y
apt install -y curl git build-essential python3 make g++ ufw
```

---

## 3. Instalar Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
# Debe mostrar v20.x.x
```

### Instalar Bun

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun --version
```

---

## 4. Crear usuario no root

```bash
useradd -m -s /bin/bash nexouser
mkdir -p /opt/admision-enlinea
chown nexouser:nexouser /opt/admision-enlinea
```

---

## 5. Clonar repositorio (rama main)

```bash
su - nexouser
git clone https://github.com/denysbuedo/admision-enlinea.git /opt/admision-enlinea
cd /opt/admision-enlinea
git checkout main
```

---

## 6. Instalar dependencias

```bash
bun install
```

---

## 7. Crear archivo de variables de entorno

```bash
nano /opt/admision-enlinea/.env.production
```

Contenido exacto:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DB_URL=file:sqlite.db
JWT_SECRET=<CAMBIAR_POR_UN_SECRETO_REAL>
```

Para generar un `JWT_SECRET` seguro:

```bash
openssl rand -hex 32
```

Copia el resultado y reemplaza `<CAMBIAR_POR_UN_SECRETO_REAL>`.

---

## 8. Ejecutar migraciones y seed (opcional)

Si es la primera vez que despliegas y necesitas crear el super admin:

```bash
bun run db:migrate
```

Para crear el admin inicial, ejecuta este comando una vez que la app esté corriendo:

```bash
curl -X POST http://localhost:3000/api/admin/seed
```

Credenciales del admin: `admin@nexo.com` / `Admin123!`

---

## 9. Construir la app

```bash
bun run build
```

Verifica que no haya errores.

---

## 10. Configurar Nginx como reverse proxy

```bash
exit  # volver a root
apt install -y nginx
nano /etc/nginx/sites-available/admision-enlinea
```

Contenido exacto (reemplaza `tu-dominio-o-ip`):

```nginx
server {
    listen 80;
    server_name tu-dominio-o-ip;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar el sitio:

```bash
ln -sf /etc/nginx/sites-available/admision-enlinea /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## 11. Configurar systemd para auto-arranque

```bash
nano /etc/systemd/system/admision-enlinea.service
```

Contenido exacto:

```ini
[Unit]
Description=Admision en Linea (Next.js)
After=network.target

[Service]
Type=simple
User=nexouser
Group=nexouser
WorkingDirectory=/opt/admision-enlinea
ExecStart=/usr/bin/env bun start
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/opt/admision-enlinea/.env.production

[Install]
WantedBy=multi-user.target
```

Levantar el servicio:

```bash
systemctl daemon-reload
systemctl enable --now admision-enlinea
systemctl status admision-enlinea
```

Ver logs en tiempo real:

```bash
journalctl -u admision-enlinea -f
```

Presiona `Ctrl+C` para salir.

---

## 12. Configurar firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 13. Verificar funcionamiento

Abre el navegador en `http://tu-dominio-o-ip`. Deberías ver la página de landing.

---

## 14. Actualizaciones futuras

```bash
# Conectarse al servidor
ssh nexouser@<IP_O_DOMINIO>

# O si estás como root:
su - nexouser
cd /opt/admision-enlinea

# Actualizar código
git pull origin main

# Actualizar dependencias si cambiaron
bun install

# Reconstruir
bun run build

# Reiniciar servicio
sudo systemctl restart admision-enlinea

# Ver logs
sudo journalctl -u admision-enlinea -f
```

---

## 15. Comandos útiles

| Acción | Comando |
|--------|---------|
| Ver estado del servicio | `systemctl status admision-enlinea` |
| Detener | `systemctl stop admision-enlinea` |
| Iniciar | `systemctl start admision-enlinea` |
| Reiniciar | `systemctl restart admision-enlinea` |
| Ver logs | `journalctl -u admision-enlinea -f` |
| Ver logs últimas 100 líneas | `journalctl -u admision-enlinea -n 100` |
| Probar Nginx | `nginx -t` |
| Recargar Nginx | `systemctl reload nginx` |
| Ver puertos abiertos | `ss -tlnp` |

---

## Estructura de archivos en el servidor

```
/opt/admision-enlinea/
├── .env.production          # Variables de entorno
├── sqlite.db                # Base de datos SQLite
├── src/                     # Código fuente
├── .next/                   # Build de Next.js (generado)
├── node_modules/            # Dependencias
└── package.json

/etc/systemd/system/
└── admision-enlinea.service

/etc/nginx/sites-available/
└── admision-enlinea
```

---

## Resumen de URLs internas

| URL | Descripción |
|-----|-------------|
| `http://127.0.0.1:3000` | App corriendo (interno) |
| `http://tu-dominio-o-ip` | App vía Nginx (público) |
| `http://localhost:3000/api/admin/seed` | POST para crear admin inicial |
