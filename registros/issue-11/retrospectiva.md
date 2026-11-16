---
id: "issue-11/retrospectiva"
tipo: "retrospectiva"
titulo: "Retrospectiva de issue-11: distinguir fallos de ejecución, medir la interfaz real y delimitar requisitos"
version: 1
estado: "borrador"
solucion: "issue-11"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "577a200dddeb3c2706913f2025943ce5114db258", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 110817, "tokens_salida": 2525, "monto_ia": 0.620746, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.

## Base y límites
Estado vigente calculado por Core: DELIVERED; PR #12, commit 17a66bc. Consulté spec original y vigente, decisiones del cerebro, informes iniciales de UX/UI, PR, conversación reciente y bitácora. La herramienta de bitácora omitió 82 entradas anteriores y no ofrece paginación: esta retrospectiva cubre los episodios demostrables del tramo recibido, no pretende inventariar toda la historia ni calcular el costo total. La spec figura con confidencialidad interna; no se publicarán datos del trabajo en las propuestas externas.

Core informa una vuelta de retrabajo, aceptación humana de la primera entrega y puntuación de spec 5. Su métrica de CI a la primera es afirmativa, pero el evento de consolidación del manager del 16/11 a las 02:16:59 aclara que entonces no había checks publicados; la consulta actual del PR muestra «Foundry auditoría: success». No equivalen a demostrar una corrida de CI del proyecto. Tampoco infiero fusión: los comentarios finales se contradicen entre aprobación pendiente de revisión en GitHub y «no necesitas aprobar nada más»; la herramienta del PR no aportó estado de fusión. Sin evento específico visible de rechazo de fusión, no lo elevo a traba ni a propuesta.

## Qué funcionó
- Reglas puras, azar y reloj controlables permitieron regresiones precisas sin duplicar reglas en Phaser; coherente con C-2 y C-3.
- La comprobación independiente y las mediciones reales corrigieron defectos que las pruebas anteriores no detectaban. Evento paso rework-2, 15/11 22:43:32, actor agente:manager-producto: validó 69 unitarias y 28 Chromium, medidas de ambos fotogramas y mínimo visible de 50,4 px CSS.
- Acotar el cierre funcionó sin relajar criterios: plan del manager del 16/11 01:16:07 y ejecución del probador 978361d8b12a, terminada 01:32:58, verificaron 73 unitarias, build y 30 Chromium por modo, sin cambios ni repetición de suites en esa ejecución.
- Las cuatro auditorías finales aprobaron; evento del manager-auditoria del 16/11 04:01:41 registra entrega con aprobación humana vinculada al commit. Se comunicaron límites de emulación, entrega local y diversidad de modelos.

## Trabas, causas y costo
### 1. Interrupciones de infraestructura convertidas en correcciones del producto
Evidencia: probador 7ab2ad9b4b24, fin 15/11 21:54:50, y fd7ec153bd3f, fin 22:17:02: incompletos por tope de tiempo con error 504. Constructor db5b04a50545, fin 22:44:27, no pudo cargar código en tres intentos; probador 7fa8f358a420, fin 22:45:04, tuvo el mismo problema. En el cierre, probadores 9d7e9f2d8361, ebdd8df9ae1e y 23f0045503ff finalizaron incompletos a las 23:46:55, 00:27:47 y 01:14:19. Los planes del manager a las 23:46:57, 00:27:49 y 01:14:21 los convirtieron en «Corregir lo que falló en el cierre», citando únicamente el tope de tiempo. Constructor 1790d4f09ea5, fin 01:15:37: no reprodujo regresión ni cambió archivos.
Causa: Plataforma, verificada para las interrupciones; Rol, verificada para planes de corrección sin fallo funcional identificado. Que el automatismo de Core fuerce esa clasificación es inferido, no demostrado. No se atribuyen todos los 504 a una causa técnica única.
Costo: cinco ejecuciones incompletas citadas suman 75 min 30 s y USD 0,839841. Las dos ejecuciones sin sesión utilizable añaden 85 s y USD 0,121223. Tres planes de corrección del cierre abarcan 89 min 10 s hasta la replanificación; los intervalos se solapan con los anteriores y NO se suman. Hubo dos commits de documentación durante esos ciclos; no se afirma que todo su trabajo fuera inútil. Las tres ejecuciones de constructor correspondientes a correccion-1/2/3 suman USD 0,402926, incluyendo comprobaciones útiles. Faltan costos de algunos inicios sin fin visible.
Propuesta: Core debe distinguir resultado funcional fallido, ejecución interrumpida y verificación incompleta; no generar automáticamente corrección de código sin prueba fallida identificada. Reanudar pendientes con evidencia vinculada al commit, manteniendo la comprobación independiente.

