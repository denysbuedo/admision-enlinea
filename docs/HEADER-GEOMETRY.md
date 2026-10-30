# Geometría de la cabecera de CONVOCA — 2026-10-30

Alcance confirmado por el usuario: modificar solo CONVOCA. CONECTA y APRENDE se consultaron como referencias públicas, sin modificar sus archivos ni despliegues.

## Corrección

El contenedor anterior medía 1280 px incluyendo 24 px de padding a cada lado: a 1440 px el contenido empezaba en X=104. Ahora el ancho útil es `min(1280px, 100% - 48px)`, sin padding interior adicional; en móvil, `100% - 32px`.

Se creó `public/brand/logo-navigation.svg` a partir del logo principal oficial, conservando todos los trazados y colores y ajustando únicamente el marco SVG a `13 13.375 513.625 104.125`. Los límites se midieron sobre el canal alfa del vector rasterizado a 8x. El recurso original y los logotipos del resto de la plataforma permanecen iguales. La imagen del encabezado mide 36 px de alto en escritorio y 32 px en móvil, con ancho proporcional.

Se mantienen fondo blanco, separación inferior, alturas 72/64 px, enlaces, opciones, hover, indicador activo y comportamiento móvil. No se modifican el banner ni las secciones.

## Comparación en navegador

Playwright/Chromium, viewport 1440 y 390 px, deviceScaleFactor=1, visualViewport.scale=1 (zoom 100 %). Coordenadas del dibujo visible, descontando espacio transparente del archivo, aproximadas por rasterización del logo a 4x.

| Portal | Viewport | X visible del logo | Alto visible del logo | Alto de cabecera |
| --- | ---: | ---: | ---: | ---: |
| CONECTA público, sin cambios | 1440 | 126.67 | 33.09 | 90 |
| APRENDE público, sin cambios | 1440 | 102.85 | 31.50 | 73 |
| CONVOCA corregido | 1440 | 80.00 | 35.93 | 72 |
| CONECTA público, sin cambios | 390 | 24.43 | 23.68 | 76 |
| APRENDE público, sin cambios | 390 | 20.45 | 20.47 | 65 |
| CONVOCA corregido | 390 | 16.00 | 31.94 | 64 |

En CONVOCA, el extremo derecho de los controles queda en X=1360/374 respectivamente. Sin desbordamiento horizontal; menú y Escape comprobados. Las otras plataformas no cumplen aún la geometría objetivo; esta tarea no afirma uniformidad final entre las tres.

Capturas y métricas locales en `.deploy/header-geometry/`, excluidas de Git. Copia previa de producción verificada en `/opt/convoca-backups/header-geometry-20261030/pre-deploy.tar.gz`.
