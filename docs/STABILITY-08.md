# Estabilización 08 — Límite de solicitudes de autenticación

Fecha: 2026-11-13. SEG-006, primer alcance. Desarrollo en `dev`; no desplegado.

## Cambio preparado

- Login: exige `application/json`, limita el cuerpo a 8 KiB antes de acumularlo en memoria y valida email/contraseña con `loginSchema`.
- Registro: exige `application/json` y limita el cuerpo a 16 KiB antes de analizarlo. La validación de registro existente sigue aplicándose después de parsear.
- El límite cuenta bytes realmente recibidos y no depende de que `Content-Length` esté presente o sea correcto. JSON mal formado devuelve 400, tipo no admitido 415 y exceso 413.
- No se cambian cookies, contraseñas, cuentas, esquema de datos ni configuración de producción.

## Validación local

- `npm run typecheck`: correcto.
- ESLint focalizado en el lector JSON y las dos rutas: correcto.
- `npm run build`: correcto en Windows/Node 22. Next informa que omite typecheck durante build por `ignoreBuildErrors`; el typecheck anterior fue una ejecución independiente.
- `git diff --check`: correcto. No se ejecutaron pruebas automatizadas ni una validación Linux aislada; no se considera candidato a despliegue.

## Pendiente dentro de SEG-006

- No hay rate limiter en la aplicación. Un limitador local en memoria no coordina procesos ni reinicios, y confiar sin comprobación en `X-Forwarded-For` permite suplantar IP. Antes de fijar cuotas hay que inspeccionar la configuración efectiva del proxy y elegir una identidad/almacén que funcione para redes institucionales compartidas.
- `auth_token` usa `HttpOnly`, `SameSite=Lax` y `Secure` en producción. La protección de origen para todas las mutaciones autenticadas y la configuración TLS/proxy no quedan demostradas por esta revisión del código; requieren inventario operativo y una política compatible con clientes legítimos.
- No se ha ejecutado prueba de seguridad ni se ha publicado este cambio. Validar tipos, lint focalizado y build; después seguir el flujo aislado de Linux, backup/restauración y publicación descrito en [RELEASE-WORKFLOW](RELEASE-WORKFLOW.md).

## Reversión

El cambio solo afecta a login/registro. Si una integración legítima excede los límites, ajustar el tamaño con evidencia y repetir validación en `dev`; no retirar el límite en producción sin comprobar el tamaño real de solicitudes y el límite del proxy.
