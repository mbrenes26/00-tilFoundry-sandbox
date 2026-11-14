---
id: "issue-8/retrospectiva"
tipo: "retrospectiva"
titulo: "Revisión parcial del segundo bloqueo: acceso a evidencia y criterios de verificación"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:feedback-loop", "commit": "4fcd3335454acd7e0a08dd4742ab647a83ee2edb", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 71636, "tokens_salida": 2399, "monto_ia": 0.489234, "minutos_computo": 0, "monto_computo": 0.0}
---
Rol: feedback-loop.

## Alcance y estado
Revisión incremental por bloqueo-repetido, no cierre de entrega. Último evento: BLOCKED, 2026-11-14 19:09:39Z, agente:manager-producto. PR #9, commit 3db5953. Core informa una vuelta de retrabajo y CI verde a la primera; aceptación humana de entrega todavía desconocida. La consolidación registra riesgo efectivo alto. No se solicita transición ni se modifica la spec.
Se consultaron bitácora, spec, conversación, cerebro, retrospectiva anterior y propuestas abiertas. La spec leída conserva cabecera borrador; la aprobación se toma del evento de Core del 14/11 15:00:18Z. Confidencialidad interna. La conversación efectivamente omite 69 mensajes y su herramienta no ofrece paginación. No se presume que los registros originales estén perdidos.

## Qué funcionó
- Se completaron once pasos con verificación independiente. Los eventos paso-7 (17:16:40Z) y paso-8 (17:36:10Z), agente:manager-producto, registran parada/reanudación real, evaluación completa y humo de 60 segundos. Se mantuvo explícito que Windows y seis horas locales no estaban certificados, conforme a C-4/C-8 y la spec.
- Las pruebas verdes no sustituyeron la auditoría: transición a REWORK de 19:07:35Z, agente:manager-auditoria, conserva hallazgos de seguridad, evidencia y presentación. La consolidación no encontró archivos fuera de alcance; UX aprobó.
- Al no recuperar evidencia se detuvo el plan sin inventar rojos retrospectivos ni cerrar COD-1: evento BLOCKED de 19:09:39Z. La consulta pide permiso para preparar una excepción, no la da por aprobada. No consta respuesta posterior de la persona.

## Trabas nuevas
### 1. Evidencia histórica exigida pero no recuperable por las herramientas
- Eventos: VERIFYING, 14/11 18:55:17Z, agente:manager-producto, ya declara rojos históricos no recuperados; REWORK, 19:07:35Z, agente:manager-auditoria, exige originales por criterio; BLOCKED, 19:09:39Z, agente:manager-producto, documenta confirmación independiente de lectura recortada sin paginación y registros de evidencia no disponibles.
- Causa: plataforma, verificada para la limitación de acceso. No se verificó pérdida de almacenamiento. La spec exige evidencia real y no es causa suficiente para rebajar esa exigencia. Los resúmenes de pasos no reemplazan originales enlazables.
- Costo: un bloqueo abierto; planificación y diagnóstico entre 19:07:51Z y 19:09:45Z, 1 min 54 s y USD 0,209648, con planificación útil de otras correcciones incluida. No se atribuye toda la auditoría a esta carencia. La duración posterior del bloqueo no se conoce. Riesgo de consultas sucesivas: el plan separa doce criterios afectados en cuatro grupos, pero la pregunta actual cubre solo tres; todavía no hay evidencia de preguntas repetidas.
- Propuesta: ampliar #56 con recuperación de comandos históricos, paginación y referencias por criterio. Comprobar disponibilidad del conjunto antes de reanudar; distinguir no accesible, no encontrado y no ejecutado. La plataforma debe recuperar evidencia, no fabricar una excepción ni nuevos rojos.

### 2. Verificación visual con expectativas distintas
- Eventos: paso-9, 14/11 18:10:27Z, agente:manager-producto, documenta corrección y prueba móvil de panel contenido dentro del canvas; REWORK, 19:07:35Z, agente:manager-auditoria, pide panel exterior y HUD legible a 390×844; plan de 19:08:30Z, agente:manager-producto, explicita sustituir la expectativa previa y añade mínimo de 14 px.
- Causa: spec, inferida: fija resolución lógica/FIT y los indicadores, pero no tamaños de ventana soportados ni condiciones de visibilidad. Esto permitió verificar geometría sin acordar legibilidad y tablero visible. No se concluye que la auditoría móvil esté prohibida ni se revoca su bloqueo.
- Costo: parte de una vuelta formal compartida con otros hallazgos; una corrección visual previa y otra planificada. Auditoría UI: 2 min 56 s, USD 0,260943, con revisión útil incluida. Costo incremental de la primera corrección no separable; segunda todavía no ejecutada.
- Propuesta: plantilla de spec de interfaz con tamaños soportados y condiciones observables de visibilidad en inicio, reproducción y final; cualquier mínimo nuevo requiere la decisión correspondiente, no se convierte automáticamente en alcance aprobado.

