# Mantenimiento 08 — Catálogo limpio y navegación de inicio

El usuario solicita retirar los tres programas de ejemplo, permitir borrado desde el administrador y visitar el home con sesión activa. Se conservan universidad, cuenta administrativa y credenciales.

La portada deja de redirigir automáticamente por rol; el login conserva su redirección al panel. El encabezado público consulta auth/me y ofrece Mi panel según el rol. El administrador conserva su enlace de marca al inicio. Se mantienen diseño, dimensiones y menú móvil.

Se añade Eliminar por programa con confirmación y bloqueo de acciones mientras se procesa. La API DELETE sigue limitada a administrador, valida ID entero positivo y devuelve 404 si falta. Un DELETE condicional atómico impide eliminar programas con solicitudes (409), indicando cerrarlos para conservar expedientes. No borra expedientes como efecto lateral.

152 pruebas correctas (10 nuevas de borrado), typecheck/lint y build local correctos. Playwright con API simulada verificó cancelar/confirmar, actualización de tabla y recorrido administrador → home → Mi panel en escritorio y móvil sin errores JS. Candidato de main se valida también en Linux y HTTP con BD sintética.

Limpieza productiva limitada a IDs 1,2,3: Maestría en Ciencia de Datos, Maestría en Ciberseguridad y Telecomunicaciones. Se comprobará que conservan sus títulos y que no tienen solicitudes antes de borrarlos. Respaldo consistente/restauración y ensayo en copia antes de confirmar. Sin cambios de esquema, contraseñas, usuarios ni universidad. Si aparece un programa o expediente nuevo, no se elimina como parte de esta lista.

Siguientes prioridades: SEG-006 (límites de login/registro, peticiones y origen/CSRF), prueba de admisión completa con datos sintéticos en staging, CI con typecheck y publicaciones reproducibles. El historial sensible de Git/backups sigue pendiente de tratamiento acordado (SEG-007); esta limpieza no lo elimina.

## Resultado de publicación

Desplegado main `5500501` (dev `0ad03a4`) tras 152 pruebas, typecheck y build en Linux. Ensayo HTTP con sesión administrativa sintética confirmó home 200 con contenido público, sesión conservada, DELETE limitado a admin, 409 si hay solicitudes, eliminación válida y 404 al repetir. Servicio temporal detenido antes de activar.

Eliminados únicamente los tres programas indicados, con títulos verificados y cero solicitudes vinculadas. Todas las demás tablas y secuencias quedaron idénticas; integridad correcta. Backups protegidos en `/opt/convoca-backups/maintenance-08/production-before.db`, copia de restauración ensayada, archivo de código/configuración/build verificado y build anterior conservado. Servicio y páginas públicas saludables; operación/activación y salud local en 1,447 s. Cuenta administrativa, contraseña y universidad conservadas.

Recargar el navegador para cargar el nuevo panel. La portada pública está disponible con sesión; el login sigue llevando al panel. El borrado protege programas con solicitudes existentes al ejecutarse la sentencia; la integridad concurrente de creación de solicitudes sigue formando parte de DAT-003 y debe validarse antes del piloto, junto con restricciones y transacciones generales. No es una declaración de integridad referencial completa (el esquema histórico carece de FKs).
