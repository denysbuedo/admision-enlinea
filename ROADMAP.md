# CONVOCA — Hoja de ruta de estabilidad

Fecha: 31 de octubre de 2026. Referencia de código revisada: `2a2931d`.
Estado: plan propuesto; las tareas pendientes no están implementadas.
Alcance: CONVOCA, su API, datos y operación. No modifica CONECTA ni APRENDE.

## Objetivo y regla de trabajo

Conseguir un sistema que respete permisos, preserve solicitudes, se pueda recuperar tras un fallo y permita publicar cambios con evidencia de calidad. La apariencia y un build exitoso no acreditan estabilidad funcional.

Esta hoja de ruta sustituye el orden de prioridades de `PLAN-EVOLUCION.md` y del [roadmap anterior](docs/ROADMAP-LEGADO.md). Se mantiene la arquitectura actual mientras las mediciones no justifiquen cambiarla. Las correcciones urgentes no esperan a terminar toda la infraestructura de pruebas: incluyen sus propias pruebas mínimas y un despliegue recuperable.

## Estado comprobado y límites

- Identidad visual y cabecera publicadas; pruebas visuales recientes en móvil/escritorio. La última sincronización verificada quedó en `2a2931d`.
- Compilación y TypeScript pasaron en trabajos anteriores. Existen seis pruebas básicas; no acreditan permisos, integridad ni recorridos completos.
- Hay respaldos manuales y builds anteriores conservados. No se ha acreditado restauración integral ensayada, política automática de backups ni monitorización con alertas.
- SQLite contiene datos de producción y está excluido de nuevos commits; las variables de entorno también. El archivo estuvo versionado en el historial: retirar seguimiento no elimina las revisiones antiguas.
- No hay carpeta `.github` en el árbol revisado; no se verificó si existen controles externos de CI.
- Esta revisión fue estática y focalizada. No se intentó explotar fallos ni se escribió en producción; disponibilidad, carga, dependencias efectivas y controles de red requieren auditoría específica.

## Hallazgos que determinan la prioridad

| ID | Evidencia en el código | Riesgo y actuación |
| --- | --- | --- |
| H01 | `src/lib/validations.ts` acepta `super_admin`; registro persiste el rol sin autorización | Escalada de privilegios. Restringir registro público y revisar cuentas privilegiadas existentes sin asumir que hubo abuso. |
| H02 | GET/PATCH de `src/app/api/applications/[id]/route.ts` comprueban propiedad para aspirantes, pero no la universidad del programa | Lectura y modificación entre instituciones. Autorizar cada objeto en servidor. |
| H03 | `src/app/api/programs/[id]/export/route.ts` comprueba rol, no universidad propietaria | Exportación de datos personales ajenos. Aplicar el mismo control que al expediente. |
| H04 | PATCH de `src/app/api/programs/[id]/route.ts` solo exige sesión; `status` se toma del cuerpo | Edición por roles no autorizados y publicación sin aprobación. Separar permisos de edición y transición. |
| H05 | GET de programas sin sesión no filtra por publicado; GET por ID tampoco exige estado público | Exposición de borradores o programas rechazados. Política pública explícita en listado y detalle. |
| H06 | `src/lib/auth.ts` usa `default_secret` si falta JWT_SECRET; getSession confía en el token sin consultar el estado vigente del usuario | Firma insegura si falta configuración y permisos obsoletos hasta expirar el token. Exigir secreto y revocación verificable. El login sí comprueba isActive. |
| H07 | Autorización comentada en `/api/notifications/trigger`; seed permite GET/POST sin control de sesión | Operaciones administrativas expuestas. Retirar endpoints de prueba y limitar inicialización a operación controlada. |
| H08 | Cambios de solicitud, historial y notificación se escriben por separado; duplicados se detectan mediante consulta previa | Registros parciales y carreras concurrentes. Transacciones y restricciones de BD. |
| H09 | SSE lee cookie `token`, mientras login crea `auth_token`; suscriptores residen en memoria | Notificaciones inconsistentes y pérdida de entrega tras reinicios. Unificar sesión y recuperar pendientes desde BD. |
| H10 | `next.config.ts` contiene `ignoreBuildErrors: true`; esquema de programa usa name/degree aunque API usa title/programType | Publicaciones sin garantías de tipos y contratos divergentes. Validación compartida y controles obligatorios. |
| H11 | El formulario indica gestión externa de documentos; no se observó una API de subida en el árbol revisado | No dar por terminado un módulo de adjuntos solo porque exista su tabla. Confirmar alcance con producto. |

