---
id: "issue-6/discovery"
tipo: "discovery"
titulo: "Discovery en curso: inicio desde cero, ejecución local y recursos originales"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "fad867479158fcd88f9c04cf6486ee1100388d43", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 18145, "tokens_salida": 772, "monto_ia": 0.016992, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo
- Público: jugadores casuales de 13 años en adelante, interesados en gestión ligera o en el espacio, sin conocimientos técnicos previos.
- Experiencia central: dirigir una misión con toda la base a la vista, elegir el orden de las acciones y ver sus consecuencias; el despegue debe sentirse como recompensa.
- Aprendizaje integrado: dependencias del lanzamiento, priorización de presupuesto/repuestos/tiempo e importancia de reparar y verificar.
- Primer nivel: partidas de 10 a 15 minutos, interfaz comprensible sin tutorial largo, fallo con explicación para reintentar, pixel art, español y Phaser 3.
- Confirma que se empieza desde cero (greenfield), sin código ni recursos gráficos externos. La referencia visual es el mockup que indica haber adjuntado al issue.
- Todos los gráficos, incluidos personajes, salas, cohete e íconos, deben crearse como pixel art original y guardarse en el repositorio.
- La primera versión se ejecutará localmente con `npm run dev`. `npm run build` debe generar una versión estática alojable sin cambios.
- No ha elegido hosting; la publicación queda para otro trabajo, posiblemente con GitHub Pages.
## Evidencia del repositorio
El inventario actual devuelve únicamente README.md. La lectura registrada previamente mostraba solo el título «00-tilFoundry-sandbox». No aparecen implementación, dependencias, pruebas ni comandos de ejecución.
## Inferencias
La experiencia necesita decisiones comprensibles y consecuencias visibles, no una simulación técnica exhaustiva. Esto deberá confirmarse al concretar las reglas.
## Supuestos
No se fijan todavía fórmulas de balance, duración de acciones ni modelo de azar.
## No verificado y preguntas pendientes
- La herramienta devuelve el pedido original recortado en los requisitos no funcionales, después de la indicación de animar mediante spritesheets. Falta recuperar el resto antes de especificar.
- No se ha podido visualizar el mockup ni se dispone de un enlace al adjunto en la conversación recibida.
- Quedan por acordar el avance del reloj, el fallo o reprogramación al perder la ventana, las reglas de probabilidad de éxito y el balance para partidas de 10 a 15 minutos.
## Estado del discovery
El inicio desde cero y la ejecución local están confirmados. Aún no se ha presentado ni confirmado el resumen completo de discovery. No hay spec aprobada; el cerebro está vacío. La primera spec deberá fijar el stack y la ejecución, respetando Phaser 3 y la entrega estática solicitados.