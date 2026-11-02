# Registro productivo de la línea base

Fecha: 2026-11-01. Operación limitada a registrar la migración inicial equivalente al esquema existente. No incluye una migración de sesiones.

La utilidad scripts/db/register-baseline.py exige el hash y journal revisados, referencia Drizzle verificada, registro vacío, esquema idéntico y directorio nuevo para backup. Hace respaldo consistente y comprueba su integridad. Dentro de una transacción exclusiva revalida esquema/datos, inserta una sola entrada y comprueba integridad, datos y secuencias antes de confirmar. Un error previo a commit revierte la transacción. El respaldo y result.json permiten distinguir el estado confirmado de un fallo posterior al commit.

Tres pruebas sintéticas en Linux pasaron: registro correcto y segunda aplicación rechazada, deriva de esquema rechazada y directorio de backup existente rechazado. La operación productiva requiere servicio detenido temporalmente para impedir escrituras entre respaldo y comprobaciones, con arranque garantizado al salir.

Recuperación: no restaurar automáticamente una BD completa tras reabrir escrituras. Si fuera preciso deshacer solo estos metadatos, verificar primero que no se aplicaron migraciones posteriores y acordar una transacción específica para la única entrada esperada. Una restauración completa exige una ventana sin escrituras y comprobar que no se pierden cambios legítimos.
