---
id: "issue-4/auditoria/codigo-a5bc3f7"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre a5bc3f7: aprobado"
version: 1
estado: "aprobado"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 118989, "tokens_salida": 2095, "monto_ia": 0.498698, "minutos_computo": 1.534, "monto_computo": 0.002761}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659"}
---
# Auditoría de código — issue-4, PR #5

Commit auditado: a5bc3f7771bcbfc717ff0b068a8915eb1e208659.
Veredicto: aprobado en la especialidad de código. Sin hallazgos bloqueantes. No supone aprobar la entrega ni acreditar los checks de GitHub.

## Referencias y alcance
Leí spec-solucion, discovery, el registro vigente de escalamiento, la conversación disponible, el diff y los ejecutores de pruebas completos. No existe registro cerebro ni contrato entre líneas; la implementación respeta el stack fijado por la spec: HTML/CSS/JavaScript local sin dependencias de ejecución, instalación o servidor. Los archivos del cambio están dentro de index.html, styles.css, game.js y tests/. No encontré cambios en Foundry ni secretos en el diff.

Se mantiene el alcance de escritorio ratificado por la persona. No incorporo requisitos de teléfono ni de recorrido con lector de pantalla.

## Evidencia independiente
Ejecuté en la sesión aislada:
`node tests/game.test.js && node --check game.js && node --check tests/browser.cjs && node --check tests/game.test.js && node tests/browser.cjs`
Resultado: salida 0; 12/12 pruebas deterministas aprobadas, sintaxis válida y todas las comprobaciones de navegador aprobadas en Chrome/156.0.8078.79. Incluye file:// offline, ausencia de errores de consola y solicitudes externas, geometría a 1280 × 720 y 1600 × 900, ocho controles mantenidos y liberados, blur sintético, cuatro esquinas y las seis puertas mediante controles reales del protocolo del navegador. El ejecutor produjo capturas; no las inspeccioné visualmente.

## Cobertura de criterios
1. Apertura local: index.html:7–8 carga únicamente los archivos locales; tests/game.test.js prueba las referencias y tests/browser.cjs:38–46 abre el ejecutor y el juego con file:// y red desconectada. Prueba independiente aprobada.
2. Escena y distribución: game.js:7–14 define las seis puertas en dos filas; room() y draw() dibujan salas, pasillo y astronauta. Hay prueba de datos y geometría de navegador. La revisión visual humana del 11 de noviembre, 21:31 y 21:43 UTC, confirma la escena a 1280 × 720 en Chrome 157.0.8103.50, Windows, zoom 100 %. No atribuyo a las pruebas lógicas validación visual.
3. Recursos y objetivos: game.js:15–22 y 77–89 define los valores, construye barras e iconos y muestra los tres objetivos. Las pruebas verifican datos exactos, proporciones de barras y permanencia de recursos tras recorrido; también verifican que los datos de objetivos no cambian al avanzar o interactuar. No hay mecanismos para completar tareas.
4. Movimiento: game.js:38–49 normaliza la diagonal y usa tiempo transcurrido; 51–67 gestiona pulsación, liberación, prevención de scroll, blur y visibilidad; 153–161 integra animación y reinicio temporal. Las pruebas ejercen ambos esquemas, intervalos diferentes y detención. La prueba humana del 22:04 UTC, repetida a las 22:20, confirma Alt+Tab con flecha pulsada, liberación fuera y regreso sin movimiento atascado.
5. Colisiones: game.js:44–45 limita el cuerpo completo, no solo su centro. Pruebas deterministas de cuatro bordes y cuatro esquinas, más recorrido de esquinas en navegador, aprobadas. La persona confirma recorrido sin atravesar paredes, también después de redimensionar.
6. Interacción: game.js:24–37 selecciona por distancia dentro de radio inclusivo 48, mantiene desempate estable y sustituye el mensaje; 46–47 lo oculta al alejarse. Las pruebas ejercen nombres de las seis salas, frontera del radio, desempate, sustitución y ocultamiento. El navegador recorre las seis puertas; la revisión humana anterior también confirmó cada sala.
7. Escalado: game.js:50, 75–76 y styles.css:5–6 separan coordenadas lógicas y presentación mediante escala uniforme. Las pruebas del navegador comprueban geometría y proporciones a ambas dimensiones. El test lógico de invariancia es débil —véase sugerencia—, pero la separación de coordenadas se confirma en el código y hay evidencia manual complementaria: la persona confirmó nitidez a 1600 × 900 y al redimensionar, recorrido sin atravesar paredes e interacción con las salas que probó. No afirmo que probara individualmente las seis puertas después de redimensionar, ni lo exijo como requisito adicional a la spec.

La nueva evidencia humana registrada en escalamiento cubre la comprobación real de foco y las comprobaciones de redimensionado que anteriormente constaban pendientes; no corresponde volver a pedir esas mismas pruebas.

## Sugerencias no bloqueantes
- styles.css:10: quitar `top: sixty`, declaración inválida y redundante. El posterior `top: 60px` funciona y evita un defecto de presentación actual.
- tests/game.test.js, prueba C7: comparar un estado antes y después de llamar a fitScale(), que no recibe ese estado, no detecta regresiones de la integración del resize. Conviene ampliar tests/browser.cjs para repetir límites e interacción a 1600 × 900; hoy vuelve a 1280 × 720 antes del recorrido. La evidencia manual cubre esta entrega, pero la automatización sería más útil para cambios futuros.
- tests/game.test.js:16 y resumen del ejecutor HTML: C1 retorna sin comprobaciones en navegador y aun así figura APROBADO. Marcar ese subcaso como omitido/no aplicable o añadir una comprobación propia del navegador evitaría presentar 12 comprobaciones efectivas cuando una solo se ejecuta en Node. La apertura offline está cubierta independientemente por tests/browser.cjs y no queda un criterio sin verificar.

## Límites de trazabilidad para el Manager
La herramienta de diff no proporciona cuerpo del PR ni estado de checks; no pude confirmar esos dos elementos. tests/EVIDENCIA.md:8–12 documenta el rojo previo (salida 1, 0/12 por ausencia de game.js) y el verde posterior, pero el tramo de conversación que contiene aquel rojo quedó omitido por la herramienta. El verde actual sí fue reproducido y registrado por Core en esta ejecución. No presento la narración del archivo como evidencia independiente del rojo ni como comprobación del cuerpo del PR: corresponde verificar su presencia y los checks con los metadatos de Core antes de decidir la entrega. El documento de construcción conserva pendientes históricos; deben leerse junto al escalamiento vigente y las confirmaciones humanas posteriores, no como estado actual del trabajo.