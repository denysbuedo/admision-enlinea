# Registro productivo de la línea base

Fecha: 2026-11-01. Operación limitada a registrar la migración inicial equivalente al esquema existente. No incluye una migración de sesiones.

La utilidad scripts/db/register-baseline.py exige el hash y journal revisados, referencia Drizzle verificada, registro vacío, esquema idéntico y directorio nuevo para backup. Hace respaldo consistente y comprueba su integridad. Dentro de una transacción exclusiva revalida esquema/datos, inserta una sola entrada y comprueba integridad, datos y secuencias antes de confirmar. Un error previo a commit revierte la transacción. El respaldo y result.json permiten distinguir el estado confirmado de un fallo posterior al commit.

Tres pruebas sintéticas en Linux pasaron: registro correcto y segunda aplicación rechazada, deriva de esquema rechazada y directorio de backup existente rechazado. La operación productiva requiere servicio detenido temporalmente para impedir escrituras entre respaldo y comprobaciones, con arranque garantizado al salir.

Recuperación: no restaurar automáticamente una BD completa tras reabrir escrituras. Si fuera preciso deshacer solo estos metadatos, verificar primero que no se aplicaron migraciones posteriores y acordar una transacción específica para la única entrada esperada. Una restauración completa exige una ventana sin escrituras y comprobar que no se pierden cambios legítimos.

## Resultado productivo

Aplicado desde main `13ba53c` (desarrollo `0f22a97`), tras ocho pruebas Linux y nuevo ensayo sobre snapshot reciente. Registro productivo: una entrada con hash `6ecd3ac9a6848e5c30a8482ec14866f1c34b97752e158ee10fa38edcd30ede56` y journal `1780709683240`. Esquema, datos de negocio y secuencias idénticos; integridad correcta. Se registraron metadatos de equivalencia, sin ejecutar los CREATE TABLE históricos.

Respaldo consistente verificado en `/opt/convoca-baseline-registration-20261101/production-backup/before.db`; resultados en `production-result.json` del directorio padre. Dos ejecuciones del migrador sobre una copia posterior al registro fueron correctas y no cambiaron datos ni ledger. El migrador no se ejecutó directamente sobre producción. Parada/operación/arranque y salud local completados en 1,755 s; este tiempo no mide indisponibilidad externa exacta.

Páginas públicas HTTP 200 sin errores JS; catálogo y controles de autorización previos correctos. No se modificaron cuentas, contraseñas ni build. La línea base productiva ya está reconciliada. Las futuras migraciones requieren su propio ensayo, respaldo y revisión; DAT-008 continúa parcial por los ensayos de cambios de esquema sobre copia anonimizada. Siguiente bloque: contador persistente de revocación de sesiones (SEG-004).
