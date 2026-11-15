---
id: "issue-11/discovery"
tipo: "discovery"
titulo: "Discovery de Atrapa la estrella"
version: 1
estado: "borrador"
solucion: "issue-11"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "23b5a21e878713e533cd0d5264f8468426a132dd", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 43764, "tokens_salida": 814, "monto_ia": 0.016658, "minutos_computo": 0, "monto_computo": 0.0}
---
# Discovery: issue-11

Fecha: 2026-11-15
Participantes: mbrenes26, solicitante.

## La situación en palabras de la persona
Quiere un minijuego de navegador para un solo jugador: una estrella aparece al azar y debe atraparse con clic o toque antes de desaparecer. Cada acierto suma un punto y reduce la duración de la siguiente estrella. Tres fallos terminan la partida. Pide pantalla inicial con título y botón «Jugar», puntaje final y botón para volver a jugar, compatibilidad con escritorio y teléfono y pixel art simple.

## Necesidad de fondo
Disponer de un juego sencillo de reacción, jugable con ratón o pantalla táctil. No se identificó un problema operativo adicional ni un público más específico.

## Mejora deseada
Una partida individual de dificultad creciente, con inicio y reinicio claros, sin que haga falta otro jugador.

## Repositorio
Greenfield confirmado por la persona con «Confirmado. Proceder» en el mensaje #10, tras la propuesta del mensaje #9. Inventario comprobado en esta ejecución: solo README.md, con el título del repositorio; no hay código, tests ni instrucciones de ejecución. Se respetarán las decisiones vigentes C-2, C-3, C-4, C-5 y C-7. C-8 regula entrenamiento neuronal, que no es parte de este pedido.

## Clasificación de lo que se sabe
| Afirmación | Tipo |
|---|---|
| Juego individual, estrella aleatoria, puntos, dificultad creciente y fin tras tres fallos | DICHO |
| Escritorio y teléfono, clic y toque, pixel art y pantallas de inicio y resultado | DICHO |
| Construcción desde cero en este repositorio | DICHO, confirmado en #10 |
| El repositorio solo contiene README.md | VERIFICADO mediante inventario y lectura |
| La finalidad es entretenimiento sencillo y ejercicio de reacción | INFERIDO |
| Solo dejar desaparecer la estrella cuenta como fallo; tocar fuera no penaliza | INFERIDO de «Confirmado. Proceder» tras la recomendación; se explicita en el resumen para confirmación |
| Duración inicial, reducción por acierto y duración mínima | NO VERIFICADO; se propondrán en la spec |
| Publicación en un hosting | NO VERIFICADO y fuera de la entrega de código conforme a C-4 |

## ¿Se necesita software?
Sí: la interacción, los tiempos y el puntaje requieren implementar el juego.

## Confirmación de la persona
La persona confirmó el carácter greenfield en #10. El resumen completo de la necesidad todavía está pendiente de confirmación; no existe aprobación de spec.