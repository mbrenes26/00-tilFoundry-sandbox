---
id: "issue-2/discovery"
tipo: "discovery"
titulo: "Discovery inicial: función de saludo en Python"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "2ec6d2ee15d220f24a7a7fbea0b90e2282149c1c", "modelo": "gpt-6.1-sol"}
---
## Lo que la persona dijo
Quiere una función con pruebas para una pequeña librería de Python. Debe recibir un nombre y devolver «Hola, <nombre>!». Si el nombre viene vacío, debe devolver «Hola, mundo!».

## Repositorio observado
El inventario disponible solo contiene README.md, cuyo contenido es el título «00-tilFoundry-sandbox». No se observaron código, tests ni configuración de ejecución.

## Inferencias
Se propone tratar este pedido como un desarrollo nuevo (greenfield), pendiente de confirmación de la persona.

## Supuestos y datos no verificados
No está definido si un nombre compuesto solo por espacios cuenta como vacío. Tampoco están definidos el nombre público de la función, la estructura de la librería ni el comando de pruebas. No hay registro de cerebro disponible; no se presuponen decisiones vigentes.

## Pendiente
Confirmar que se creará la librería desde cero en este repositorio y aclarar el comportamiento para nombres compuestos solo por espacios. Todavía no hay discovery confirmado ni spec aprobada.