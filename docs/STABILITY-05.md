# Estabilización 05 — Retirar seed público

Fecha: 2026-11-01. SEG-005. Desarrollo en dev y despliegue exclusivamente desde main.

## Alcance

- GET y POST de `/api/admin/seed` responden 410 sin importar BD, sesión ni variables de entorno. `/setup` redirige a login sin botón de inicialización.
- `db:admin-init` crea únicamente el primer administrador. Comprueba en una transacción que no existe ningún super_admin ni otra cuenta con el mismo email; no modifica ni promueve usuarios existentes.
- Se conserva `db:admin-password`, restringido a una cuenta super_admin existente y al correo seleccionado por el operador. Conserva actividad/rol/institución, hashea la contraseña y actualiza updatedAt. No reactiva cuentas.
- Ambos comandos exigen DB_URL de archivo local existente con ruta absoluta y contraseña operativa en entorno; rechazan contraseñas menores de 12 caracteres o mayores de 72 bytes UTF-8. No imprimen secretos, hashes ni errores internos de consultas.
- Sin migraciones, cambios de cuentas reales ni ejecución de comandos administrativos en producción durante esta entrega. Procedimiento en [ADMIN-OPERATIONS.md](ADMIN-OPERATIONS.md).

## Pruebas

Tres pruebas reprodujeron el comportamiento anterior del endpoint antes de corregir. Se añadieron 21 pruebas entre seed y operaciones administrativas: creación, repetición, administrador desactivado, correo ocupado, recuperación limitada, JWT anterior invalidado, contraseña inválida y selección explícita de BD. Suite total: 119 pruebas. Transacciones ensayadas en archivo SQLite temporal; pruebas del endpoint en memoria. Ninguna usa la BD local o productiva.

Validar tipos, lint, build y candidato de main en Linux. Ensayar allí los comandos reales y login/HTTP con BD sintética. Respaldar y verificar restauración antes de activar; conservar build previo. Las cuentas de producción deben quedar intactas.

## Límites y reversión

SEG-005 se cierra al validar la publicación (trigger restringido desde entrega 04, seed retirado en esta). No cierra SEG-004: la revocación persistente requiere reconciliar migraciones antes de añadir estado. Revertir a una versión anterior reabre el seed público; preferir corregir hacia adelante, o bloquear esa ruta antes de una reversión necesaria. Un restablecimiento de contraseña de un administrador desactivado no sustituye una decisión autorizada de reactivación.