## Secuencia y esfuerzo orientativo

Estimaciones para una persona desarrolladora con apoyo de QA y operaciones. Son días laborables de esfuerzo, no fechas prometidas. Revisarlas tras la fase 0; disponibilidad de infraestructura y decisiones de producto pueden ampliar el calendario. Horizonte inicial: unas 6–9 semanas con solapamiento de trabajo operativo.

| Fase | Prioridad | Esfuerzo | Dependencia | Hito de salida |
| --- | --- | ---: | --- | --- |
| 0. Referencia recuperable | P0 | 1–2 días | Inicio | Copia consistente restaurada en entorno aislado e inventario registrado |
| 1. Contención de seguridad | P0 | 3–5 días | Respaldo de fase 0; puede avanzar en paralelo al staging | H01–H07 corregidos y pruebas negativas por rol aprobadas |
| 2. Entorno y publicación reproducibles | P1 | 3–5 días | 0; no retrasa hotfixes de 1 | CI, staging y rollback de aplicación ensayados |
| 3. Integridad y reglas de admisión | P1 | 5–8 días | 1 + 2 | Solicitud/estado/historial consistentes bajo errores y concurrencia |
| 4. Recorridos y regresión | P1 | 4–6 días | 3; pruebas se incorporan desde 1 | Flujos críticos por los tres roles verificados automáticamente |
| 5. Operación y capacidad | P1 | 3–5 días | 2; cierre después de 4 | Alertas, recuperación, carga y mantenimiento acreditados |
| 6. Piloto y versión estable | P1 | 2–3 días de preparación + 7–14 días de observación | 1–5 | Informe del piloto y decisión de salida |

## Fase 0 — Referencia recuperable

Responsables: desarrollo + operaciones. Un único responsable de cada despliegue.

- [ ] **EST-001** Inventariar commit, build, runtime, lockfile, variables requeridas (solo nombres), servicio, HAProxy, dominio, almacenamiento, permisos y volumen de datos. Registrar diferencias local/GitHub/servidor antes de cambios.
- [ ] **EST-002** Obtener copia consistente de SQLite, archivos asociados y configuración; usar mecanismo de backup SQLite o parada controlada. No asumir que copiar un archivo activo captura WAL y escrituras concurrentes.
- [ ] **EST-003** Restaurar la copia en entorno aislado, comprobar integridad, conteos y un recorrido de lectura. Proteger acceso a las copias y separar las claves de cifrado; no trasladar datos personales a desarrollo sin anonimizar.
- [ ] **EST-004** Preparar staging separado: BD, credenciales, archivos y correo de prueba; sin envíos reales, indexación pública ni acceso casual a datos de producción.
- [ ] **EST-005** Abrir inventario de incidencias con severidad, pasos, evidencia, responsable y criterio de cierre. Registrar las decisiones de producto pendientes.

**Aceptación:** una persona distinta de quien creó la copia puede restaurarla siguiendo el procedimiento. Hay ruta de recuperación antes del primer cambio de datos.

## Fase 1 — Contención de seguridad

Responsable: desarrollo; revisión de QA con datos sintéticos y dos instituciones.

