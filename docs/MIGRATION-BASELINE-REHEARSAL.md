# Línea base de migraciones — revisión y ensayo

Fecha: 2026-11-01. Fuente de referencia: main `ec9ce31` en servidor, limpio y servicio activo. Este bloque es de diagnóstico y ensayo: **no registra ni ejecuta migraciones en producción**.

## Resultado

- Coincidencia exacta de las definiciones SQLite de tablas e índices entre producción y una BD nueva creada por el migrador Drizzle instalado. Se comparan también vistas/triggers si existieran, sin normalizar literales ni ocultar diferencias.
- El esquema TypeScript y el snapshot de generación coinciden: drizzle-kit informa «No schema changes». No se creó una migración nueva.
- Producción tiene siete tablas de negocio, un índice único de email y `__drizzle_migrations` vacío. No hay claves foráneas declaradas. Las diez relaciones lógicas revisadas no presentan huérfanos.
- En una copia sin registro, el migrador rechaza la migración inicial sobre tablas ya existentes; su transacción deja esa copia intacta.
- En otra copia se registró únicamente la línea base. Dos ejecuciones posteriores del migrador real terminaron sin cambios de esquema, datos de negocio ni secuencias; el registro conservó exactamente una entrada.
- Restauración desde la copia consistente verificada: esquema, filas, secuencias, registro original vacío e integridad coinciden.
- El archivo principal de producción permaneció idéntico y su registro siguió vacío. La conexión al origen se abrió con `mode=ro` y `query_only`; no hubo reinicio, cambios de cuentas ni despliegue del runtime.

Esto acredita equivalencia de esquema, no la fecha ni el método con que se crearon históricamente las tablas.

## Identidad de la línea base

| Campo | Valor |
|---|---|
| Migración | `0000_clammy_multiple_man` |
| SHA-256 del SQL | `6ecd3ac9a6848e5c30a8482ec14866f1c34b97752e158ee10fa38edcd30ede56` |
| Marca del journal | `1780709683240` |
| Filas de registro en producción | 0 |
| Filas de registro en la copia reconciliada | 1 |

El hash coincide entre Git, el archivo local revisado y la referencia creada en Linux. El migrador instalado decide qué ejecutar por la marca del journal; no basta con confiar en ese mecanismo para detectar cambios en SQL histórico. La herramienta comprueba además el hash real y el esquema. No editar la migración inicial ni fabricar una fecha nueva para hacerla pasar por una migración ejecutada hoy.

La validación del primer paquete exportado desde Windows detectó conversión de LF a CRLF por Git: el SQL exportado tenía hash distinto, aunque el blob del repositorio no había cambiado. Las guardas rechazaron ese candidato por diferencia de esquema textual. Se fija `eol=lf` en `.gitattributes` para `drizzle/**` y las herramientas; el archivo SQL de Git permanece intacto. Comprobar también los bytes del paquete exportado antes de registrar una línea base.

Volumen comprobado: 9 usuarios, 1 universidad, 3 programas, 3 solicitudes, 7 notificaciones, 7 entradas de historial y 0 documentos. Snapshot consistente: 0,0033 s; referencia limpia: 0,1173 s; rechazo sobre copia sin registro: 0,1151 s; repeticiones reconciliadas: 0,1154 y 0,1076 s. Incluyen arranque del proceso migrador; no representan capacidad bajo carga ni una prueba de futuras migraciones.

## Herramientas y reproducción

`scripts/db/audit-baseline.py` abre el origen exclusivamente en lectura y exige un directorio nuevo fuera del directorio de la BD fuente. Crea allí snapshot, referencia, copia sin registro, copia reconciliada y simulacro de restauración. No tiene opción de aplicar al origen. Rechaza esquemas distintos, registros no vacíos y journals con más de una migración: es una herramienta acotada a esta reconciliación inicial.

`scripts/db/migrate-rehearsal.ts` usa el migrador instalado y únicamente archivos de nombre fijo dentro de un sandbox marcado; ignora DB_URL. No es un comando de migración de producción.

Ejemplo en el servidor, con Python 3.10+ y Bun. El directorio de salida debe ser nuevo; las copias se mantienen protegidas y no se sirven como aplicación:

```bash
python3 scripts/db/audit-baseline.py \
  --source /opt/admision-enlinea/sqlite.db \
  --repo /opt/admision-enlinea \
  --output /opt/convoca-migration-audit-NUEVO/rehearsal \
  --bun /home/nexouser/.bun/bin/bun
```

Crear previamente el directorio padre de salida con acceso restringido. Las copias de este ensayo están en `/opt/convoca-migration-audit-20261101/rehearsal/`, bajo un directorio 0700. Contienen datos reales **sin anonimizar**, permanecen exclusivamente en el servidor y no se descargaron ni se usaron para login. Solo el informe de conteos/resultados sale de ese entorno. Un ensayo funcional que exponga una aplicación deberá anonimizar primero su BD.

Cinco pruebas de integración sobre fixtures sintéticos pasaron en Linux: ensayo completo, rechazo por deriva de esquema, registro no vacío, salida existente/dentro del origen y ausencia de marcador. Cada prueba verifica que la fuente sigue idéntica.

```bash
BUN_BIN=/home/nexouser/.bun/bin/bun python3 -m unittest discover \
  -s scripts/db -p test_audit_baseline.py -v
```

## Corrección de configuración

`drizzle.config.ts` apuntaba a `src/db/migrations` y `DATABASE_URL`, mientras el migrador usa `drizzle/` y `DB_URL`. Se alinearon esos valores. Typecheck, lint del cambio y generación sin diferencias pasaron. No cambia el esquema ni ejecuta SQL por sí mismo. El comando `db:migrate` sigue siendo inadecuado para producción mientras el registro esté vacío.

## Siguiente paso propuesto, aún no ejecutado

1. Repetir comparación y respaldo con el commit y archivos definitivos, en una ventana controlada sin escrituras concurrentes.
2. Preparar una operación específica con guardas: esquema exactamente equivalente, registro vacío y hash/journal esperados. Registrar solo esa fila en una transacción; no ejecutar los CREATE TABLE históricos.
3. Verificar integridad, datos/secuencias de negocio idénticos y única fila esperada; confirmar que el migrador no tiene trabajo pendiente. No introducir una migración de sesiones en la misma operación.
4. Documentar la recuperación de metadatos: únicamente si no hubo migraciones posteriores, deshacer esa fila controladamente. Restaurar la BD completa exige impedir escrituras concurrentes para no perder cambios legítimos.
5. Después de validar esa línea base productiva, preparar por separado la migración del contador persistente de revocación de sesiones.

DAT-008 permanece parcial: este ensayo no aplica la línea base productiva ni prueba cambios futuros de esquema, carga o un archivo anonimizado. `foreign_key_check` no sustituye comprobaciones lógicas cuando no hay restricciones declaradas. El hash del archivo principal por sí solo no audita actividad WAL; la garantía de no escribir desde esta herramienta se basa en la apertura de solo lectura y en que todas las escrituras apuntan a archivos nuevos del sandbox.

## Cierre de la revisión

Candidato de main `6b4d364` validado en Linux después de fijar LF: cinco pruebas de integración correctas, typecheck correcto, drizzle-kit sin diferencias y hash del SQL exportado idéntico al registrado en este informe. Implementación en dev `4a7b883` y corrección de exportación `6163052`. La documentación de cierre sigue dev → main. Se sincronizan únicamente fuentes/configuración de herramientas y documentos, sin reconstruir `.next`, reiniciar el servicio ni modificar SQLite; el runtime publicado sigue siendo el de la entrega de seguridad 05.
