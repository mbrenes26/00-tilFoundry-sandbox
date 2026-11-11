---
id: "issue-2/discovery"
tipo: "discovery"
titulo: "Discovery para confirmar: librería de saludo en Python"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "b34d3e313069f8497beb20b62b56cc410a3808f5", "modelo": "gpt-6.1-sol"}
---
## Necesidad
Crear una pequeña librería de Python que devuelva un saludo por nombre, con pruebas automatizadas mediante pytest.

## Lo que la persona dijo
- La función recibirá un nombre y devolverá `Hola, <nombre>!`.
- Una cadena vacía devolverá `Hola, mundo!`.
- Un nombre compuesto solo por espacios también contará como vacío.
- La librería se creará desde cero en este repositorio y utilizará pytest.

## Repositorio observado
El inventario contiene únicamente README.md, con el título `00-tilFoundry-sandbox`. No se observaron código, pruebas ni configuración de ejecución. La persona confirmó que es un desarrollo nuevo (greenfield).

## Inferencias
Una sola línea de producto puede cubrir la función y sus pruebas. El resultado del saludo se devuelve como texto; no se requiere mostrarlo en pantalla.

## Supuestos y datos no verificados
- No se ha definido el nombre público de la función ni la estructura de archivos; se propondrán en la spec.
- No se ha definido si se conservan los espacios alrededor de un nombre no vacío. La propuesta para confirmar es conservar el nombre tal como se recibe y usar la comprobación de espacios únicamente para detectar nombres vacíos.
- No se han solicitado entradas distintas de cadenas de texto ni validaciones para ellas.
- No existe un registro de cerebro disponible: no se presuponen decisiones vigentes.
- No se han ejecutado pruebas; todavía no hay implementación.

## Alcance propuesto
Función de saludo para nombres de texto y pruebas con pytest de un nombre normal, una cadena vacía y una cadena compuesta solo por espacios. Sin modificar README.md ni añadir funciones ajenas al saludo.

## Pendiente de confirmación
Mostrar este resumen a la persona y obtener su confirmación antes de redactar la spec. El estado sigue siendo DISCOVERING; no existe spec aprobada.