- [ ] **SEG-001** Corregir H01: registro público solo de roles permitidos; definir aprobación de cuentas institucionales y evitar que un usuario se asigne representación de cualquier universidad. Crear administradores exclusivamente por flujo autorizado.
- [ ] **SEG-002** Corregir H02/H03: comprobar pertenencia institucional en lectura, escritura y exportación; impedir acceso cruzado por ID, parámetros, filtros o cambio del cuerpo de la petición.
- [ ] **SEG-003** Corregir H04/H05: aspirantes no editan programas; publicar/rechazar requiere administrador; catálogo y detalle anónimos solo muestran estados autorizados. Definir si programas cerrados permanecen consultables.
- [ ] **SEG-004** Corregir H06: exigir JWT_SECRET seguro; validar algoritmo, firma, expiración y estructura de claims. Revisar usuario activo, rol e institución vigentes; invalidar sesiones al desactivar cuenta, cambiar contraseña o privilegios. Planificar rotación sin registrar secretos.
- [ ] **SEG-005** Corregir H07: retirar o proteger trigger; convertir seed en comando operativo o inicialización controlada, nunca una mutación por GET público. Conservar una forma documentada de recuperación administrativa.
- [ ] **SEG-006** Endurecer límites de login/registro, tamaño de petición, mensajes de error y validación de entrada; revisar CSRF/origen en operaciones con cookies y configuración TLS/proxy. Probar que no se bloquea el uso legítimo desde redes institucionales compartidas.
- [ ] **SEG-007** Inventariar administradores y cuentas institucionales existentes, revisar accesos disponibles y exposición histórica de sqlite.db/credenciales. Registrar qué puede verificarse; acordar rotación, contención o tratamiento del historial según evidencia. No reescribir Git ni borrar cuentas de forma automática.

**Aceptación:** pruebas de API con anónimo, aspirante A/B, universidad A/B, administrador, usuario desactivado y token inválido/expirado. Todo acceso prohibido se rechaza sin efectos en BD; se conserva el acceso permitido. Ningún hallazgo P0 abierto para pasar al piloto.

## Fase 2 — Entorno y publicaciones reproducibles

Responsables: desarrollo + operaciones.

- [ ] **CAL-001** Fijar runtime y gestor usados realmente en producción. Instalar desde lockfile congelado en una máquina limpia; documentar la estrategia Bun/Node y eliminar dependencias no usadas después de comprobar referencias.
- [ ] **CAL-002** Auditar dependencias resueltas de producción y desarrollo, incluidas fuentes Git; clasificar vulnerabilidades y actualizar en cambios pequeños con regresión. Los 26 avisos históricos de npm no son un diagnóstico vigente de producción.
- [ ] **CAL-003** Quitar ignoreBuildErrors después de corregir los errores; ejecutar lint completo del código mantenido, typecheck, tests y build en CI. Excluir del lint los artefactos de demostración cuando corresponda, sin ocultar fallos del código de aplicación.
- [ ] **CAL-004** Configurar CI y comprobaciones de PR, revisión de cambios de permisos/esquema y restricción de escritura directa a main cuando el flujo del equipo esté acordado. Documentar un procedimiento de hotfix.
- [ ] **CAL-005** Versionar un procedimiento de despliegue sin secretos: respaldo, comprobación del commit, preparación en directorio separado, migración si aplica, activación, salud y rollback. No depender de scripts exclusivos de una carpeta temporal del PC.
- [ ] **CAL-006** Registrar commit/build de cada release y conservar el anterior. Separar reversión de código de recuperación de datos: una migración destructiva no se revierte cambiando solamente .next.

**Aceptación:** un checkout limpio produce una versión verificable; un error de tipo, test o build impide publicar. Se demuestra actualización y vuelta al código anterior en staging sin alterar los datos.

## Fase 3 — Integridad y reglas de admisión

Responsables: desarrollo + producto; operaciones revisa migraciones.

