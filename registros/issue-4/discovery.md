---
id: "issue-4/discovery"
tipo: "discovery"
titulo: "Discovery confirmado: primera vista navegable de la nave lunar"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "5ff079c56d35fa422eeaa74a11e440ab6be09b8c", "modelo": "gpt-6.1-sol"}
---
## Necesidad de fondo
Crear un prototipo visual y navegable que haga sentir a la persona dentro de una nave espacial: nave completa visible, movimiento fluido, curiosidad por las salas y paneles que sugieran una misión sin cambiar todavía.

## Lo que dijo y confirmó la persona
Confirmó el resumen del discovery en el issue #4 y pidió preparar la especificación. Proyecto desde cero: solo existe README.md. El juego se abre desde un HTML en el navegador, sin instalar nada. Estética pixel art, fondo espacial oscuro con estrellas y seis salas en dos filas de tres, con un pasillo central. Puente de Mando a la izquierda y Sala de Máquinas a la derecha. Las otras salas son Laboratorio, Soporte Vital, Habitaciones y Almacén. El astronauta se mueve solo por el pasillo con flechas o WASD. Cerca de una puerta, E muestra el nombre de la sala; no se entra.
Los recursos estáticos, en el orden descrito, son Oxígeno 85 %, Energía 70 %, Combustible 60 %, Comida 90 % y Agua 75 %, cada uno con icono, barra y porcentaje. El panel derecho «Objetivo actual» muestra «Revisar los sistemas de la nave», «Recoger muestras lunares» y «Preparar el despegue».
Quedan fuera despegue, inventario, mapa adicional, interiores explorables, consumo temporal de recursos y cumplimiento de objetivos.

## Repositorio
Greenfield confirmado. Inventario consultado: únicamente README.md; no hay código ni pruebas existentes.

## Inferencias
Es una experiencia de exploración visual, no una misión completa. Las tareas del panel son ambientación, no funciones implementadas.

## Propuestas para la spec
Usar HTML, CSS y JavaScript locales, sin dependencias de red. Distribuir Puente de Mando, Laboratorio y Soporte Vital arriba; Habitaciones, Almacén y Sala de Máquinas abajo. Esta distribución concreta de las cuatro salas intermedias es una propuesta, no una descripción verificada de la imagen.

## No verificado
No se inspeccionaron las imágenes; los detalles proceden de la descripción humana. No existe registro cerebro ni spec-solucion. Las plantillas de la metodología no están disponibles mediante el inventario de la rama.

## Estado
Discovery confirmado. Estado vigente DISCOVERING, riesgo medium. El siguiente paso es someter la spec a aprobación, no implementar.