---
id: "issue-6/retrospectiva"
tipo: "retrospectiva"
titulo: "Bloqueos repetidos: capacidades, memoria y verificación antes de retomar"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "863935dff883b4d050991407c247bee479231a4c", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 104847, "tokens_salida": 2463, "monto_ia": 0.578943, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.
Trabajo: issue-6. Corte: alerta de Core del 2026-11-14 16:37:33 UTC. Retrospectiva intermedia: estado vigente REWORK, no entrega. Seis entradas a BLOCKED no equivalen a seis vueltas de retrabajo: Core informa una. CI verde a la primera; aceptación humana aún desconocida.

Qué funcionó
- Se conservaron alcance y decisiones aprobadas; los cambios de dependencias pasaron por revisiones y aprobación humana.
- El evento del 12/11 16:46:39, manager-producto, registra instalación limpia independiente, pruebas y auditoría de dependencias sin hallazgos. No se extrapola ese resultado al commit actual.
- Las auditorías detectaron desbordamiento y fallos de foco que las pruebas previas no habían cerrado. P1–P5 tienen eventos de finalización y evidencia independiente entre el 14/11 05:16:24 y 07:20:51.
- Se preservaron correcciones existentes, sin fabricar rojos históricos ni reconstruir requisitos desde el código. La base aprobada volvió a ser accesible el 14/11 05:05:35.
- El 14/11 07:59:24 se rechazó dar por terminada una inspección visual que el probador no pudo realizar, aunque las pruebas automáticas pasaran. El plan registrado a las 16:37:24 ya separa distribución, arte y animaciones: no propongo repetir esa división.

Trabas y causas
1. Capacidades de arte y revisión visual insuficientes para ambos roles.
Evidencia: 12/11 06:38:14, agente:manager-producto, BUILDING a BLOCKED: nueve PNG ausentes de rama pese a existir en sesión; copia limpia falla por archivo ausente; Core no pudo persistir binarios. 14/11 07:59:24, mismo actor, REWORK a BLOCKED: constructor consumió 20 aperturas del visor y el probador no pudo abrir nuevas capturas; no se cerró aceptación visual. Son dos manifestaciones de falta de capacidad efectiva, no un criterio estético imposible de verificar.
Causa: Plataforma, verificada en los motivos registrados; mecanismo interno del cupo no inspeccionado. Costo: primer bloqueo hasta reanudación 6 h 44 min 45 s; segundo hasta reanudación 7 h 48 min 15 s. Son ventanas de espera con causas concurrentes, no tiempo íntegramente atribuible al visor o a binarios. La ejecución que registró el segundo bloqueo costó USD 0,699331 e incluyó trabajo útil; costo puramente desperdiciado desconocido. Propuesta: comprobar persistencia/lectura de un artefacto y reservar capacidad de inspección independiente antes de delegar; identificar qué capacidad falta sin pedir decisiones sobre criterios ya aprobados.

2. Cambios de dependencias descubiertos por etapas.
Evidencia: 12/11 13:38:14, agente:manager-producto, BLOCKED: actualización autorizada no resolvió los avisos; otro cambio mayor requiere decisión. 12/11 15:07:26, mismo actor, BLOCKED: instalación de la versión aprobada falla en el resolvedor de npm, reproducida independientemente; restauración del baseline. 16:46:39 registra verificación satisfactoria tras nueva adenda.
Causa: Spec, inferida: aprobar versiones sin una comprobación previa del conjunto y del instalador favoreció rondas sucesivas; no es incumplimiento, pues la spec declaraba esa verificación pendiente. No atribuyo el defecto del resolvedor a Core.
Costo: dos bloqueos; esperas hasta salir de BLOCKED de 1 h 15 min 42 s y 13 min 42 s, más revisión/aprobación y construcción no desglosadas. Monto no disponible. Propuesta: comprobación exploratoria del conjunto exacto, instalación limpia y auditoría antes de pedir aprobación de una revisión de dependencias, cuando las herramientas autorizadas lo permitan; sin modificar el proyecto ni sustituir versiones por cuenta propia.

