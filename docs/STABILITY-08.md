# Estabilización 08 — Límite de solicitudes de autenticación

Fecha: 2026-11-13. SEG-006, primer alcance. Desarrollo en `dev`; no desplegado.

## Cambio preparado

- Login: exige `application/json`, limita el cuerpo a 8 KiB antes de acumularlo en memoria y valida email/contraseña con `loginSchema`.
- Registro: exige `application/json` y limita el cuerpo a 16 KiB antes de analizarlo. La validación de registro existente sigue aplicándose después de parsear.
- El límite cuenta bytes realmente recibidos y no depende de que `Content-Length` esté presente o sea correcto. JSON mal formado devuelve 400, tipo no admitido 415 y exceso 413.
- No se cambian cookies, contraseñas, cuentas, esquema de datos ni configuración de producción.

## Validación

- Linux aislado desde `dev`: `bun install --frozen-lockfile`, typecheck, lint focalizado y build pasaron. Next informa que omite typecheck durante build; se ejecutó de forma independiente.
- Se añadieron cinco pruebas del lector: límite exacto, exceso sin `Content-Length`, longitud declarada excesiva, bytes UTF-8 y JSON mal formado. Las cinco pasan en Linux.
- La suite completa reporta 54 pruebas aprobadas, cuatro fallidas y seis archivos que no cargan. Se repitió contra `origin/main` en el mismo entorno y obtuvo los mismos fallos: mocks Zod y expectativas antiguas de transiciones. Ninguno corresponde a este cambio, pero el flujo de release bloquea integración/publicación mientras la suite general falle.
- No hay cambios en producción. Tests y esta evidencia están pendientes de commit.

## Pendiente dentro de SEG-006

- No hay rate limiter en la aplicación. Un limitador local en memoria no coordina procesos ni reinicios, y confiar sin comprobación en `X-Forwarded-For` permite suplantar IP. Antes de fijar cuotas hay que inspeccionar la configuración efectiva del proxy y elegir una identidad/almacén que funcione para redes institucionales compartidas.
- `auth_token` usa `HttpOnly`, `SameSite=Lax` y `Secure` en producción. La protección de origen para todas las mutaciones autenticadas y la configuración TLS/proxy no quedan demostradas por esta revisión del código; requieren inventario operativo y una política compatible con clientes legítimos.
- No se ha ejecutado prueba de seguridad ni se ha publicado este cambio. Una vez resueltos los fallos base, seguir backup/restauración y publicación descritos en [RELEASE-WORKFLOW](RELEASE-WORKFLOW.md).

## Reversión

El cambio solo afecta a login/registro. Si una integración legítima excede los límites, ajustar el tamaño con evidencia y repetir validación en `dev`; no retirar el límite en producción sin comprobar el tamaño real de solicitudes y el límite del proxy.
