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
- Preparado en `dev` un guard de origen para todas las rutas API mutables: login, registro, logout, administración de usuarios/universidades, notificaciones, programas y postulaciones. Rechaza `Sec-Fetch-Site: cross-site`, `Origin: null`, orígenes mal formados y cualquier origen distinto del dominio canónico en producción. Permite clientes sin `Origin` para conservar integraciones no navegador; la cookie `auth_token` continúa usando `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Se añadieron seis pruebas unitarias del helper; aún debe completar validación Linux y release antes de considerarlo desplegado.
- Validación Linux del commit `393bd73`: instalación congelada con Bun 1.3.14, typecheck, lint focalizado, suite Node 20 (12 archivos, 181 pruebas) y build de producción aprobados. La base de pruebas quedó aislada en `/tmp/convoca-test-393bd73.db`. El lint global local mantiene dos errores preexistentes ajenos al cambio (`programs/page.tsx`, `useAuth.ts`). La activación de producción sigue pendiente.
- No se modificó ni recargó HAProxy en esta entrega. Antes de usar IP para límites, hacer un cambio acotado en `nexo_backend`: eliminar XFF entrante y propagar una IP fuente confiable; respaldar configuración, validar con `haproxy -c`, recargar y comprobar rutas. Después decidir el limitador considerando un único proceso/reinicios y redes institucionales compartidas.
- El rate limiting y el saneamiento de cabeceras en HAProxy siguen pendientes. El cambio de origen/CSRF pasó validación y está en `dev`, todavía no desplegado.

## Reversión

La protección preparada solo rechaza mutaciones que declaran un origen cruzado/no confiable; clientes no navegador sin `Origin` siguen admitidos. Si una integración legítima envía un `Origin` distinto del dominio canónico, registrar su origen y revisar el caso antes de ampliar la lista. Los límites de cuerpo de login/registro ya desplegados se ajustan solo con evidencia y validación en `dev`.