### 2. Pruebas de dimensiones que no observaban el objeto mostrado
Evidencia: constructor 8b68bf832a97, fin 15/11 21:39:42, sustituyó medidas por inspección de sprite, píxeles opacos y transformaciones; una reducción temporal hizo fallar 12 casos. Constructor c0713ac0dba6, fin 21:17:31, corrigió captura en esquinas transparentes y registró 7 regresiones unitarias y 2 Chromium inicialmente fallidas. Paso rework-1, manager, 21:30:34: validó correspondencia con la silueta; paso rework-2, 22:43:32: validó medidas reales.
Causa: Rol, verificada para insuficiencia de las comprobaciones previas según evidencia de corrección. La confusión entre rectángulo de sprite y zona visible es la explicación inferida; la spec sí exigía captura dentro de lo visible y medidas CSS.
Costo: rework-1 duró 20 min 11 s entre inicio de construcción y aceptación, con USD 0,292718 en constructor/probador. Primer intento de construcción de rework-2: 9 min 4 s y USD 0,169787. Su aceptación completa tardó 72 min 54 s, incluyendo las interrupciones del punto 1: no sumar ambos como pérdidas independientes.
Propuesta: en la guía de pruebas visuales exigir que las aserciones midan objeto renderizado y zona interactiva reales; para ese contrato, comprobar con una alteración temporal que la prueba detecta una desviación y retirarla antes de entregar.

### 3. Requisito de teclado incorporado durante el retrabajo sin base explícita en los criterios
Evidencia: informe inicial auditoria/ui-2cf4578 exige como bloqueante una acción accesible de teclado. La spec original y vigente exigen clic/toque y tamaños, pero no expresan esa acción. El evento paso rework-3 del manager, 15/11 23:31:46, acepta su incorporación y pruebas; el plan de 23:46:57 la vincula a juego-2/3/5. Esos ids por sí solos no explican la nueva obligación.
Causa: Rol, inferida: pudo elevarse una mejora a obligación no acordada. Está verificada la diferencia textual y el retrabajo, pero no se dispone aquí de toda la política de accesibilidad aplicable ni del evento inicial de consolidación; no se concluye que la accesibilidad careciera de base normativa. La aprobación final de entrega no demuestra una aprobación previa de adenda.
Costo: 48 min 10 s entre inicio del paso y aceptación, con USD 0,493834 en cuatro ejecuciones terminadas visibles; incluye infraestructura del punto 1 y no es costo neto evitable. Un inicio de probador no tiene costo final visible.
Propuesta: validar en Core que cada bloqueante cite criterio o regla obligatoria concreta; si no existe base, tramitar sugerencia o decisión humana de ampliación antes de construir. No quitar controles accesibles ya entregados.

## Próximo pedido
Proponer a la persona fijar en el cerebro una convención de pruebas de interfaz que observe tamaño visible y zona interactiva reales, y explicitar en cada spec las modalidades accesibles de entrada y su efecto sobre el juego. No modificar decisiones vigentes ni archivos. Presentar propuestas metodológicas pequeñas y anónimas, con las inferencias declaradas; la persona y el equipo de TIL deciden.