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

## Resultado de publicación

Desplegado desde main `2e663bb` (implementación dev `9cf338f`). Pasaron 119 pruebas, typecheck, lint del cambio y build local; main pasó nuevamente 119 pruebas, typecheck y build en Linux. Los comandos reales se ejecutaron como nexouser en una BD sintética: inicialización única, repetición rechazada, recuperación, login nuevo, token anterior rechazado, rechazo de reset sobre aspirante, preservación de cuenta desactivada y ausencia de secretos en salida. GET/POST seed denegados tanto sin sesión como con administrador; sin cambios de usuarios. Servicio temporal detenido antes del despliegue.

Respaldo/restauración con integridad y conteos verificados en `/opt/convoca-backups/security-05-20261101/restore-drill/`; archivo de código/configuración/build verificado y build anterior en `next-before`. SQLite coincidió byte a byte con la copia tomada con el servicio detenido antes de activar. No se ejecutaron inicialización ni recuperación sobre producción.

Verificación pública posterior a activar: GET/POST seed 410, setup redirige a login, páginas públicas 200 sin errores JS. Se conservan catálogo published, rechazo de sesiones inválidas, trigger restringido y bloqueo de registro administrativo. No se cambiaron contraseñas, cuentas ni secreto JWT de producción.

SEG-005 cerrado. Siguiente bloque: diagnóstico y reconciliación de la línea base de migraciones (DAT-008), empezando por comparación de esquema en solo lectura y ensayo en una copia; no ejecutar migraciones sobre producción hasta validar esa reconciliación. Después, completar la revocación persistente pendiente de SEG-004.
