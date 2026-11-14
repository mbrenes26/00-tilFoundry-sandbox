---
id: "issue-8/retrospectiva"
tipo: "retrospectiva"
titulo: "Revisión parcial: cierre de pasos, evidencia pertinente y validación de specs"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "f742252bd96ea1d1f0eabeb494e76ea1ba73793a", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 50961, "tokens_salida": 1864, "monto_ia": 0.356705, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.

## Alcance y límites
- Revisión por alerta, no retrospectiva de entrega. Core mantiene BUILDING, cuatro pasos completados de once y ningún PR. No se construyó el paso 5 ni se pidieron transiciones.
- Se consultaron bitácora completa, spec vigente, cerebro, propuestas abiertas y conversación. La conversación omite 39 mensajes; no se infiere su contenido. La cabecera de la spec leída dice borrador, pero la aprobación y el estado vigente se toman de Core (aprobación del 14/11 a las 15:00:18Z y transición posterior).
- Métricas Core: cero vueltas formales de retrabajo; CI y aceptación inicial aún desconocidos. Las repeticiones locales siguientes no son vueltas formales. Costos por ejecución incluyen trabajo útil; no son pérdidas netas ni deben sumarse cuando sus ventanas se solapan.

## Qué funcionó
- Aprobación humana antes de BUILDING y plan explícito con alcance y pruebas por paso. El plan del 14/11 15:01:49Z, agente:manager-producto, difiere la integración hasta el paso 11 sin declararla verificada.
- La verificación independiente encontró una inversión indebida tras reinicio: evento paso-3 del 14/11 15:21:16Z, agente:manager-producto. Se añadió regresión roja, se corrigió y se verificó con pruebas y tipos en verde. Una corrección local dentro de una ejecución de 8 min 43 s y USD 0,745521, incluyendo implementación y otras pruebas; costo incremental no separable. Es un control útil, no evidencia de una falla general del rol ni razón suficiente para otra regla.
- La retoma preservó el código existente: evento paso-4 del 14/11 16:43:04Z, agente:manager-producto, confirma el mismo commit sin nuevos cambios, 59 pruebas Vitest, dos de configuración y tipos en verde. Integración y Windows siguen explícitamente pendientes.

## Trabas y causas
### 1. Alerta de falta de avance después de completar un paso
- Evidencia: evento paso-4 del 14/11 16:43:04Z, agente:manager-producto; fin de ejecución a las 16:43:09Z; alerta a las 16:43:10Z, rol manager-producto, motivo «terminó sin pedir una transición, sin comentar ni registrar». A las 16:43:12Z se inicia feedback-loop.
- Causa: plataforma, verificada en el resultado observable: el detector no reconoció el avance registrado del plan en esa ejecución. La implementación concreta del detector no fue inspeccionada.
- Costo: una alerta y una ejecución adicional de análisis; monto final y demora posterior aún no disponibles. No se atribuyen a esta alerta los 77 minutos de la traba anterior.
- Propuesta: Core debe contar un paso aceptado y persistido como avance, asociado a la ejecución, sin exigir una transición adicional ni un comentario vacío. Pruebas para paso aceptado, rechazado y ejecución solo de lectura.

### 2. Evidencia del paso invalidada por verificaciones de etapas futuras
- Evidencia: eventos del 14/11 15:07:08Z y 15:12:34Z, agente:manager-producto, documentan repeticiones de pruebas tras rechazos por la última corrida; el segundo identifica build/e2e de pasos futuros. El plan de 15:01:49Z ya separaba integración final. La ejecución de 15:21:26Z terminó a las 15:25:34Z sin registrar paso; guardia a las 16:12:50Z avisó del problema. El evento paso-4 de 16:43:04Z registra la recuperación sin cambios y con integración pendiente. La evidencia de comandos publicada por Core confirma pruebas verdes seguidas de build fallido por entrada de interfaz aún ausente, y repetición final de pruebas verdes.
- Causa: plataforma, inferida: la aceptación parece depender del último resultado global en vez de evidencia por criterio y commit. La selección de comandos del probador contribuye; no se puede verificar quién impuso esas pruebas prematuras sin los registros internos de delegación y rechazo.
- Costo: al menos dos repeticiones tempranas y una retoma completa. Ventana entre fin sin cierre y paso registrado: 77 min 30 s; incluye espera, no toda atribuible al validador. Retoma de 2 min 19 s, USD 0,214837, con verificación útil incluida. Ejecuciones de pasos 1 y 2: USD 0,899491 en conjunto, sin desglose del costo repetido.
- Propuesta: validar cierre parcial por evidencia del criterio, paso y commit; conservar fallos y distinguir integración pendiente sin convertirla en aprobada. Repetir un comando verde no debe borrar un fallo pertinente. La entrega mantiene todas sus comprobaciones obligatorias.

### 3. Rechazo reiterado del formato de spec y del escalamiento
- Evidencia: transición DISCOVERING a BLOCKED del 14/11 04:57:04Z, agente:manager-producto: faltaban tres campos según el validador, el mismo rechazo continuó después de añadirlos explícitamente y falló guardar el escalamiento. Transición de 05:03:42Z, mismo actor, vuelve a DISCOVERING porque la spec ya estaba guardada como borrador; no faltaba decisión de producto.
- Causa: plataforma, inferida para el origen: desajuste entre formato esperado y diagnóstico. El bloqueo documental está verificado, pero no están disponibles los cuerpos rechazados para afirmar un defecto del parser. No consta aprobación omitida ni necesidad de repetir discovery.
- Costo: bloqueo de 6 min 38 s y al menos un reintento de guardado. Dos ejecuciones concurrentes relacionadas y la retoma suman USD 0,299714, con redacción útil incluida; no es costo puro del rechazo.
- Propuesta: reutilizar un esquema de spec entre contexto y validador, con error estructurado por campo y ejemplo válido; probar el circuito plantilla-validación-guardado y preservar diagnóstico si falla el registro de escalamiento.

## Observaciones sin atribución suficiente
- La guardia del 14/11 04:56:42Z sospechó un corte por despliegue y retomó una ejecución que después sí registró fin. No prueba por sí sola un corte real; no se propone un cambio por esa hipótesis.
- Los fallos Git y de preparación de dependencias aparecen en la conversación, pero no tienen evento propio de traba en la bitácora. No se elevan aquí a nuevas propuestas.

## Propuestas y seguimiento
- Para el repositorio: proponer para el próximo pedido que los planes distingan pruebas exigibles por paso de integración final, manteniendo esta última pendiente hasta ejecutarla. Refuerza el plan actual; no cambia C-2 a C-8 ni la spec aprobada.
- Para metodología: tres mejoras pequeñas de Core, descritas arriba. Las propuestas abiertas consultadas (#54–#56) no cubren estos patrones; no corresponde duplicarlas ni sumar casos distintos.
- Éxito: ausencia de alertas por pasos aceptados; cierre parcial sin reruns cosméticos ni ocultación de fallos pertinentes; specs de plantilla válidas a la primera y errores accionables para entradas inválidas.
- No hay evidencia para culpar a la persona ni para pedir otra aprobación o más presupuesto en esta revisión.