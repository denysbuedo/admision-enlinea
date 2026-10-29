# CONVOCA — revisión visual v1.1

Implementación del paquete `CONVOCA_Mejora_Visual_v1.1`, autorizada por el usuario el 28 de octubre de 2026. Alcance: CONVOCA; no se modifican CONECTA ni APRENDE.

## Cambios

- Componente público `PublicHeader` compartido por portada, catálogo/detalle, login y registro. Las cabeceras de paneles internos se conservan.
- Fondo #102B46 al ancho del viewport, contenido de hasta 1280 px, altura de 72 px en escritorio y 64 px en móvil, espaciado lateral de 24/16 px, logotipo inverso y CTA menta.
- Menú móvil con estado React, aria-expanded/aria-controls, Escape y recuperación del foco, cierre al navegar, clic fuera, salida de foco y cambio de breakpoint. Los enlaces activos tienen aria-current.
- Cinco SVG suministrados para cursos, diplomados, especialidades, maestrías y doctorados, a 28 px y trazo 1.8. Especialidades conserva el valor funcional `especializacion` en la URL, aunque el recurso se llame `especialidad`.
- Panel de trayectoria blanco, tarjetas con iconos sobre fondos tenues, pasos en bloques claros con borde menta, sección institucional azul a ancho completo y pie azul noche. Textos y flujos conservados.

## Validación

- TypeScript, compilación local y ESLint de PublicHeader, portada y layout: correctos.
- Vitest: 6 pruebas existentes correctas.
- Playwright: 320, 375, 768, 1024 y 1440 px, sin scroll horizontal; color y alturas de cabecera verificados por estilos calculados. Menú mediante teclado, Escape, devolución del foco y cierre al seguir el enlace de sección.
- Axe (WCAG 2 A/AA y 2.1 AA): cero infracciones detectadas en la portada en esos cinco anchos. Esto no sustituye una auditoría manual con lector de pantalla ni certifica toda la aplicación.
- Navegación activa comprobada en catálogo, login y registro, sin errores JavaScript. Conservados los enlaces filtrados por tipo de programa.
- Evidencia local excluida de Git en `.deploy/visual-v1.1/`: capturas previas 1440/375, posteriores en cinco anchos y script de revisión. No se efectuaron escrituras de prueba en producción.

## Operación

Copia previa verificada: `/opt/convoca-backups/v1.1-20261028/pre-deploy.tar.gz`. La versión nueva se compila en un directorio separado antes de detener el servicio para sustituir el build. La base de datos y las variables de entorno se conservan.

## Resultado en producción

Código compilado y desplegado: `fafc37f`. La compilación Linux pasó antes de activar el cambio. Portada, catálogo, login y registro responden HTTP 200 en https://convocatorias.reduniv.edu.cu/. Comprobaciones públicas en 1440/375 px: iconos, menú/Escape y ausencia de errores JavaScript correctos. La BD se verificó idéntica a la copia previa. Build anterior conservado en `/opt/convoca-backups/v1.1-20261028/next-before`. Las revisiones posteriores de documentación no cambian el build.

