# Estabilización 04 — JWT y validación de sesiones

Fecha: 2026-10-31. Desarrollo en dev; candidato validado y publicado desde main.

## Alcance y compatibilidad

- Elimina default_secret. Firma exige JWT_SECRET de al menos 32 bytes, sin espacios exteriores y con diversidad básica; estas comprobaciones no prueban entropía. Usar un secreto aleatorio generado criptográficamente. Producción supera el preflight sin divulgar ni cambiar su valor.
- Firma/verificación HS256 explícita; validación de tipos, roles, identificadores, iat, exp y duración máxima de siete días. Los tokens inválidos, vencidos, de otro algoritmo o sin los nuevos campos se rechazan.
- Cada verificación consulta al usuario vigente: cuenta existente y activa, email, rol e institución coincidentes. Una huella HMAC del estado de seguridad vincula el token a la contraseña hasheada, permisos, actividad y updatedAt. El JWT no contiene contraseña ni hash de contraseña.
- **Las sesiones anteriores dejan de ser válidas al desplegar; los usuarios deben volver a iniciar sesión.** No se cambian contraseñas ni cuentas. Cookie sigue HttpOnly/Secure en producción/SameSite=Lax, siete días.
- Se retira la configuración NextAuth no utilizada: no tenía rutas ni consumidores. El login existente y getSession permanecen como único flujo usado por la aplicación.
- SSE usa auth_token o Bearer; valida antes de abrir y de entregar cada evento; comprueba conexiones inactivas cada 30 segundos y libera suscripciones al cerrar/cancelar. El trigger queda restringido a administrador vigente: al alinear la cookie del stream no se deja abierto el envío anónimo.
- No hay migraciones ni escrituras de sesión en la BD; se añade una lectura por verificación. Fallos de BD/verificación deniegan acceso.

## Pruebas y despliegue

37 pruebas nuevas de autenticación/handlers/stream con SQLite en memoria. Total 98. Incluyen login real del handler, firma/caducidad/claims, configuración ausente/débil, rotación, tokens antiguos, usuarios borrados/desactivados, cambios de contraseña/rol/institución/email, cookies, entrega/revocación/cancelación de SSE y trigger.

Ejecutar typecheck, lint y build; validar main en Linux y HTTP con BD/secreto sintéticos. Respaldo consistente y ensayo de restauración antes de activar. No crear cuentas ni probar contraseñas reales en producción.

## Pendientes y límites

SEG-004 queda **parcial**, no cerrado: se requiere contador persistente de versión de sesión o registro de revocación para impedir definitivamente la reactivación de tokens si se restaura exactamente el estado anterior de cuenta (incluido updatedAt). Los procedimientos que cambien actividad/permisos deben actualizar updatedAt; el reseteo de contraseña existente ya lo hace. La precisión temporal actual es de segundos. No afirmar revocación irreversible con esta huella sin estado adicional.

SEG-005 parcial: trigger protegido; seed público sigue pendiente. Alta institucional, rate limiting y demás riesgos del roadmap no se consideran resueltos. La rotación de secreto se ensaya en pruebas, no se realiza en producción: preparar nuevo secreto fuera de logs, actualizar entorno protegido y reiniciar con backup; todos deben autenticarse de nuevo. Revertir a código anterior puede volver a aceptar tokens antiguos, por lo que no es una reversión de seguridad neutra; preferir corrección hacia adelante y planificar rotación si fuese inevitable.

## Resultado de publicación

Desplegado desde main `7e42aac` (implementación dev `056a48f`, corrección de codificación de textos en dev `4b072ea`). Pasaron 98 pruebas, typecheck, lint del cambio y build local; el candidato definitivo pasó de nuevo 98 pruebas, typecheck y build en Linux. Ensayo HTTP con login real sobre SQLite sintético: rechazo tras desactivación, cambio de rol/institución/contraseña y eliminación; login de cuenta inactiva denegado, tokens antiguos denegados y trigger restringido. Servicio temporal detenido antes de activar.

Respaldo consistente/restauración de SQLite con integridad y conteos correctos en `/opt/convoca-backups/security-04-20261031/restore-drill/`; archivo de código/configuración/build verificado y build anterior preservado en `next-before`. Base de datos byte a byte idéntica a la copia tomada con el servicio detenido antes del despliegue. Secreto y contraseñas de producción sin cambios. No se hicieron migraciones ni logins con cuentas reales.

Comprobación pública: portada/catálogo/login/registro HTTP 200, sin errores JS; catálogo solo published, detalle inexistente gestionado, sesión/stream con token inválido 401 y trigger anónimo 401. Las pruebas negativas enviaron cuerpos incompletos que no podían crear usuarios ni notificaciones incluso en una versión anterior.

Próximo bloque propuesto: cerrar SEG-005 retirando el seed público y manteniendo inicialización/recuperación operativa; después reconciliar la línea base de migraciones antes de incorporar revocación persistente.
