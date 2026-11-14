# Estabilización 08 — Límite de solicitudes de autenticación

Fecha: 2026-11-13. SEG-006, primer alcance. Desarrollo en `dev`, integración y despliegue desde `main` `ca1814a509286fb3d0a7e6f2b79ec94f73517dad`.

## Cambio preparado

- Login: exige `application/json`, limita el cuerpo a 8 KiB antes de acumularlo en memoria y valida email/contraseña con `loginSchema`.
- Registro: exige `application/json` y limita el cuerpo a 16 KiB antes de analizarlo. La validación de registro existente sigue aplicándose después de parsear.
- El límite cuenta bytes realmente recibidos y no depende de que `Content-Length` esté presente o sea correcto. JSON mal formado devuelve 400, tipo no admitido 415 y exceso 413.
- No se cambian cookies, contraseñas, cuentas, esquema de datos ni configuración de producción.

## Validación

- Linux aislado: `bun install --frozen-lockfile`, typecheck y lint focalizado pasaron; Next informa que omite typecheck en build, por lo que se ejecutó aparte.
- Se añadieron cinco pruebas del lector: límite exacto, exceso sin `Content-Length`, longitud declarada excesiva, bytes UTF-8 y JSON mal formado. Las cinco pasan en Linux.
- Suite Linux con Node 22: 11 archivos y 175 pruebas aprobadas. Se actualizaron pruebas para declarar `Content-Type` y respetar las transiciones vigentes; el test de transacción usa SQLite temporal en disco.
- El servidor usa Bun 1.3.14. El build del candidato pasó en un worktree aislado de la VM con esa versión y dependencias congeladas. Vitest ejecutado con Bun 1.3.14 falla al importar Zod; por ello las pruebas de release se ejecutaron con Node 22. Fijar runtime y ejecutor continúa en CAL-001.
- Desplegado el 13/11/2026. El backup `/opt/convoca-backups/auth-body-20261113-ca1814a` contiene snapshot SQLite, código/configuración y build previo. La copia de BD y el ensayo de restauración pasaron `integrity_check`; el esquema y conteos del snapshot/restauración coincidieron. Backup protegido con directorio 700 y archivos 600.
- Verificación tras activar: servicio activo, cero reinicios adicionales; `/login` y `/api/programs` públicos 200; login/registro con cuerpo excesivo 413 y payload inválido 400. SQLite conservó integridad, esquema, dueño `nexouser` y modo `660`. Sin migraciones ni modificación de cuentas/datos de producción.

## Pendiente dentro de SEG-006

- Revisión de solo lectura de HAProxy (13/11/2026): versión 2.9.10, servicio activo en `proxyinversoapp`. El frontend global usa `option forwardfor`; `nexo_backend` apunta a `10.46.6.74:3000`, pero no contiene reglas visibles para eliminar un `X-Forwarded-For` recibido ni establecer `X-Real-IP`. Otros backends sí eliminan el XFF entrante y establecen la IP fuente. No se hallaron reglas HAProxy de rate limiting. Tratar XFF como no confiable hasta corregir y verificar el backend CONVOCA.
- Las mutaciones de las rutas API aún no validan `Origin` ni `Sec-Fetch-Site`. La cookie `auth_token` usa `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Añadir verificación de origen con el dominio canónico y pruebas que cubran las mutaciones, manteniendo los clientes legítimos.
- No se modificó ni recargó HAProxy en esta entrega. Antes de usar IP para límites, hacer un cambio acotado en `nexo_backend`: eliminar XFF entrante y propagar una IP fuente confiable; respaldar configuración, validar con `haproxy -c`, recargar y comprobar rutas. Después decidir el limitador considerando un único proceso/reinicios y redes institucionales compartidas.
- Esta entrega solo cubre límites de cuerpo y validación inicial. Rate limiting, origen/CSRF y el ajuste del proxy siguen pendientes.

## Reversión

El cambio solo afecta a login/registro. Si una integración legítima excede los límites, ajustar el tamaño con evidencia y repetir validación en `dev`; no retirar el límite en producción sin comprobar el tamaño real de solicitudes y el límite del proxy.
