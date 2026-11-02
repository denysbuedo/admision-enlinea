# Estabilización 06 — Revocación persistente de sesiones

Nueva columna users.session_revision, predeterminada en cero. Triggers SQLite incrementan su valor cuando cambian password, role, university_id, is_active o email; otro trigger impide disminuirlo o superar el entero seguro. La actualización es atómica con el cambio de seguridad. Cambios de nombre y escrituras sin cambio de valor no lo incrementan. La política y triggers están en 0001_session_revision.sql; el snapshot de Drizzle representa la columna, no los triggers personalizados.

JWT exige revision y la incluye en la huella HMAC v2. Se compara con el contador vigente en cada petición/evento SSE. Restaurar campos anteriores, incluso updatedAt, no restaura la sesión. Se requiere nuevo login tras activar esta entrega. No cambian contraseñas ni el secreto JWT.

Cinco casos reprodujeron el fallo antes de corregir; 129 pruebas pasan tras agregar pruebas de restauración, claims y contador. Typecheck, lint y build local correctos. La migración debe ensayarse con snapshot consistente y referencia limpia, preservar todos los valores de columnas existentes y secuencias, comprobar cero inicial en revisiones, ledger de dos entradas e integridad. Respaldo y recuperación antes de activar.

El esquema es aditivo y permite lecturas/escrituras antiguas, pero volver al runtime previo pierde la garantía de revocación por contador. Ante un fallo de activación, mantener servicio detenido hasta corregir hacia adelante; no restaurar datos por encima de escrituras nuevas. Restaurar toda la BD también restaura contadores: esa operación requiere rotar JWT_SECRET para invalidar tokens previos. No cubre manipulación privilegiada que deshabilite triggers o reconstruya cuentas/BD.

Las utilidades de registro/auditoría de la única migración inicial son históricas y rechazan el nuevo journal. Sus pruebas específicas se omiten al existir más de una migración. La nueva migración tiene ensayos propios, sin reinsertar la línea base.

## Resultado

Desplegado main `1c21b95` (dev `6f4f67e`). Linux: 129 pruebas, typecheck y build correctos; HTTP sintético comprobó login, rechazo tras cambios/restauración, cuenta inactiva, tokens antiguos y trigger protegido. No se hicieron logins reales en producción.

Migración 0001 aplicada con servicio detenido: todos los valores de columnas previas y secuencias idénticos, contadores iniciales cero, esquema idéntico a referencia, integridad correcta y dos entradas esperadas en ledger. Operación y activación con salud local: 2,075 s (no equivale a indisponibilidad externa medida). Páginas públicas 200 sin errores JS y controles anteriores correctos.

Respaldo protegido `/opt/convoca-backups/security-06/production-before.db`, archivo de código/configuración/build verificado, build anterior en next-before. Ensayo sobre copia real protegida preservó datos, repitió migración dos veces sin cambios, comprobó DML con columnas antiguas y restauración. Las copias reales permanecen sin anonimizar en el servidor; no fueron servidas como app. Las pruebas HTTP usaron otra BD sintética y secreto propio; servicio temporal detenido.

SEG-004 cerrado para la revocación por cambios de cuenta y validación de JWT. Restaurar toda la BD exige rotar JWT_SECRET, y un rollback al runtime anterior pierde la garantía por contador. SEG-001 (aprobación institucional) y demás riesgos permanecen abiertos; no implica estabilidad completa.
