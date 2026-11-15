---
id: "issue-11/discovery"
tipo: "discovery"
titulo: "Discovery confirmado de Atrapa la estrella"
version: 1
estado: "borrador"
solucion: "issue-11"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "38deda37658c71007352cb88d99833ceabeb58ce", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 47396, "tokens_salida": 804, "monto_ia": 0.019212, "minutos_computo": 0, "monto_computo": 0.0}
---
# Discovery: issue-11

Fecha: 2026-11-15
Participantes: mbrenes26, solicitante.

## La situación en palabras de la persona
Quiere un minijuego de navegador para un solo jugador: una estrella aparece al azar y debe atraparse con clic o toque antes de desaparecer. Cada acierto suma un punto y reduce la duración de la siguiente estrella. Tres fallos terminan la partida. Pide pantalla inicial con título y botón «Jugar», puntaje final y botón para volver a jugar, escritorio y teléfono y pixel art simple.

## Necesidad de fondo
Disponer de un juego sencillo de reacción con ratón o pantalla táctil. No se identificó un problema operativo adicional ni un público más específico.

## Mejora deseada
Una partida individual de dificultad creciente, con inicio y reinicio claros.

## Repositorio
Greenfield confirmado en el mensaje #10. Inventario y lectura comprobados: solo README.md con el título del repositorio; no hay código ni tests. Se usarán TypeScript 5, Phaser 3, Vite 6, Vitest 4 y Playwright 1 conforme a C-7; ejecución HTTP local con Node.js 22 conforme a C-4. Se respetarán C-2, C-3 y C-5. C-8 no aplica al pedido.

## Clasificación de lo que se sabe
| Afirmación | Tipo |
|---|---|
| Juego individual, estrella aleatoria, puntos, dificultad creciente y fin tras tres fallos | DICHO |
| Escritorio y teléfono, clic y toque, pixel art e inicio y resultado | DICHO |
| Construcción desde cero | DICHO, confirmado en #10 |
| Solo desaparecer sin atraparla cuenta como fallo; tocar fuera no penaliza | DICHO, confirmado en #13 |
| Entrega para ejecución local; publicación excluida | DICHO, confirmado en #13 |
| El repositorio solo contiene README.md | VERIFICADO con inventario y lectura |
| Su finalidad es entretenimiento y reacción | INFERIDO |
| Los tiempos concretos son adecuados para el público | NO VERIFICADO; se propondrán para aprobación en la spec |

## ¿Se necesita software?
Sí: la interacción, los tiempos y el puntaje requieren implementar el juego.

## Confirmación de la persona
«Confirmado», mensaje #13 del 2026-11-15, en respuesta al resumen completo del mensaje #12, incluida la regla de fallos y la entrega local.