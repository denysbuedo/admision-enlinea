# Inicialización y recuperación administrativa

Estas operaciones requieren acceso autorizado al servidor y a SQLite. No existe inicialización web: GET/POST `/api/admin/seed` devuelven 410 sin acceder a BD y `/setup` redirige a `/login`.

## Preparación

1. Comprobar servidor, directorio y archivo de BD; obtener respaldo consistente y verificar recuperación según el flujo de publicación.
2. Ejecutar desde `/opt/admision-enlinea` como el usuario del servicio (`nexouser`) con Bun disponible en PATH. No ejecutar como una tarea automática de cada despliegue.
3. Especificar DB_URL con ruta absoluta a un archivo SQLite **ya existente**. No se acepta una ruta relativa, archivo nuevo, URL remota ni fallback. El comando no crea tablas ni ejecuta migraciones.

En una instalación nueva, preparar primero una BD con el esquema del repositorio. En la instalación actual, el ledger de migraciones requiere reconciliación: no ejecutar `db:migrate` sobre producción como parte de estas operaciones.

## Crear el primer administrador

Solo para instalaciones sin ningún super_admin, incluso desactivado. No sobrescribe contraseñas ni promueve cuentas que ocupen el correo. Una segunda ejecución falla sin cambiar usuarios. ADMIN_EMAIL es opcional; conserva `dinfo@mes.gob.cu` como predeterminado para compatibilidad.

Ejemplo Bash, en una sesión del usuario del servicio. Introducir una contraseña aleatoria de al menos 12 caracteres y como máximo 72 bytes UTF-8, sin ponerla en el historial ni en argumentos:

```bash
cd /opt/admision-enlinea
export PATH="/home/nexouser/.bun/bin:$PATH"
export DB_URL='file:/opt/admision-enlinea/sqlite.db'
export ADMIN_EMAIL='dinfo@mes.gob.cu'
read -r -s -p 'Contraseña inicial: ' ADMIN_INITIAL_PASSWORD
printf '\n'
export ADMIN_INITIAL_PASSWORD
bun run db:admin-init
unset ADMIN_INITIAL_PASSWORD
```

El código de salida es 0 al crear; 1 si se rechaza o falla. El mensaje nunca incluye contraseña ni hash. La comprobación de administrador existente y la creación se hacen dentro de una transacción de escritura.

## Recuperar una contraseña administrativa

Primero verificar el correo de la cuenta autorizada. El comando solo actualiza una cuenta que ya sea super_admin. No crea usuarios, cambia roles, instituciones ni reactivaciones. Mantiene el nombre del comando anterior (`db:admin-password`), ahora con DB_URL absoluto obligatorio y selección opcional por ADMIN_EMAIL.

```bash
cd /opt/admision-enlinea
export PATH="/home/nexouser/.bun/bin:$PATH"
export DB_URL='file:/opt/admision-enlinea/sqlite.db'
export ADMIN_EMAIL='dinfo@mes.gob.cu'
read -r -s -p 'Nueva contraseña: ' ADMIN_PASSWORD
printf '\n'
export ADMIN_PASSWORD
bun run db:admin-password
unset ADMIN_PASSWORD
```

La contraseña se hashea con bcrypt y se actualiza updatedAt; las sesiones previas dejan de coincidir con el estado de la cuenta. Verificar el acceso autorizado después de una recuperación real. Si la cuenta está desactivada, seguirá sin poder iniciar sesión: revisar la causa y gestionar una reactivación explícita y autorizada por separado, sin crear otro administrador para eludirla.

Si el comando falla, verificar primero el código de salida, ruta de BD y esquema. No publicar logs de consultas, hashes ni variables de entorno. Las pruebas y simulacros se realizan con archivos temporales y cuentas sintéticas, nunca repitiendo inicializaciones o cambios de contraseña sobre cuentas reales por probar.
