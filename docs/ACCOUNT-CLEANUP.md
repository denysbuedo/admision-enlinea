# Limpieza de cuentas — preparación

Solicitud del usuario: eliminar todas las cuentas excepto la cuenta administrativa elegida. Estado: pendiente de selección explícita entre ID 2 (admin@gradcall.com) e ID 9 (admin@nexo.com), y de confirmar el alcance sobre solicitudes y datos vinculados. No se ha aplicado a producción.

Previsualización comprobada sobre copias protegidas del servidor: se eliminarían 8 cuentas, 3 solicitudes, 7 notificaciones y 7 entradas de historial; no hay documentos ni revisiones institucionales para borrar. Se conservan exactamente la cuenta elegida, sus credenciales/estado, los 3 programas y la universidad. Las copias están bajo `/opt/convoca-account-cleanup-20261102/`, con acceso restringido; contienen datos reales y no se sirven como aplicación.

scripts/db/prune-accounts.py exige ID y correo esperados de un administrador activo. Sin --apply ejecuta la transacción y revierte para previsualizar. Con --apply elimina dependencias y cuentas dentro de una transacción; antes de confirmar comprueba cuenta conservada idéntica, catálogo intacto, integridad y ausencia de huérfanos lógicos. Tres pruebas sintéticas pasaron: aplicación válida, dry-run revertido e identidad de administrador incorrecta rechazada. Ambos candidatos se ensayaron además sobre copias de producción en Linux.

Antes de aplicar se debe confirmar el administrador y el alcance, publicar la utilidad validada desde dev a main, verificar versión/estado del servidor, detener brevemente escrituras, tomar nuevo respaldo consistente y ensayar su restauración. Revalidar los conteos autorizados y abortar ante cambios inesperados. Conservar backup protegido para recuperación; arrancar el servicio y verificar salud, una sola cuenta y datos de catálogo. No inventar una contraseña ni cambiar la del administrador conservado. Las sesiones de las cuentas eliminadas se rechazan al no existir el usuario; detener/arrancar el servicio cierra sus streams. No restaurar backups sobre escrituras posteriores sin una ventana controlada.

Eliminar cuentas actuales no elimina sus datos históricos del repositorio ni de backups: ese tratamiento es un trabajo separado, sin reescritura automática de Git. Si el administrador conservado tiene un hash histórico, planificar cambio de contraseña con su titular; no darlo por resuelto borrando otras cuentas.

## Instrucción definitiva del usuario

El usuario especificó crear dinfo@mes.gob.cu como único administrador y eliminar el resto, solicitando una contraseña generada. Esto sustituye la elección anterior entre administradores existentes y autoriza la limpieza vinculada ya descrita. La nueva cuenta se crea dentro de la misma transacción de borrado; ante cualquier fallo se revierte todo. Se eliminan las 9 cuentas anteriores, 3 solicitudes, 7 notificaciones y 7 entradas de historial; se conservan los 3 programas y la universidad. La contraseña se genera criptográficamente en el servidor, se guarda en un archivo 0600 fuera del repositorio y se entrega al usuario; no se incorpora a documentación, comandos ni Git. El CLI administrativo pasa a usar dinfo@mes.gob.cu como correo predeterminado.

Seis pruebas sintéticas correctas incluyen creación/borrado atómicos, rollback ante fallo, dry-run y rechazo de identidad/correo duplicado. Ensayo sobre copia real en Linux correcto: queda únicamente el administrador nuevo y catálogo intacto, sin huérfanos. Antes de producción se toma otro respaldo y se comprueba restauración; el acceso real nuevo se verifica tras arrancar servicio.

## Resultado productivo

Aplicado desde main `75bfb7f` (implementación de reemplazo dev `b0c7f81`). Tras seis pruebas sintéticas en Windows y Linux, typecheck y ensayo sobre copia real, se creó dinfo@mes.gob.cu (ID 10) como único administrador y se eliminaron las nueve cuentas anteriores, tres solicitudes, siete notificaciones y siete entradas de historial. Catálogo de tres programas y una universidad idéntico; integridad correcta y cero huérfanos lógicos. Creación y eliminaciones se confirmaron en una única transacción.

Respaldo consistente y restauración comparados en `/opt/convoca-account-reset-20261102/production-before.db` y restore-drill.db, bajo directorio 0700. El servicio arrancó correctamente y el login real de la nueva cuenta devolvió super_admin; también se comprobó auth/me. La operación y comprobación local tomó 2,081 s, sin medir indisponibilidad externa exacta. No hubo cambios de esquema ni build. Las cuentas eliminadas dejan de validar sesión; el reinicio cierra sus conexiones SSE.

La contraseña se entrega únicamente al usuario solicitante y queda fuera de Git/documentación. Respaldo e historial Git conservan datos históricos: la eliminación aquí es sobre las cuentas y datos activos de la plataforma, no una purga de todos los archivos históricos. No restaurar una copia antigua sin considerar que reintroduciría esas cuentas.
