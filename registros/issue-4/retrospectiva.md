---
id: "issue-4/retrospectiva"
tipo: "retrospectiva"
titulo: "Cuatro bloqueos: verificación manual, decisiones no recuperadas y auditoría fuera de alcance"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "4a245e0c400a82a27345c4923159d3866a6a24be", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 57031, "tokens_salida": 2161, "monto_ia": 0.348663, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.

## Resultado y límites
- Estado vigente: CANCELLED. Evento 2026-11-14 20:47:10 UTC, agente:manager-producto: cancelación por desistimiento explícito. No hubo entrega aprobada. No se atribuye el desistimiento a los bloqueos: la persona solo dijo que ya no necesitaba el pedido.
- Core informa cuatro entradas en BLOCKED, cero vueltas de retrabajo y CI verde a la primera. Las dos rondas de auditoría no equivalen a dos vueltas de REWORK.
- El PR #5 y su commit son referencias históricas de la bitácora; el contexto actual no informa PR ni commit vigente. No se infiere el estado actual de ese PR.
- La spec leída es interna. Su cabecera dice borrador, pero la aprobación y la transición SPECIFIED constan el 11 de noviembre a las 18:55:25 y 18:55:42 UTC. La conversación omite doce mensajes; no se reconstruye su contenido.
- El cerebro vigente C-3/C-4/C-7 establece Phaser, HTTP local y TypeScript/Vite, mientras la spec histórica fijaba HTML local sin servidor. Los eventos históricos declaran cerebro inexistente entonces. No se infiere un incumplimiento retrospectivo ni se propone restaurar ese stack; cualquier pedido nuevo debe respetar las decisiones vigentes.

## Qué funcionó
- Se preservó la diferencia entre automatización y observación real: geometría y foco simulado no se presentaron como nitidez o cambio real de ventana.
- Las consolidaciones registran checks verdes y ningún archivo fuera de alcance. Seguridad y UX aprobaron ambas rondas; código aprobó tras incorporarse evidencia manual.
- El manager de auditoría evitó convertir requisitos adicionales en modificaciones no aprobadas. La cancelación se respetó sin entregar ni fusionar por decisión del agente.

## Trabas, causas y costo
### 1. Verificación manual sin capacidad disponible y reanudación con pendientes
- Evidencia: 2026-11-11 19:03:42 UTC, agente:manager-producto, BUILDING a BLOCKED: constructor y probador carecen de inspección de imágenes y navegador interactivo; la spec requiere observación visual/manual. Salida del bloqueo a las 21:32:02.
- Repetición: 21:32:02, mismo actor, reanuda con detalles manuales pendientes; 21:34:02 vuelve a BLOCKED por navegador/versión, tamaños, nitidez y foco real aún sin acreditar. Reanuda a las 21:44:09.
- Causa: Spec, verificada en el desajuste entre el plan que asignaba recorrido visual/manual al probador y la capacidad declarada. Rol, inferida como contribución: reanudar sin resolver los pendientes favoreció una nueva ejecución de pruebas que no podía completar esa evidencia. No se demuestra una avería de Core ni una falla funcional del juego.
- Costo: dos bloqueos, 2 h 28 min 20 s y 10 min 7 s de espera; una ejecución intermedia de 2 min que vuelve a ejecutar pruebas sin cambios ni fallos nuevos. Monto incremental no disponible. Los tiempos de espera incluyen disponibilidad humana, no solo trabajo desperdiciado.
- Propuesta: sumar a #54 la comprobación previa de capacidad visual e interacción real, con responsable y lista única de evidencia manual cuando la fábrica no pueda producirla.

### 2. Decisión y evidencia ya aportadas no recuperadas
- Ancla de bitácora: 2026-11-11 23:23:04 UTC, agente:manager-producto, BLOCKED a VERIFYING: reconoce decisiones de 22:04:58 y 22:20:54, ratificadas a las 23:14:38, e incorpora la evidencia manual.
- Corroboración: escalamiento vigente indica que se volvió a pedir una decisión ya respondida. El comentario de las 22:21:35 declara lectura recortada y vuelve a pedir decisión y pruebas. No hay eventos de ejecución completos para los dos intentos anteriores: no se les inventa duración ni costo.
- Causa: Rol, verificada en la petición repetida; Plataforma, inferida como origen de la falta de recuperación, porque la lectura recortada fue declarada pero no se dispone del contenido exacto entregado en aquella ejecución.
- Costo: dos respuestas humanas adicionales; 1 h 18 min 6 s entre la primera respuesta y la reanudación, dentro del tercer bloqueo, no sumable como espera adicional. El escalamiento consultado registra USD 0,047046; incluye recuperación útil y no es costo neto del fallo. Costo total desconocido.
- Propuesta: lectura paginada o recuperación dirigida de respuestas posteriores al bloqueo, con cobertura explícita, antes de volver a solicitar una decisión.

### 3. Un requisito ajeno a la spec mantiene el bloqueo después de la decisión humana
- Evidencia inicial: 2026-11-11 21:53:56 UTC, agente:manager-auditoria, VERIFYING a BLOCKED: UI exige teléfono y lector de pantalla fuera de la entrega acordada; también hay evidencia manual legítimamente pendiente. Reanuda a las 23:23:04.
- Reincidencia: 23:32:24 UTC, mismo actor, VERIFYING a BLOCKED: UI mantiene solo teléfono, pese a la decisión de conservar escritorio; no se identifica defecto bloqueante de escritorio. Permanece así hasta CANCELLED, 2026-11-14 20:47:10.
- Causa: Rol, verificada: el informe UI mantiene como bloqueante un requisito que reconoce fuera del alcance. Metodología, inferida: el auditor atribuye el bloqueo a una regla universal de su especialidad, pero no se dispone de esa versión de la regla. La regla vigente de respetar alcance ya existe; la mejora debe hacerla cumplir, no repetirla.
- Costo: tercer bloqueo de 1 h 29 min 8 s, compartido con evidencia pendiente y recuperación de respuestas; cuarta espera de 69 h 14 min 46 s hasta cancelación, sin afirmar que todo ese tiempo sea imputable al auditor. Una segunda ronda de cuatro auditorías sobre el mismo commit. El informe UI consultado registra USD 0,161201 entre IA y cómputo, con comprobaciones útiles incluidas; no hay monto completo de ambas rondas.
- Propuesta: sumar a #68 validación en Core de que cada bloqueante remita a un criterio aprobado o regla superior aplicable; los nuevos mínimos de producto no acordados quedan como sugerencias. Una decisión registrada de exclusión debe impedir que el mismo requisito reabra el bloqueo sin un cambio aprobado.

## Para el repositorio
Proponer para el próximo pedido una convención en el cerebro: cada criterio identifica quién lo verifica, el método, el entorno soportado y la evidencia requerida. Registrar las decisiones y resultados ya recibidos para no volver a pedirlos. No convertir escritorio en una restricción universal ni cambiar C-2 a C-8.

## Seguimiento
Medir bloqueos por capacidad de verificación, respuestas repetidas y requisitos no acordados; comprobar que una retoma consume evidencia nueva sin reabrir la misma decisión. No se pide transición ni se reanuda este trabajo.