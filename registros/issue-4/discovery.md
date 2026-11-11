---
id: "issue-4/discovery"
tipo: "discovery"
titulo: "Discovery para confirmar: primera vista navegable de la nave lunar"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "8d4582eedb301a25de605c60795c7392e8fdc563", "modelo": "gpt-6.1-sol"}
---
## Necesidad de fondo
Crear un primer prototipo visual y navegable que haga sentir a la persona dentro de una nave espacial, con movimiento fluido, curiosidad por sus salas y una misión sugerida por paneles estáticos.

## Lo que dijo la persona
- Confirma que se empieza desde cero y que solo existe README.md.
- Quiere ver toda la nave de un vistazo, con estética pixel art y seis salas: Puente de Mando, Laboratorio, Soporte Vital, Habitaciones, Almacén y Sala de Máquinas.
- El astronauta se mueve por el pasillo con flechas o WASD; no entra en las salas.
- Cerca de la puerta de una sala, pulsar E muestra su nombre mediante un letrero o mensaje breve.
- Arriba aparecen oxígeno, energía, combustible, agua y comida, cada uno con barra y porcentaje. A la derecha aparece «Objetivo actual» con tareas. Ambos paneles son estáticos.
- Debe ejecutarse abriendo un archivo HTML en el navegador, sin instalar nada.
- Quedan fuera: nivel de despegue, inventario, mapa adicional, exploración del interior de las salas, consumo temporal de recursos y cumplimiento de objetivos.

## Repositorio y clasificación
Proyecto desde cero (greenfield), confirmado por la persona. Inventario leído en esta ejecución: únicamente README.md, cuyo contenido es «# 00-tilFoundry-sandbox». No existe código, stack, pruebas ni procedimiento de ejecución actuales.

## Inferencias
La entrega es un prototipo de exploración visual, no una simulación ni una misión jugable completa. Mantener toda la nave visible evita que el recorrido dependa de una cámara que oculte partes de ella.

## Supuestos y propuestas pendientes
No hay valores de recursos ni textos de tareas aprobados. Se propone empezar con todos los recursos al 100 % y tres tareas decorativas: «Revisar los sistemas», «Inspeccionar las salas» y «Preparar la misión lunar». Son propuestas para confirmar, no requisitos aprobados.

## No verificado
Las imágenes adjuntas no se han podido inspeccionar con las herramientas disponibles; no se afirma haber comprobado su distribución, colores, porcentajes ni textos. leer_registro(tipo=cerebro) y leer_registro(tipo=spec-solucion) devuelven «No existe». No hay decisiones de arquitectura disponibles en la memoria consultada.

## Estado y siguiente decisión
Estado vigente de Core: DISCOVERING; riesgo declarado: medium. Discovery pendiente de confirmación de la persona. Se le mostrará este resumen y se le pedirá confirmar también los valores y textos estáticos propuestos o indicar los que prefiere. Todavía no se solicita SPECIFIED ni se construye.