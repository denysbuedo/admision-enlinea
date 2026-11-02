# Desarrollo y publicación de CONVOCA

Regla acordada el 31 de octubre de 2026: desarrollar en `dev`, integrar cambios validados en `main` y desplegar únicamente `main`.

## Secuencia

1. Comprobar árbol limpio, `git fetch origin --prune`, diferencias entre local/remoto y commit del servidor. No sobrescribir cambios ajenos.
2. Trabajar en `dev`, incorporando `main` mediante merge/fast-forward según corresponda; nunca resetear o forzar ramas compartidas.
3. Limitar cada entrega a una corrección revisable. Añadir pruebas que reproduzcan el fallo antes de corregirlo, usando BD aislada para escrituras.
4. Pasar tests, typecheck, lint del cambio y build; registrar alcance, riesgos, reversión y pendientes. Publicar `dev`.
5. Verificar cambios entrantes y actualizar `main` por fast-forward desde su remoto. Integrar `dev` mediante merge explícito (`--no-ff`), sin editar directamente `main`.
6. Preparar desde ese commit de `main` una copia aislada de validación en Linux. Ejecutar pruebas y compilar allí. Un fallo bloquea publicación/activación; la corrección se hace en `dev` y se vuelve a integrar.
7. Antes de activar: respaldo consistente de SQLite y copia de código/configuración/build; comprobar restauración e integridad. No sustituir datos operativos por la BD del repositorio ni ejecutar migraciones sin revisión y ensayo específicos.
8. Publicar `main` y comprobar que el commit que se va a desplegar coincide. Activar el build ya validado con healthcheck y reversión preparada. Verificar el sitio público y los datos; no crear cuentas ni solicitudes de prueba en producción.
9. Registrar resultado en `dev`; integrar también la documentación final en `main`. Los cambios solo documentales no requieren reconstrucción ni reinicio. Sincronizar `dev` con el merge final y dejar el checkout local en `dev`.

## Límites actuales

- La norma está documentada; no implica protección de ramas ni CI configurados en GitHub. Esos controles siguen en CAL-004.
- Las verificaciones de API que escriben datos se ejecutan con BD temporal/in-memory, no con el archivo de producción. No imprimir credenciales ni datos personales en informes.
- La restauración de un archivo SQLite no equivale a un simulacro completo de recuperación del servicio. Ambos deben registrarse por separado.
- Producción tiene tablas existentes, pero se observó `__drizzle_migrations` vacío el 31/10/2026. Reconciliar esquema y línea base de migraciones antes de usar `db:migrate` allí.
- Ensayo del 01/11/2026: esquema productivo equivalente a migración inicial, registro todavía vacío; línea base registrada únicamente en copias aisladas, con dos repeticiones y restauración correctas. Ver docs/MIGRATION-BASELINE-REHEARSAL.md. Esto no autoriza ni sustituye la operación específica de reconciliación productiva.
- Los scripts operativos temporales requieren todavía consolidación/revisión en CAL-005. No son un pipeline permanente.

Actualización 01/11/2026: línea base productiva reconciliada desde main `13ba53c`, con una única entrada y sin cambios de esquema/datos. Ver docs/BASELINE-REGISTRATION.md. Las observaciones anteriores de ledger vacío son históricas; no volver a insertar esa entrada. Toda nueva migración requiere ensayo y respaldo específicos.

Entrega 06: migración 0001_session_revision aplicada desde main `1c21b95`; ledger productivo contiene dos entradas. El esquema nuevo es aditivo, pero el runtime antiguo no garantiza revocación persistente. Ver docs/STABILITY-06.md para respaldo, validaciones y límites de reversión. Las utilidades de baseline inicial quedan históricas y no se reutilizan sobre el journal actual.