- [ ] **DAT-001** Definir matrices de estados y campos editables de programas y solicitudes por rol. Validarlas en API, incluyendo envío, revisión, cierre, reapertura y cambios posteriores al envío.
- [ ] **DAT-002** Unificar esquemas Zod con nombres/tipos reales de BD y formularios. Validar IDs enteros positivos, enums, números finitos, límites de texto, JSON, fechas y campos requeridos en cada transición.
- [ ] **DAT-003** Aplicar apertura/cierre, publicación y consentimiento en servidor al crear y enviar solicitudes. Definir zona horaria y precisión del plazo; probar límites antes/durante/después del cierre.
- [ ] **DAT-004** Transacción para solicitud + historial + notificación persistida; entregar eventos solo después del commit. Reintentos no deben producir estados, historial o notificaciones duplicados.
- [ ] **DAT-005** Auditar datos existentes antes de introducir claves foráneas, índices y unicidad por usuario/programa. Resolver duplicados mediante decisión documentada, no eliminación silenciosa. Verificar activación de claves foráneas en cada conexión.
- [ ] **DAT-006** Ensayar dos envíos simultáneos, revisiones concurrentes y errores a mitad de transacción. Añadir detección de actualización obsoleta para impedir que una revisión sobrescriba otra sin advertencia.
- [ ] **DAT-007** Definir eliminación/archivo de programas con solicitudes y política de retención, exportación y acceso a datos personales. Revisar CSV: escape de comillas, saltos de línea, fórmulas y campos autorizados.
- [ ] **DAT-008** Ensayar migraciones desde una copia anonimizada con el volumen real. Medir duración, integridad, conteos, cambios de esquema y procedimiento de recuperación; conservar compatibilidad con la versión anterior cuando sea posible.

**Aceptación:** sin filas huérfanas ni postulaciones duplicadas; fallos inyectados no dejan historial incompatible con la solicitud. Las reglas se mantienen aunque se omita la interfaz y se llame directamente a la API.

## Fase 4 — Recorridos completos y regresión

Responsable: QA + desarrollo; producto valida mensajes y reglas.

- [ ] **FUN-001** Probar aspirante: registro, acceso, consulta de programa, borrador, edición, envío, consulta de estado y cierre de sesión. Comprobar recarga, reintento y caída de red sin pérdida silenciosa de datos.
- [ ] **FUN-002** Probar universidad: programa nuevo, revisión administrativa, consulta de sus aspirantes, evaluación, transición y exportación. Probar administrador: usuarios/instituciones, aprobación y consulta global.
- [ ] **FUN-003** Consolidar una única autenticación efectiva y contrato de sesión; verificar redirecciones, cookies y permisos de todas las rutas, incluidas las variantes administrativas duplicadas.
- [ ] **FUN-004** Corregir SSE/cookie; recuperar notificaciones no leídas desde BD tras reinicios y reconexiones; probar marcado como leído, limpieza de suscriptores, expiración de sesión y timeouts del proxy. Si se mantienen varios procesos, validar distribución o usar consulta periódica como alternativa explícita.
- [ ] **FUN-005** Confirmar el alcance de documentos. Si siguen siendo externos, documentar entrega/verificación y no prometer subida. Si son obligatorios dentro de CONVOCA, planificar almacenamiento privado, autorización de descarga, límites/MIME, inspección de archivos y backup antes de dar por cerrado el flujo.
- [ ] **FUN-006** Añadir pruebas E2E persistentes al repositorio para recorridos críticos y pruebas de integración contra BD temporal. Priorizar reglas y permisos sobre un porcentaje global de cobertura.
- [ ] **FUN-007** Revisar teclado, foco, etiquetas de formularios, errores, estados vacíos/carga y pantallas pequeñas. Mantener la identidad publicada y probar los componentes que cambien, incluidos filtros por tipo y campos de fecha.

**Aceptación:** cada rol completa su recorrido con datos de prueba; pruebas negativas y positivas pasan en CI. No quedan botones que aparenten guardar sin hacerlo ni resultados de admisión incoherentes.

## Fase 5 — Operación, recuperación y capacidad

Responsables: operaciones + desarrollo.

