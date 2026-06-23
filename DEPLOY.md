# Deploy - Admision en Linea (Nexo)

Guia paso a paso para desplegar en Ubuntu 22.04.

Escenario de produccion:

- URL publica: `https://nexo.mes.gob.cu`
- El certificado TLS lo termina un HAProxy remoto.
- Este servidor solo expone la aplicacion Next.js por un puerto TCP.
- Puerto recomendado de la app: `3000`.

---

## 1. Conectarse al servidor

```bash
ssh root@<IP_DEL_SERVIDOR>
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

Si el servicio systemd no encontrara `bun`, confirma su ruta:

```bash
which bun
```

Y usa esa ruta absoluta en `ExecStart`.

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

Contenido:

```env
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DB_URL=file:sqlite.db
JWT_SECRET=<CAMBIAR_POR_UN_SECRETO_REAL>
ADMIN_INITIAL_PASSWORD=<CAMBIAR_POR_UNA_CONTRASENA_INICIAL_SEGURA>
```

Para generar secretos seguros:

```bash
openssl rand -hex 32
```

Copia valores distintos para `JWT_SECRET` y `ADMIN_INITIAL_PASSWORD`.

---

## 8. Ejecutar migraciones y seed inicial

Si es la primera vez que despliegas:

```bash
bun run db:migrate
```

Despues de levantar la app, crea el super admin inicial:

```bash
curl --noproxy '*' -X POST http://127.0.0.1:3000/api/admin/seed
```

El correo del admin inicial es `admin@nexo.com`. La contrasena sera el valor configurado en `ADMIN_INITIAL_PASSWORD`.

Para cambiar la contrasena del admin existente desde el servidor:

```bash
cd /opt/admision-enlinea
ADMIN_PASSWORD='<NUEVA_CONTRASENA_SEGURA>' bun run db:admin-password
```

---

## 9. Construir la app

```bash
bun run build
```

Verifica que no haya errores.

---

## 10. Configurar systemd para auto-arranque

Volver a root:

```bash
exit
```

Crear el servicio:

```bash
nano /etc/systemd/system/admision-enlinea.service
```

Contenido:

```ini
[Unit]
Description=Admision en Linea (Next.js)
After=network.target

[Service]
Type=simple
User=nexouser
Group=nexouser
WorkingDirectory=/opt/admision-enlinea
EnvironmentFile=/opt/admision-enlinea/.env.production
ExecStart=/usr/bin/env bun run start -- -H 0.0.0.0 -p 3000
Restart=always
RestartSec=5

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

## 11. Configurar firewall

Como el TLS y el dominio publico estan delante en un HAProxy remoto, este servidor no necesita abrir `80` ni `443` salvo que tambien vaya a recibir trafico directo.

Configuracion recomendada, restringiendo el puerto de la app a la IP del HAProxy:

```bash
ufw allow 22/tcp
ufw allow from <IP_HAPROXY> to any port 3000 proto tcp
ufw enable
ufw status
```

Si aun no se conoce la IP del HAProxy y necesitas una prueba temporal:

```bash
ufw allow 3000/tcp
ufw status
```

Cuando se conozca la IP del HAProxy, elimina la regla abierta y deja solo la regla restringida:

```bash
ufw delete allow 3000/tcp
ufw allow from <IP_HAPROXY> to any port 3000 proto tcp
ufw status
```

---

## 12. Configuracion esperada en el HAProxy remoto

El HAProxy remoto debe:

- Terminar TLS para `nexo.mes.gob.cu`.
- Enviar el trafico hacia `http://<IP_DEL_SERVIDOR>:3000`.
- Preservar el encabezado `Host: nexo.mes.gob.cu`.
- Enviar `X-Forwarded-Proto: https`.
- Enviar `X-Forwarded-For` con la IP real del cliente.

Ejemplo orientativo de backend:

```haproxy
backend nexo_backend
    option httpchk GET /
    http-request set-header X-Forwarded-Proto https
    server nexo1 <IP_DEL_SERVIDOR>:3000 check
```

La configuracion final del HAProxy puede variar segun como este definido el frontend compartido y la gestion de certificados.

---

## 13. Verificar funcionamiento

Desde el propio servidor:

```bash
curl -I http://127.0.0.1:3000
```

Desde el servidor HAProxy o desde una maquina con acceso al puerto:

```bash
curl -I http://<IP_DEL_SERVIDOR>:3000 -H "Host: nexo.mes.gob.cu" -H "X-Forwarded-Proto: https"
```

Cuando el HAProxy este apuntando al servidor, abrir:

```text
https://nexo.mes.gob.cu
```

---

## 14. Actualizaciones futuras

```bash
# Conectarse al servidor
ssh nexouser@<IP_DEL_SERVIDOR>

cd /opt/admision-enlinea

# Actualizar codigo
git pull origin main

# Actualizar dependencias si cambiaron
bun install

# Ejecutar migraciones si hubo cambios de base de datos
bun run db:migrate

# Reconstruir
bun run build

# Reiniciar servicio
sudo systemctl restart admision-enlinea

# Ver logs
sudo journalctl -u admision-enlinea -f
```

Si el usuario `nexouser` no tiene `sudo`, reinicia el servicio como `root`.

---

## 15. Comandos utiles

| Accion | Comando |
|--------|---------|
| Ver estado del servicio | `systemctl status admision-enlinea` |
| Detener | `systemctl stop admision-enlinea` |
| Iniciar | `systemctl start admision-enlinea` |
| Reiniciar | `systemctl restart admision-enlinea` |
| Ver logs | `journalctl -u admision-enlinea -f` |
| Ver logs ultimas 100 lineas | `journalctl -u admision-enlinea -n 100` |
| Ver puertos abiertos | `ss -tlnp` |
| Probar app local | `curl -I http://127.0.0.1:3000` |
| Probar app como HAProxy | `curl -I http://<IP_DEL_SERVIDOR>:3000 -H "Host: nexo.mes.gob.cu" -H "X-Forwarded-Proto: https"` |

---

## Estructura de archivos en el servidor

```text
/opt/admision-enlinea/
├── .env.production          # Variables de entorno
├── sqlite.db                # Base de datos SQLite
├── src/                     # Codigo fuente
├── .next/                   # Build de Next.js generado
├── node_modules/            # Dependencias
└── package.json

/etc/systemd/system/
└── admision-enlinea.service
```

---

## Resumen de URLs

| URL | Descripcion |
|-----|-------------|
| `https://nexo.mes.gob.cu` | URL publica via HAProxy remoto |
| `http://<IP_DEL_SERVIDOR>:3000` | App expuesta para el HAProxy |
| `http://127.0.0.1:3000` | App local en el servidor |
| `http://127.0.0.1:3000/api/admin/seed` | POST para crear admin inicial |
