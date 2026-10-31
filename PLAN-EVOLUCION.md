# CONVOCA: propuesta para la siguiente etapa

> Actualización 2026-10-31: el plan vigente y priorizado de estabilidad está en [ROADMAP.md](ROADMAP.md). Este documento se conserva como antecedente del rediseño.

## Punto de partida

La referencia funcional es el servidor Ubuntu, commit original `7418f7c`. Su única diferencia de dependencias era una suma de integridad adicional en `bun.lock`, adoptada en el repositorio. La base de datos de producción se conserva separada del código; no se distribuye a GitHub ni se sustituye por la base local. El rediseño aplica el kit CONVOCA v1.0 sobre la arquitectura existente.

## Orden propuesto

| Etapa | Trabajo | Criterio de aceptación |
| --- | --- | --- |
| 1. Seguridad y acceso | Impedir el registro público de administradores; definir aprobación de cuentas institucionales; exigir JWT_SECRET; proteger notificaciones y setup; revisar cookies, revocación y usuarios desactivados. | Pruebas negativas por rol y pertenencia institucional. Ningún usuario puede obtener permisos ajenos ni consultar solicitudes de otra institución. |
| 2. Diagnóstico funcional | Recorrer registro, programas, publicación, solicitud, evaluación, documentos, notificaciones y CSV con datos de prueba. Contrastar interfaz, API, esquema y documentación. | Matriz por flujo: disponible, incompleto, defectuoso; prioridades y reproducción de cada fallo. |
| 3. Calidad y dependencias | Auditar versiones efectivamente instaladas y el lockfile, actualizar vulnerabilidades de forma controlada, retirar duplicación de autenticación, activar comprobación de tipos en build e incorporar CI. | Instalación reproducible, typecheck, lint, tests y build obligatorios. Actualizaciones verificadas en staging. |
| 4. Modelo de dominio | Revisar estados y transiciones, validaciones de programa y solicitud, fechas límite, relaciones e índices de BD, transacciones y documentos. | Contratos compartidos y pruebas de integridad; migraciones reversibles ensayadas con copia anonimizada. |
| 5. Experiencia por rol | Consolidar navegación, formularios y tablas en componentes reutilizables; accesibilidad, errores y estados vacíos; pruebas móviles de cada flujo. | Recorridos completos por teclado y móvil, sin pérdida de datos, con mensajes claros. |
| 6. Operación | Staging separado, copias automáticas y restauración probada, despliegues con rollback, monitorización y logs sin datos sensibles. | Desplegar y revertir una versión de prueba sin alterar solicitudes ni cuentas. |

## Decisión arquitectónica

Primero estabilizar y medir. Mantener Next.js, React y Drizzle mientras el diagnóstico no demuestre una limitación concreta. Valorar PostgreSQL si la concurrencia, escalado o requisitos operativos lo justifican. Evaluar una reescritura solo después de conocer cobertura funcional, coste y riesgos de migración; preferir sustituciones graduales con contratos y pruebas.

## Hallazgos iniciales, pendientes de profundizar

- El registro público admite `super_admin` en el esquema y persiste el rol recibido.
- JWT tiene un secreto fijo alternativo y conviven autenticación propia y configuración NextAuth.
- La autorización del endpoint de disparo de notificaciones está comentada; los suscriptores SSE se guardan en memoria de proceso.
- El build omite errores TypeScript mediante `ignoreBuildErrors`.
- Las pruebas existentes son mínimas; no cubren autorización ni flujos de admisión.
- La instalación local reportó 26 avisos de vulnerabilidad durante `npm install`. Esto no es todavía una auditoría de las dependencias de producción: clasificar por alcance, versión y explotabilidad antes de actualizar.
- Se corrigieron para validar el rediseño la ruta de setup de Vitest y una prueba de fecha dependiente de la zona horaria.

Este documento es una propuesta para revisar juntos. La ejecución de esta etapa no forma parte del cambio visual.