- [ ] **OPS-001** Healthcheck de proceso y readiness de BD; monitorización externa de HTTPS y vencimiento TLS. Alertas por 5xx, latencia, disco, fallos de backup y reinicios repetidos, con destinatario y procedimiento de respuesta.
- [ ] **OPS-002** Logs estructurados con identificador de petición, sin contraseñas, tokens ni contenido de expedientes. Auditoría de cambios privilegiados, con actor/objeto/acción/resultado y acceso restringido.
- [ ] **OPS-003** Backups automáticos cifrados, copia fuera de la VM, retención y espacio vigilados. Restauración ensayada periódicamente; no usar solo snapshots antiguos de despliegue como protección del trabajo diario.
- [ ] **OPS-004** Revisar servicio, permisos mínimos, actualizaciones del SO, exposición de red, proxy y límites de recursos. Inventariar acceso operativo y recuperación si el responsable habitual no está disponible.
- [ ] **OPS-005** Medir carga y tamaño previstos con producto. Ensayar lectura, escrituras simultáneas, exportación y conexiones SSE con un pico esperado y al menos 2x ese pico. Evaluar bloqueos SQLite, tiempos de espera, CPU/RAM y consultas sin paginación.
- [ ] **OPS-006** Introducir paginación/filtros SQL e índices donde las mediciones lo justifiquen. Mantener SQLite si satisface los requisitos; decidir PostgreSQL solo con evidencia de concurrencia, operación o disponibilidad que lo requiera.
- [ ] **OPS-007** Crear manual de incidentes, restauración, rollback, rotación y soporte; hacer un simulacro con otro operador.

**Objetivos propuestos para acordar y medir, no garantías actuales:** disponibilidad mensual 99,5%; p95 de API interactiva <1 s bajo carga acordada; 5xx inesperados <0,5%; recuperación del servicio (RTO) ≤2 h; pérdida máxima de datos (RPO) ≤24 h en operación ordinaria. Antes de una convocatoria con alto volumen/cierre, revisar si se exige RPO ≤15 min y habilitar el mecanismo necesario. Exportaciones largas se miden por separado. Alertas urgentes recibidas ≤5 min desde la detección.

**Aceptación:** simulacro de restauración dentro del objetivo acordado, alerta recibida y resuelta, y reporte de carga sin corrupción/duplicados. Si no se alcanza un objetivo, se reduce alcance/carga o se corrige antes del piloto.

## Fase 6 — Piloto y salida estable

Responsables: producto + QA + operaciones.

- [ ] **REL-001** Piloto con una institución y aspirantes de prueba o usuarios expresamente participantes; soporte y ventana de observación definidos.
- [ ] **REL-002** Observar 7–14 días, incluyendo al menos un ciclo de envío/revisión y un cierre de plazo simulado. Revisar incidentes, recuperación, latencia y consistencia diaria.
- [ ] **REL-003** Cerrar P0/P1 que afecten seguridad, pérdida de datos o el recorrido principal; documentar limitaciones menores aceptadas y responsables.
- [ ] **REL-004** Publicar versión estable etiquetada con informe de validación, manuales, rollback, responsables de soporte y seguimiento de incidencias.

## Condiciones para declarar estabilidad

Todas deben cumplirse con evidencia; no basta con que la interfaz cargue:

1. Permisos y aislamiento entre instituciones probados en API; ningún P0 abierto.
2. Recorridos críticos y consistencia concurrente verificados, sin pérdida de solicitudes.
3. CI y despliegue reproducibles con detección de errores antes de publicar.
4. Backup restaurable, rollback ensayado y objetivos de recuperación medidos.
5. Monitorización, alertas y responsable de incidentes activos.
6. Capacidad suficiente para el pico acordado y piloto sin incidencias bloqueantes.

## Decisiones de producto pendientes

- Quién puede crear/autorizar cuentas institucionales y qué acciones se reservan al administrador.
- Qué puede editar un aspirante tras enviar; reaperturas y excepciones al plazo.
- Si los documentos son externos o una obligación funcional de esta versión.
- Volumen/pico esperado, periodo de convocatoria, retención de expedientes y objetivos RPO/RTO.
- Responsable de QA, operación, soporte y aprobación de cada hito.

Estas decisiones no bloquean corregir accesos indebidos evidentes. Cada entrega debe registrar ID de tarea, commit, pruebas, resultado en staging, respaldo, despliegue y criterio de cierre.

## Fuera de esta estabilización

Pagos, SSO, IA, analítica avanzada, aplicaciones móviles, importación masiva y una reescritura completa quedan en backlog. Primero corregir permisos, asegurar datos y medir la operación. La evaluación de necesidades nuevas se retoma después del hito de versión estable.
