---
id: "issue-2/retrospectiva"
tipo: "retrospectiva"
titulo: "Retrospectiva de issue-2: validación de alcance y evidencia recuperable"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "690a3e9823fff94a6ef83e01ffd1df522e696037", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 48856, "tokens_salida": 2021, "monto_ia": 0.351902, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.

## Resultado y límites
- Estado vigente: CANCELLED, por evento del 2026-11-14T20:46:35Z, agente:manager-producto, ante la cancelación explícita de la persona. No hubo entrega aprobada. No se solicita reanudar ni cambiar el estado.
- Core registra dos bloqueos y una vuelta de retrabajo. CI a la primera y aceptación de entrega: desconocidos. El PR #3 y su commit son referencias históricas de la bitácora; el contexto actual no proporciona PR ni commit vigente.
- Se leyeron bitácora, discovery, spec, auditoría de código, escalamiento, conversación y propuestas abiertas. La consulta de la spec aprobada-original devuelve el mismo documento con encabezado borrador; la aprobación se acredita por el evento de Core, no por ese encabezado.
- El cerebro vigente define un proyecto TypeScript/Phaser. Los registros históricos declaraban no disponer de cerebro: no se infiere que esas decisiones actuales rigieran entonces ni se propone sustituirlas por Python.

## Qué funcionó
- El comportamiento quedó definido con ejemplos comprobables, incluidos espacios, acentos y ausencia de impresiones.
- Se respetó la aprobación previa: Core registra aprobación humana el 2026-11-11T06:03:58Z e inicio de construcción a las 06:04:31Z.
- Las consolidaciones no detectaron archivos fuera de alcance. La auditoría de código no encontró defectos funcionales ni criterios sin pruebas. La evidencia publicada por Core el 2026-11-11T15:16:56Z incluye instalación correcta y python -m pytest con seis pruebas correctas; esto acredita funcionamiento, no el rojo histórico ni CI.
- Los eventos de REWORK y del segundo bloqueo distinguieron evidencia histórica de pruebas nuevas. No se simuló un fallo posterior como si precediera a la implementación. La aceptación de una excepción tampoco se presentó como aprobación de entrega.
- Se respetó la cancelación explícita.

## Trabas, causas y costo
### 1. La persona tuvo que corregir el formato del alcance
- Ancla: evento de aprobación del 2026-11-11T05:51:24Z, human:mbrenes26, decisión rechazar SPECIFIED. El motivo de formato aparece en el comentario asociado: prohibiciones fuera de Alcance. La conversación documenta otra corrección sobre comillas invertidas; el evento SPECIFIED del 2026-11-11T06:04:15Z, agente:manager-producto, confirma finalmente rutas delimitadas y prohibiciones separadas.
- Causa: Rol, inferida. La spec presentada no seguía el formato hoy exigido; no se recuperó el cuerpo rechazado ni la versión histórica de las instrucciones, por lo que no se afirma un defecto concreto del validador.
- Costo: un rechazo formal y dos intercambios de corrección visibles. Entre rechazo y aprobación transcurrieron 12 min 34 s; incluye espera humana, no tiempo neto de reparación. Monto no disponible.
- Propuesta: sumar el caso a #59, con validación ejecutable del alcance antes de pedir aprobación, usando el mismo esquema de Core; no redactar otra regla equivalente.

### 2. Los veredictos existían, pero no se podían recuperar sus informes
- Ancla: 2026-11-11T06:09:08Z, agente:manager-auditoria, VERIFYING a BLOCKED. Motivo: consolidación con cambios y consultas a informes que devolvían «No existe», sin poder recuperar bloqueantes concretos.
- Recuperación registrada: 2026-11-11T13:10:37Z, agente:manager-producto, BLOCKED a VERIFYING, porque ambos informes ya estaban accesibles.
- Causa: Plataforma, verificada en la indisponibilidad descrita en los eventos. El defecto técnico de origen no está identificado.
- Costo: 7 h 1 min 29 s en BLOCKED, una retoma y repetición de la revisión del mismo commit. La ventana incluye espera; no equivale a cómputo perdido. Monto no disponible.
- Propuesta: sumar a #56 una prueba de contrato que recupere los informes por las referencias de la consolidación, también para el mismo commit, antes de convocar al manager.

### 3. Se llegó a revisión sin evidencia accesible de las pruebas fallidas originales
- Anclas: 2026-11-11T15:14:52Z, agente:manager-auditoria, VERIFYING a REWORK por COD-1; 2026-11-11T15:16:51Z, agente:manager-producto, REWORK a BLOCKED porque no se recuperó la evidencia original y una ejecución nueva no podía acreditar la secuencia histórica. El informe auditoria/codigo-1d7dcf9 confirma que era el único bloqueante.
- Causa: Plataforma, inferida: el registro o la exposición de evidencia no permitió recuperar el material requerido. No está demostrado que la evidencia se perdiera, que nunca se ejecutara el rojo ni que se incumpliera deliberadamente TDD. La carencia de evidencia accesible está verificada.
- Costo: una vuelta de retrabajo; 1 min 59 s desde REWORK hasta BLOCKED, con búsqueda y nuevas pruebas sin cambios de archivos. Segundo bloqueo: 79 h 29 min 44 s hasta cancelación; no se atribuye toda esa espera a la evidencia.
- La conversación recoge aceptación de la excepción a las 15:49:27Z del 11 de noviembre y posteriores peticiones de retoma. El escalamiento describe falta de derivación a Auditoría. La bitácora entregada no incluye los rechazos de transición ni esas ejecuciones: no se cuantifica una traba adicional ni se abre una propuesta independiente de enrutamiento sin ese anclaje. Tampoco se atribuye el desenlace a falta de respuesta humana: sí hubo respuesta.
- Propuesta nueva: Core debe persistir y probar la lectura de evidencia cronológica durante la construcción, y comprobar sus referencias antes de la revisión. Un resultado verde o una afirmación del constructor no sustituye el fallo original.

## Costos y conclusiones
- Los dos intervalos en BLOCKED suman 86 h 31 min 13 s de calendario, no trabajo activo ni pérdida económica calculable. No sumarles otra vez el intervalo de REWORK como tiempo bloqueado.
- Solo consta un costo de ejecución: USD 0,023435 del cierre por cancelación; no mide el costo de las trabas. No hay datos para estimar de forma defendible el total monetario.
- No se concluye que los bloqueos causaran la cancelación: la razón explícita fue que la persona ya no necesitaba el pedido. El tono neutro disponible tampoco permite inferir insatisfacción.

## Propuestas y seguimiento
- Repositorio: sugerir para un próximo pedido una decisión de proceso que separe pruebas funcionales de evidencia histórica y precise qué debe conservarse y cómo consultarlo. No alterar el stack vigente ni convertir la excepción puntual en exención permanente.
- Metodología: sumar los patrones de formato y acceso a #59 y #56; proponer la conservación y verificación temprana de evidencia cronológica. Spec de confidencialidad interna; las propuestas externas omiten identificadores, rutas, textos y datos del pedido.
- La persona decide si incorpora la sugerencia al cerebro; el equipo de TIL decide sobre las propuestas de plataforma. No se modificó código, configuración, alcance ni decisiones vigentes.