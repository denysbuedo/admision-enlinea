# Estabilización 03 — Permisos y visibilidad de programas

Fecha: 2026-10-31. SEG-003, hallazgos H04/H05. Desarrollo en dev y publicación desde main.

## Política aplicada

- Anónimos, aspirantes y roles desconocidos solo consultan programas published. Los filtros enviados por cliente no amplían permisos. El detalle privado devuelve 404.
- La universidad mantiene su listado de gestión con todos sus estados y consulta sus programas privados. Puede consultar detalles públicos de otras instituciones, pero no sus programas privados ni editarlos. Sin institución asignada no obtiene un listado privado.
- Solo administrador o universidad propietaria pueden editar. La universidad edita contenido en draft, pending_approval o rejected y puede guardar draft o enviar pending_approval. No publica, rechaza, cierra ni modifica contenido ya publicado/cerrado; así no evita la revisión administrativa editando después de aprobar.
- El administrador conserva edición y estados válidos. Estados inválidos se rechazan con 400 antes de escribir. La creación institucional mantiene pending_approval y la institución de sesión, aunque el cliente solicite otra cosa.
- Los programas closed no aparecen en catálogo/detalle público; siguen disponibles en gestión institucional/administrativa. Es la política conservadora adoptada para este bloque, consistente con el catálogo previo del aspirante. Un archivo público de convocatorias cerradas queda fuera del alcance.
- La página de detalle trata respuestas no exitosas como programa no disponible. No se modifica el diseño ni el esquema de base de datos.

## Verificación

30 pruebas nuevas sobre handlers reales y SQLite en memoria: 17 fallaban antes del cambio. Suite total: 61 pruebas correctas. Cubren los cinco estados, dos instituciones, roles, listados/detalles, intentos de edición sin efectos, publicación/rechazo reservados, reenvío a aprobación y estado de creación forzado por servidor. Typecheck, lint de archivos modificados y build local se ejecutan antes de publicar.

El candidato de main se valida en Linux y con HTTP autenticado sobre datos sintéticos y secreto independiente. Antes de activar se respalda SQLite y se comprueba restauración; conservar build anterior para reversión. No ejecutar migraciones ni crear usuarios de prueba en producción.

## Límites

Pendientes: aprobación de altas institucionales, autorización basada en usuario vigente, validación completa de todos los campos, reglas adicionales de transición y auditoría de cambios. No implica que el sistema esté completamente asegurado. Revertir esta entrega reabre H04/H05; preferir corregir hacia adelante si la regresión permite contener el flujo afectado.
