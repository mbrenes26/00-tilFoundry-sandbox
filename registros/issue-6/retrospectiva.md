---
id: "issue-6/retrospectiva"
tipo: "retrospectiva"
titulo: "Cierre por cancelación: límites de revisión visual y reanudaciones inviables"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "606cd273614a6424fe6d63fc30597e0866059f5e", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 88637, "tokens_salida": 2627, "monto_ia": 0.544959, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.
Trabajo: issue-6. Estado vigente: CANCELLED. Corte: 2026-11-15 03:24:56 UTC. Seguimiento de la retrospectiva anterior, no reconstrucción de toda la historia.

Fuentes y límites
- Consulté la bitácora, retrospectiva previa, conversación reciente, spec vigente, aprobada-3, propuestas abiertas y cerebro C-2/C-3/C-4/C-5/C-7/C-8. Las decisiones del proyecto no requieren cambios técnicos por estos hallazgos.
- La lectura de bitácora omite 132 entradas anteriores y recorta algunos motivos; no permite calcular duración o costo total del pedido. La spec vigente también llegó recortada. Uso solamente eventos visibles para las trabas nuevas; no atribuyo a este seguimiento hallazgos antiguos no recuperados.
- La memoria identifica la spec vigente como revisión en borrador y la conversación confirma que aguardaba aprobación. No trato esa reorganización como una aprobación humana nueva. Confidencialidad interna en los registros consultados.
- Core informa una vuelta de retrabajo, CI verde a la primera y aceptación de entrega desconocida. Las interrupciones no se cuentan como nuevas vueltas de retrabajo.

Qué funcionó
- La evidencia persistida permitió continuar sin repetir correcciones: eventos paso de agente:manager-producto del 14 de noviembre a las 18:51:27 (P6), 21:55:42 (P7), 22:21:20 (P8), 23:02:37 (P9) y 23:26:42 (P10a). Se conservaron commits, pruebas dirigidas y el carácter histórico de inspecciones anteriores.
- Se distinguió correctamente prueba automática de inspección visual. Los bloqueos de P7, P9 y P10b no declararon verde la revisión independiente pendiente por existir capturas o pruebas aprobadas.
- Evento del 15 de noviembre a las 03:24:56 UTC, agente:manager-producto: DISCOVERING a CANCELLED por petición explícita de la persona. Se respetó la cancelación sin dar el juego por entregado.

Traba 1: las comprobaciones visuales excedieron la capacidad de una ejecución
- Evento 2026-11-14 18:56:00 UTC, agente:manager-producto, REWORK a BLOCKED: Core limitó aperturas en ambas delegaciones; seis imágenes quedaron sin inspección. Ejecución a77570f98e50: 18:51:37–18:56:07, 4 min 30 s, USD 0,528668. Reanudación a las 21:46:35: 2 h 50 min 35 s de bloqueo, no tiempo de cómputo.
- Evento 2026-11-14 22:41:30 UTC, mismo actor y transición: el probador alcanzó el límite de 20 capturas; un segundo encargo acotado volvió a encontrar el límite. Ejecución d3ce74ca5580: 22:21:31–22:41:37, 20 min 6 s, USD 0,851428. Reanudación 22:54:29: 12 min 59 s de bloqueo.
- Evento 2026-11-14 23:36:37 UTC, mismo actor: P10b agotó capturas y quedó incompleto. El fin anterior 23:35:41 registra completado=false, ejecución 79f8306cb8d8 iniciada 23:26:52, 8 min 49 s y USD 0,631699.
- Causa Plataforma, verificada: los motivos registran topes de aperturas e imposibilidad de completar la revisión. Causa de planificación, Metodología inferida: no se dimensionaron los lotes según la cuota compartida y la verificación independiente. No está demostrado un fallo del visor ni ausencia de capacidad visual.
- Costo: los dos primeros episodios suman 24 min 36 s de ejecución y USD 1,380096; el tercero se informa aparte. Son costos de ejecuciones parcialmente útiles, no pérdida neta. Las esperas incluyen la respuesta humana; no se atribuyen a una falla de la persona.
- Propuesta: Core expone capacidad visual restante y su ámbito, valida el lote de ambos roles antes de delegar y conserva un cursor por imagen, commit y rol. Al agotar cuota, deja pendiente exactamente la revisión faltante para una ejecución posterior, sin volver a intentar en la misma cuota ni afirmar cumplimiento. Cualquier reanudación sigue las autorizaciones vigentes.