3. Base y bloqueantes históricos inaccesibles tras adendas y nuevos commits.
Evidencia: 12/11 22:25:41, agente:manager-auditoria, REWORK: recuperar la base completa y contratos sin reconstruir requisitos. 13/11 19:28:00 y 14/11 04:23:00, agente:manager-producto, BLOCKED: lecturas devuelven solo adendas y faltan registros de corrección. Entre ambos, 14/11 04:22:23 se reanuda sin recuperación acreditada. El 14/11 05:05:35 confirma lectura de aprobada-original.
Causa: Plataforma, verificada por lecturas fallidas documentadas. Costo: dos bloqueos documentales; 9 h 37 min 35 s desde el primero hasta recuperación, incluido el breve intento de reanudar. Tres ejecuciones de bloqueo/retoma/rebloqueo: USD 0,172118; no se suma como gasto totalmente evitable. Propuesta: prueba de integración que garantice base, adendas y bloqueantes del commit auditado desde un commit posterior, más comprobación de disponibilidad antes de reanudar por esta causa. La lectura histórica ya funciona aquí; se propone prevenir regresiones, no volver a restaurarla.

4. Ejecuciones incompletas y repetición antes de fraccionar el trabajo.
Evidencia: finales incompletos de agente:manager-producto el 14/11 a las 05:36:39, 05:56:46 y 07:41:06; guardia del 14/11 06:33:33 señala dos ejecuciones de unos 20 minutos compatibles con tope. Plan del mismo actor del 14/11 16:37:24 identifica corte de P6 y conserva lo ya terminado al dividirlo. También constan una ejecución de manager de 64 min incompleta el 12/11 23:29:58 y tres de código incompletas el 12/11 16:53:23, 18:43:53 y 20:01:51, sin motivo individual registrado.
Causa: Plataforma, inferida para falta de recuperación incremental; exceso de duración está documentado, pero no prueba que todas las ejecuciones fallaran por el mismo límite. Costo medible del trío de 20 min: 60 min 18 s de ejecución y USD 1,466229; pudo haber progreso reutilizado, por lo que no es una estimación de pérdida total. Los otros casos suman 81 min 29 s de ejecución, sin monto disponible. Propuesta: conservar punto de reanudación y avisar del tiempo restante; ante un corte no repetir la delegación completa. La división actual resuelve el plan, no acredita que exista recuperación automática.

5. Pruebas verdes sin cobertura suficiente de interacción y composición visual.
Evidencia: 12/11 22:25:41, agente:manager-auditoria: texto de objetivos desborda (471 frente a 630 de altura) y foco de diálogos cae en body, recorriendo fondo. 14/11 07:59:24, agente:manager-producto: paneles ocultan arte durante progreso pese a pruebas P6 verdes. Causa: Rol, inferida: verificación inicial incompleta de requisitos ya existentes; no hay evidencia de que la spec omitiera inspección real. Costo: una vuelta de retrabajo según Core. Ejecuciones de cierre P1 y P2 cuestan USD 0,467589 y 0,638451, con comprobación útil incluida; no permiten aislar costo del defecto. La espera visual de este caso ya aparece en 1, no se suma otra vez. Propuesta: Core exige evidencia de inspección por ambos roles ligada a criterio, estado visual, tamaño y commit antes de marcar completos criterios visuales; geometría y pruebas de foco complementan, no sustituyen esa evidencia.

Límites
- Conversación recortada: 118 mensajes omitidos. No uso esa ausencia para inferir una nueva traba. No atribuyo como hecho un error del contador de vueltas referido en comentarios: la bitácora entregada no contiene sus rechazos ni su motivo.
- Costos citados son de ejecuciones, no facturación completa ni pérdidas netas; ventanas de espera y trabajo activo no se suman. No se proyecta suficiencia del presupuesto restante sin estimación de construcción.
- Specs consultadas con confidencialidad interna. Propuestas externas solo describen patrones, sin datos del pedido. No había propuestas abiertas.

Para el repositorio
Proponer en el próximo pedido una matriz que distinga evidencia automática, inspección visual independiente y validación humana, con estados y tamaños a revisar. Mantener C-2/C-3/C-4/C-5/C-7/C-8 sin cambios y no reabrir la aprobación actual. Este paso no construye, no audita, no cambia estado y no solicita transiciones.