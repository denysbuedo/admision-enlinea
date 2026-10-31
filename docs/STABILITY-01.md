# Estabilización 01 — Registro público sin administradores

Fecha: 2026-10-31. Desarrollo: `dev`. Publicación prevista: merge validado en `main` y despliegue desde `main`.

## Alcance

Restringir `userRegisterSchema.role` a `aspirant` y `university`, manteniendo `aspirant` como predeterminado. `super_admin` se rechaza con HTTP 400 antes de consultar o insertar usuarios. No se modifica el rol de cuentas existentes, las contraseñas, el login, el seed operativo ni el esquema de BD.

La aprobación de cuentas institucionales y la revisión de cuentas privilegiadas existentes siguen pendientes. Por tanto, SEG-001 queda parcialmente atendida, no cerrada. Los demás problemas de permisos del roadmap no se consideran resueltos por este hotfix.

## Pruebas

Nuevo test de integración del handler real con SQLite en memoria y migraciones del repositorio. No utiliza DB_URL ni la BD local/de producción.

- Antes de corregir: dos pruebas fallaron porque `super_admin` se creaba con HTTP 201.
- Después: 18 pruebas totales correctas (6 previas y 12 nuevas).
- Casos nuevos: rol administrativo rechazado sin insertar filas; administrador existente intacto; aspirante implícito/explicito; password hasheado y omitido de respuesta; universidad existente/no existente; email duplicado; roles desconocidos o mal tipados.
- TypeScript y lint de los archivos de implementación/pruebas modificados correctos.

## Recuperación y observaciones

Servidor de referencia `2a2931d`, limpio; `main` estaba en `9fbaf33` con cambios documentales adicionales. Node v20.20.2 y Bun 1.3.14 observados en la VM.

Respaldo consistente mediante API de SQLite en conexión de solo lectura, restaurado en `/opt/convoca-backups/security-01-20261031/restore-drill/sqlite.db`. Integridad y conteos coinciden. Archivo separado de código/configuración/build, verificado, en el mismo directorio protegido. No se hizo un simulacro de login o recuperación total del servicio con datos reales.

Incidencia nueva: `__drizzle_migrations` no contiene filas aunque las tablas existen. No ejecutar migraciones automáticas hasta reconciliar la línea base (DAT-008). Esta entrega no tiene migraciones.

Reversión: build anterior y código preservados. Volver a la versión anterior también reabriría la vulnerabilidad; ante una regresión limitada al registro se prefiere contener ese endpoint y corregir hacia adelante, con una decisión operativa explícita.

## Resultado de publicación

Código de desarrollo `abbbd9c`, merge de aplicación `a90fa36` en `main`. Pasaron 18 tests también en Linux y la compilación del candidato de main. Validación HTTP en servicio temporal de loopback con `validation.db` y secreto propios: rechazo de administrador, registro de aspirante/institución, login y duplicado correctos. Se detuvo ese servicio antes de activar producción.

Producción desplegada desde `main`; base de datos preservada y build anterior en `/opt/convoca-backups/security-01-20261031/next-before`. GET de portada, programas, login y registro respondieron 200, sin errores JS. La prueba pública negativa envió solo el campo role, sin nombre/email/password, de modo que no podía crear una cuenta incluso ante una versión anterior; se verificó el error específico del rol administrativo.

La documentación final se integra por dev → main y no requiere reconstruir ni reiniciar. Siguiente entrega propuesta: SEG-002, autorización por institución en detalle/edición/exportación de solicitudes, con dos universidades de prueba antes de tocar producción.
