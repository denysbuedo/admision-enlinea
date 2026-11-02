# Revisión de cuentas privilegiadas — 2026-11-02

Inventario de solo lectura sobre producción e0bd014: 9 usuarios (5 aspirantes, 2 administradores y 2 representantes institucionales), cuatro cuentas privilegiadas activas. Las dos institucionales heredadas carecen de revisión registrada; una no tiene institución válida. No se ha confirmado titularidad/autorización con responsables. No hubo cambios en cuentas ni accesos.

Inventario nominal privado en `/opt/convoca-access-review-20261102-final/inventory-private.json`, directorio 0700, archivos 0600. Solo el resumen de conteos se documenta aquí; la consulta de inventario no selecciona contraseñas ni hashes.

El historial Git alcanzable contiene cinco blobs históricos de sqlite.db, cuatro con campos de contraseña no vacíos en formato bcrypt. Ocho hashes de cuentas actuales coinciden exactamente con hashes históricos; tres corresponden a cuentas privilegiadas. La comparación se hizo en memoria y sobre artefactos protegidos del servidor, sin imprimir ni descargar valores de hashes/contraseñas. No prueba acceso indebido ni conocimiento de contraseñas en claro; sí que esos hashes son accesibles a quien tenga el historial del repositorio. sqlite.db ya no está versionado en el árbol actual.

No se encontraron rutas .env/.env.*, acceso*.txt ni *.pem en ese recorrido del historial. No es un escaneo exhaustivo de secretos bajo otros nombres ni determina si el repositorio fue público, forks, clones, logs, backups, accesos SSH o exposición por infraestructura. No se reescribió Git ni se rotaron credenciales.

El usuario cambió el alcance a eliminar todas las cuentas excepto un administrador. Hay dos candidatos, admin@gradcall.com (ID 2) y admin@nexo.com (ID 9); falta seleccionar cuál conservar. También se pidió confirmar el borrado de tres solicitudes, siete notificaciones y siete entradas de historial vinculadas. No interpretar el silencio como autorización. SEG-001/SEG-007 siguen parciales hasta resolver titularidad, limpieza autorizada y tratamiento de credenciales/historial restante.

Actualización: el usuario designó expresamente dinfo@mes.gob.cu como único administrador y autorizó eliminar el resto. Se aplicó la sustitución desde main 75bfb7f; los hallazgos nominales y conteos anteriores describen el estado previo. Ver docs/ACCOUNT-CLEANUP.md. La aprobación del administrador actual procede de esa instrucción; ya no hay representantes heredados activos que validar. La gestión del historial/repositorio/backups queda pendiente en SEG-007.
