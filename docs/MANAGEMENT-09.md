# Gestión administrativa y menú de sesión

El encabezado autenticado muestra Mi panel y Cerrar sesión, ocultando Crear cuenta. Mientras se consulta auth/me no se muestra el CTA de registro. Logout comprueba la respuesta, limpia el estado visual y refresca la ruta; ante un fallo informa sin fingir cierre. Se conserva comportamiento móvil.

Usuarios → Editar: nombre, correo, rol (aspirante, representante institucional o administrador), actividad e institución. Asignar/cambiar representación requiere universidad activa y justificación de al menos 10 caracteres; se registra aprobación institucional en la misma transacción. La edición genérica no activa solicitudes pendientes: deben usar el flujo de revisión. Cambiar permisos/email/actividad revoca sesiones por los triggers existentes. Editar datos propios puede requerir nuevo login.

Se impide borrar, desactivar o degradar al administrador que ejecuta la acción; se revalida el actor dentro de la transacción y se conserva al menos un administrador activo. Usuarios con solicitudes/documentos/notificaciones/historial/revisiones no se eliminan: pueden desactivarse. Los endpoints nunca devuelven contraseñas ni hashes y no ofrecen cambios de contraseña arbitrarios.

Universidades → Editar: nombre, país, ciudad, facultad, web http/https, descripción y actividad. Eliminar solo sin usuarios, programas ni revisiones vinculadas. Desactivar invalida los tokens de representantes mediante incremento de revisión; login/sesión rechazan universidades inexistentes/inactivas. Reactivar no revive tokens anteriores. Se unifica PATCH anterior con esta lógica y se valida la creación; /admin/universities redirige al panel canónico con su pestaña seleccionada.

170 pruebas correctas (18 nuevas de gestión), typecheck, lint y build locales. UI con API simulada comprobó menú/logout escritorio-móvil, edición de rol con universidad/nota, rechazo de autoeliminación, edición y eliminación institucional, sin errores JS. No hay cambios de esquema. Antes de publicar, validar main en Linux y HTTP sintético; preservar datos reales y disponer de backup/restauración.

Límites: las asignaciones institucionales conservan auditoría en institutional_reviews; no se añade aquí una auditoría genérica persistente para cada edición de perfil/rol no institucional. Borrados se protegen mediante comprobaciones transaccionales en estos endpoints; la integridad global con rutas de creación concurrentes y FKs pertenece al trabajo DAT-003. La validación externa de representación sigue siendo responsabilidad del administrador; no se deduce solo del email.
