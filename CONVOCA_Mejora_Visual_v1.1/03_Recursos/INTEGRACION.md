# Implementación propuesta

1. Aprobar color/alto/ancho de navbar de la familia RedUniv (no contiene un cambio automático de producción).
2. Importar los tokens de `CSS/reduniv-nav-v1.1.css` en los proyectos, adaptando los selectores a las aplicaciones existentes.
3. Usar el logotipo de cada proyecto (no el símbolo provisional de la demo). `SVG/convoca-logo-inverso.svg` es la variante para el encabezado oscuro de CONVOCA.
4. Implementar el menú móvil con estado real en el framework, `aria-expanded`, interacción por teclado, cierre con Escape y al navegar. El HTML de demo tiene una implementación básica y **no** sustituye al componente definitivo.
5. Mantener las rutas reales, autenticación y permisos de cada aplicación; el prototipo tiene enlaces ilustrativos a las portadas.
6. En CONVOCA, asignar los SVG `icono-*.svg` según `iconos-mapeo.json`. No reemplazar globalmente todos los birretes en otras vistas.
7. Aplicar `CSS/convoca-home-v1.1.css` solo a los componentes correspondientes y revisar conflictos de especificidad.
8. Validar con `04_QA/criterios-aceptacion.md` en escritorio y móvil antes del despliegue.

**Importante:** la normalización se define para las cabeceras públicas. Las cabeceras internas de paneles administrativos pueden conservar variantes funcionales, compartiendo tokens y alturas cuando sea oportuno.
