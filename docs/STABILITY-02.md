# Estabilización 02 — Aislamiento institucional de solicitudes

Fecha: 2026-10-31. Flujo: desarrollo en dev, merge validado a main y despliegue exclusivamente desde main.

## Alcance

GET/PATCH de solicitudes comprueban la universidad del programa almacenado antes de devolver el expediente/historial o efectuar escrituras. Una cuenta institucional sin universidad, con otra universidad o con programa inexistente recibe 403. Los roles desconocidos también se rechazan. Se conserva el acceso global del administrador y el acceso del aspirante a sus propias solicitudes.

La exportación CSV/JSON comprueba la misma pertenencia antes de consultar las solicitudes. No utiliza universidad ni programa enviados en el cuerpo para autorizar. No hay cambios de esquema, migraciones, diseño ni reglas de transición de estados.

## Evidencia local

- 13 pruebas nuevas de handlers reales sobre SQLite en memoria, con dos instituciones y dos solicitantes. Ocho fallaban antes de corregir; 31 pruebas totales pasan después.
- Cobertura: sesiones ausentes, institución ajena/sin asignación, rol desconocido, programa inexistente, propiedad del aspirante, administrador, exportaciones CSV/JSON y conservación de solicitudes/historial/notificaciones ante rechazo.
- TypeScript, lint de archivos modificados y build local correctos. El typecheck se ejecuta por separado porque el build aún omite esa comprobación.

## Publicación y recuperación

Validar el candidato de main en Linux con BD y secreto independientes. Ensayar HTTP con login real de dos instituciones sintéticas, solicitudes propias/ajenas y manipulación de cuerpo/query. Crear respaldo consistente y comprobar su restauración antes de activar. Conservar código y build anteriores; comprobar salud pública sin escrituras de prueba en producción.

## Límites

SEG-002 aborda H02/H03, no toda la autorización del sistema. La aprobación del registro institucional (SEG-001), permisos de edición de programas, sesiones revocables y validación/transacciones de estados siguen pendientes. Una cuenta que consiga una asignación institucional indebida sigue siendo un riesgo hasta completar SEG-001. No ejecutar migraciones en producción: su ledger necesita reconciliación.

## Resultado de publicación

Desplegado el merge de main `507b933` (implementación en dev `fe0bdf5`). Linux: 31 tests y typecheck correctos; compilación terminada con código 0. La copia de validación requirió dependencias locales porque Turbopack rechaza un enlace externo; no se modificó la configuración de producción. El ensayo HTTP pasó con login real de dos instituciones, acceso/revisión/exportación propios, rechazo cruzado incluso con cuerpo/query manipulados y ausencia de escrituras en los intentos denegados. Se utilizaron exclusivamente datos sintéticos y un secreto independiente; el servicio temporal quedó detenido.

Respaldo consistente de SQLite restaurado con integridad y conteos correctos en `/opt/convoca-backups/security-02-20261031/restore-drill/`. Archivo de código/configuración/build verificado, build anterior conservado en `next-before`. La base de datos quedó byte a byte idéntica a la copia tomada con el servicio detenido inmediatamente antes de activar. Sin migraciones ni cuentas de prueba en producción.

Sitio público: portada, catálogo, login y registro respondieron 200 sin errores JavaScript; detalle y exportación sin sesión respondieron 401. La comprobación del registro administrativo sigue rechazando el rol con una petición incompleta incapaz de crear usuarios. La validación institucional autenticada se realizó en la instancia aislada, no con cuentas reales de producción.

SEG-002 completado para H02/H03. Próximo incremento propuesto: permisos de edición de programas, manteniendo separado el diseño del proceso de aprobación institucional.