### 3. Servidor de uso local accesible desde otras interfaces
- Evento: REWORK, 14/11 19:07:35Z, agente:manager-auditoria, SEG-1 registra HTTP 200 mediante IP no loopback debido a --host 0.0.0.0. Consolidación previa: riesgo efectivo alto.
- Causa: rol, inferida: no se tradujo el uso local de C-4 en una comprobación de escucha restringida durante construcción. La exposición comprobada está verificada; no se afirma acceso desde Internet ni incidente de datos. C-4 dice HTTP local, no contiene literalmente una dirección de escucha.
- Costo: otro hallazgo dentro de la misma vuelta, no una vuelta adicional. Auditoría de seguridad: 1 min 55 s, USD 0,780395, incluye otras comprobaciones. Corrección prevista, todavía sin costo ejecutado separable.
- Propuesta: comprobación ejecutable de alcance de red cuando el contrato sea uso exclusivo en el propio equipo: acceso loopback correcto y escucha restringida; no volver a escribir una recomendación que las pruebas pueden hacer cumplir.

### 4. Retoma durante ejecución que terminó incompleta
- Eventos: guardia, 14/11 17:51:49Z, motivo posible corte por despliegue; ejecución manager-producto c172bbaa3586 termina incompleta a las 17:57:50Z; alerta de 17:57:51Z. La retoma 1e850469a5f9 ya había empezado a las 17:51:50Z y cerró paso-9 a las 18:10:27Z.
- Causa: plataforma, inferida para la interrupción y necesidad de recuperación; la bitácora no confirma que el despliegue causara el corte ni demuestra escrituras duplicadas.
- Costo: ejecución incompleta de 14 min 28 s y USD 0,544974; retoma de 18 min 43 s y USD 0,650460. Ventanas solapadas y trabajo reutilizable: no sumar duraciones ni tratar ambos montos como pérdida neta.
- Propuesta: sumar a #60 como caso relacionado de recuperación incremental, aclarando que no se acredita un segundo corte después de dividir el plan. Persistir causa conocida/desconocida, último avance y fase pendiente para retomar sin reconstruir todo el contexto.

## Traba corregida y antecedentes
- Timeouts: paso-9 de 18:10:27Z y paso-11 de 18:42:47Z, agente:manager-producto, registran repeticiones por límite de 5 s en persistencia. Causa rol, inferida: concurrencia de pruebas no ajustada a los recursos de sesión. VERIFYING de 18:55:17Z registra corrección maxWorkers=2, regresión y dos corridas independientes verdes del comando estándar. Ejecución de cierre: 10 min 57 s y USD 0,357913, incluye otras tareas; costo incremental desconocido. Conservar la regresión; no proponer otra regla para algo ya corregido.
- Primer bloqueo de formato: 04:57:04Z–05:03:42Z, agente:manager-producto; ya analizado y propuesto en #59. También están cubiertos por la retrospectiva anterior el cierre parcial (#58) y la falsa alerta de avance (#57). No sumar los mismos eventos como casos nuevos. El fin de aquella revisión registra USD 0,606656; incluye análisis de varios problemas, no es íntegramente costo de la falsa alerta.

## Seguimiento propuesto
Para el repositorio, sugerir en el próximo pedido decisiones explícitas sobre ventanas soportadas y servidor restringido al propio equipo, consistentes con C-3/C-4, sin reabrir stack ni arquitectura. No repetir ahora la pregunta pendiente de excepción.
Para metodología, sumar recuperación histórica a #56 y recuperación incremental a #60; proponer criterios visuales y comprobación de escucha. Medir disponibilidad de originales tras historiales largos, recuperación sin reconstrucción innecesaria, menos discrepancias visuales y detección de escucha amplia antes de auditoría. Todas son propuestas sujetas a decisión humana.