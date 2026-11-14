# SEG-006: límites de intentos de login

Fecha: 2026-11-14. Diseño pendiente de implementación; no hay cuotas nuevas activas.

## Evidencia de proxy

El operador renombró ACL/backend/server de nexo a convoca y aplicó al backend la eliminación de X-Forwarded-For entrante, option forwardfor y sustitución de X-Real-IP con src. Comunicó validación y recarga exitosas de HAProxy.

Se verificó en la VM mediante dos GET anónimos al endpoint de sesión, con un identificador aleatorio: uno normal y otro enviando IP ficticias en ambas cabeceras. Ambos respondieron 401 como corresponde sin sesión. En los dos llegaron una sola X-Forwarded-For y una sola X-Real-IP, válidas e iguales; las IP ficticias desaparecieron y la identidad permaneció estable. La conexión TCP procedía del HAProxy esperado (10.46.4.22). La observación procesó paquetes en memoria, descartó tráfico ajeno a las dos consultas y emitió únicamente resultados booleanos; no guardó paquetes, IP, cookies ni credenciales.

## Prerrequisito de confianza pendiente

La VM escucha en 0.0.0.0:3000. UFW está inactivo; iptables muestra políticas ACCEPT sin reglas y nftables no tiene reglas. Esto no demuestra exposición pública: puede haber filtros de nube o de red que no sean visibles desde la VM. Falta acreditar que TCP 3000 solo admite HAProxy y las comprobaciones locales autorizadas.

Antes de consumir cabeceras para cuotas, confirmar ese filtro o implantar una restricción específica de puerto con rollback y persistencia verificados. No habilitar UFW global ni alterar SSH como parte de este cambio. Ensayar tanto acceso permitido desde HAProxy como rechazo desde un origen distinto. La aplicación no debe deducir confianza simplemente de la presencia de X-Real-IP. No se modificaron firewall, servicio ni frontend compartido de HAProxy en esta revisión.

## Diseño propuesto para la primera entrega

- Alcance inicial: POST /api/auth/login. Registro requiere una entrega posterior propia.
- Cuota por combinación IP/correo normalizado: propuesta de 10 intentos en 15 minutos. Cuota amplia por IP: propuesta de 300 intentos en 5 minutos para contener rotación de correos. Son valores iniciales para ensayo y piloto, no capacidad acreditada de una universidad.
- Contabilizar solicitudes con forma de login válida antes de consultar la cuenta o ejecutar bcrypt; aplicar igual política exista o no el correo. Conservar las validaciones de origen, JSON y tamaño existentes. Los intentos admitidos consumen cuota también si terminan bien; no reiniciar contadores con un login exitoso, lo que permitiría carreras entre solicitudes.
- Evitar bloqueo global de una cuenta por correo: terceros podrían impedir el acceso a la víctima. Las cuotas de IP compartida deben observarse y ajustarse durante el piloto.
- Persistencia y consumo atómico en SQLite mediante migración revisada y ensayada sobre copias. No usar únicamente un Map en memoria: reinicios borrarían las cuotas. Diseñar la operación para solicitudes concurrentes y acotar reintentos por contención.
- Guardar claves HMAC con namespaces para IP y combinación IP/correo; no persistir IP o correo en claro. Definir derivación de clave y efecto de rotación antes de implementar. Registrar métricas agregadas sin identificadores de usuarios.
- Responder 429 con Retry-After y un mensaje genérico en español. El login debe mostrar el tiempo de espera sin generar reintentos automáticos. Si falla el almacenamiento del limitador, devolver 503 genérico y emitir un evento operativo sin datos personales; no pasar silenciosamente a intentos ilimitados.
- Acotar cardinalidad y eliminar ventanas vencidas con trabajo limitado. No crear una fila por intento ni conservar un historial de direcciones.

## Validación y publicación

1. Acreditar el acceso exclusivo del proxy al puerto y la persistencia de esa restricción.
2. Implementar en dev con pruebas de límite exacto, ventanas, concurrencia, cuentas inexistentes, NAT compartido, Retry-After, reinicios, fallo de almacenamiento y claves sin datos en claro.
3. Ensayar migración/repetición/restauración en BD sintética y copia protegida, sin modificar cuentas reales. Verificar el flujo de login admitido y el rechazo sin ejecución de bcrypt al agotar cuota.
4. Pasar suite, typecheck, lint del cambio y build Linux; integrar main, respaldar y verificar recuperación antes de activar. No provocar bloqueos de cuentas reales como prueba de producción.
5. Comprobar disponibilidad pública, integridad de BD y métricas agregadas del piloto. Reversión de runtime y manejo de la tabla aditiva se documentarán con la migración concreta.
