---
id: "issue-2/discovery"
tipo: "discovery"
titulo: "Discovery confirmado: librería de saludo en Python"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "662c8c60e86fff7a6c22efdcb88f23f657aa01e6", "modelo": "gpt-6.1-sol"}
---
## Necesidad
Crear desde cero una pequeña librería de Python que devuelva un saludo por nombre, con pruebas automatizadas mediante pytest.

## Lo que la persona confirmó
En el issue #2, el 2026-11-11, confirmó el resumen y la propuesta de conservar el nombre tal como se recibe.
- Un nombre como `Ana` devuelve `Hola, Ana!`.
- Una cadena vacía o compuesta solo por espacios devuelve `Hola, mundo!`.
- En nombres no vacíos se conserva el texto completo, incluidos los espacios alrededor.
- Se trata de un desarrollo nuevo y las pruebas utilizan pytest.

## Repositorio observado
El inventario actual contiene únicamente `README.md`. El discovery anterior documentó que contiene el título del proyecto. No hay implementación ni pruebas existentes; la persona confirmó que se trabaja desde cero.

## Inferencias
Una sola línea de producto cubre la función y sus pruebas. La función devuelve texto y no imprime.

## Supuestos y datos no verificados
No se ha solicitado admitir entradas que no sean cadenas. No hay registro de cerebro disponible al consultarlo. No se han ejecutado pruebas. El nombre de la función y la estructura de archivos se proponen en la spec, no son decisiones previas de la persona.

## Alcance
Función de saludo y pruebas con pytest. Se conserva `README.md` sin cambios. No se incluyen otras funcionalidades.

## Confirmación
Discovery confirmado explícitamente por la persona; permite redactar la spec, pero no autoriza construir.