Traba 2: se pidió continuar antes de comprobar que el plan podía registrarse
- Evento 2026-11-14 17:42:23 UTC, agente:manager-producto, BLOCKED a REWORK: retomar P6 dividido por decisión humana. Evento 17:43:07, mismo actor, REWORK a BLOCKED: la división seguía impedida por el límite de replanificación. Las ejecuciones f1301164c8f7 y c582fc675188 costaron USD 0,094780 en conjunto; entre transiciones transcurrieron 44 s, sin verificación nueva registrada.
- Evento 2026-11-15 01:05:16 UTC, mismo actor, BLOCKED a REWORK: se acepta retomar P10b en dos partes. Evento 01:06:20, REWORK a BLOCKED: Core rechazó el plan porque resultaban 13 pasos frente al máximo de 12. Ejecuciones 131adc3e7ca8 y fd7b8e7ee5ed: USD 0,173273 en conjunto; 64 s entre transiciones.
- Evento 01:08:39, mismo actor, BLOCKED a DISCOVERING: la solución propuesta requiere otra línea y revisión de spec. Ejecución 59d30e81e595, 01:51:00–01:54:04: 3 min 4 s y USD 0,243216 para preparar esa revisión y solicitar aprobación, no para verificar el juego.
- Causa Metodología, verificada por los motivos: límites de replanificación y tamaño del plan impidieron continuar después de la decisión humana. Plataforma, inferida: una comprobación previa de viabilidad conjunta habría permitido presentar desde el principio la decisión que sí podía ejecutarse. No se propone eliminar límites ni saltarse aprobaciones.
- Costo: dos ciclos breves de reanudación y nuevo bloqueo, USD 0,268053 de ejecuciones asociadas; además hubo revisión de spec. No sumo esperas con las de la traba 1 porque se superponen.
- Señal a cubrir en esa validación: el evento plan del 14 de noviembre 23:18:27 dice conservar P11/P12 pendientes, pero el array visible termina en P10c y no los enumera. No puedo afirmar que se perdieran definitivamente los requisitos; sí existe discrepancia entre intención y plan registrado.
- Propuesta: antes de pedir una decisión para reanudar, Core valida en modo de consulta el plan candidato completo: número de pasos, permiso de replanificación y conservación o transferencia explícita de criterios pendientes. Devuelve una alternativa viable y sus necesidades de aprobación. La reanudación no debe prometer que una autorización humana elimina restricciones que siguen activas.

Otras interrupciones observadas
- 2026-11-14 22:15:57, fin de ejecución b0af583f6666, manager-producto, completado=false, USD 0,808077 y 20 min 7 s; el plan de 22:16:48 atribuye el corte de P8 al tiempo.
- 2026-11-14 23:17:47, fin dbc104723d71, mismo rol, completado=false, USD 0,582298 y 14 min 37 s; el plan de 23:18:27 atribuye el corte de P10 al tope de tiempo.
- Causa Plataforma verificada por esos motivos posteriores. El seguimiento previo ya propuso recuperar avances y registrar la causa del corte. No vuelvo a abrir esa misma mejora ni considero perdido todo el cómputo: los pasos posteriores reutilizaron evidencia.

Propuestas y cierre
- Para el próximo pedido del repositorio: proponer una convención en el cerebro para documentar por comprobación visual el caso, resolución, secuencia temporal necesaria, evidencia guardada y revisión independiente pendiente; dimensionar su ejecución según capacidad real de Core, sin fijar una cuota permanente en la spec ni debilitar criterios.
- Para TIL Foundry: dos mejoras pequeñas, capacidad visual por lote y validación previa de planes de reanudación. Las propuestas abiertas devueltas (#82 y #56) no describen esos patrones. La retrospectiva previa menciona mejoras de disponibilidad visual y recuperación; aquí no se propone otra vez instalar un visor ni recuperar una base aprobada.
- No hay evidencia para afirmar que las trabas causaron la cancelación. La persona dijo que ya no necesitaba el pedido; no se infiere insatisfacción de los tonos neutros.
- No se construyó, auditó ni cambió el estado; no se solicitaron transiciones. Este cierre no afirma entrega, fusión ni verificación final del PR #7.