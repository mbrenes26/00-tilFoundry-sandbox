---
id: "issue-4/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec: prototipo navegable de la nave lunar"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "cfb284c46ee81b6dba0c51b76ba60eb435444629", "modelo": "gpt-6.1-sol"}
---
# Solución: issue-4 — Primera vista de la nave lunar

## Necesidad y resultado
Entregar un prototipo pixel art de navegador que muestre toda la nave, permita recorrer su pasillo e identificar sus seis salas. Los recursos y objetivos sugieren una misión, pero permanecen estáticos. Discovery confirmado en el issue #4.

## Cerebro consultado
Se consultó leer_registro(tipo=cerebro): no existe. No hay decisiones vigentes disponibles. Repositorio greenfield confirmado e inventario con solo README.md. Las plantillas de la metodología no están accesibles con las herramientas de esta ejecución; se explicitan necesidad, alcance, criterios, exclusiones y verificación.

## Decisiones para el cerebro
Propuestas sujetas a aprobación de esta spec: HTML, CSS y JavaScript de navegador, sin frameworks, servidor, instalación, proceso de compilación ni dependencias remotas; recursos visuales originales locales o dibujados por código. La entrega se ejecuta mediante file:// abriendo index.html. No modificar README.md ni configuración del repositorio.

## Organización
Una única línea porque presentación, movimiento e interacción forman un prototipo pequeño que se verifica como unidad. No hay contrato entre líneas.
Riesgo declarado por Core: medium. No se incluye despliegue ni modificación de producción.

# Línea: nave

## Objetivo
Construir la escena completa de la nave y su recorrido local, con paneles estáticos y una interacción breve junto a las puertas.

Alcance: `index.html`, `styles.css`, `game.js`, `tests/`

## Diseño y comportamiento
- Escena cenital pixel art sobre fondo espacial oscuro con estrellas; bordes y figuras nítidos, sin depender de imágenes remotas.
- Dos filas de tres salas y un pasillo horizontal entre ellas, con puertas orientadas al pasillo. Propuesta concreta para aprobar: arriba, de izquierda a derecha, Puente de Mando, Laboratorio y Soporte Vital; abajo, Habitaciones, Almacén y Sala de Máquinas. No se afirma reproducir exactamente las imágenes adjuntas.
- Nombres de las seis salas visibles en la escena. Un astronauta reconocible empieza en una posición válida del pasillo.
- Panel superior, en este orden: Oxígeno 85 %, Energía 70 %, Combustible 60 %, Comida 90 % y Agua 75 %. Cada recurso tiene icono distinguible, nombre, barra proporcional y porcentaje textual.
- Panel derecho titulado «Objetivo actual», con «Revisar los sistemas de la nave», «Recoger muestras lunares» y «Preparar el despegue». Ninguna tarea se puede completar.
- Flechas y WASD desplazan al astronauta mientras se mantienen pulsadas; al soltar, se detiene. Movimiento basado en tiempo transcurrido, no en repetición de teclas; diagonal normalizada. Limitar su cuerpo completo al pasillo: no atravesar paredes ni puertas ni entrar en salas. Al perder el foco se limpian las teclas activas para evitar movimiento atascado. Las flechas no desplazan la página durante el juego.
- E cerca de una puerta muestra un letrero con el nombre exacto de esa sala. Definir cerca como distancia máxima de 48 unidades lógicas al punto de interacción de la puerta; si hubiera empate, elegir la puerta más cercana con desempate estable. Fuera de ese radio E no muestra un nombre nuevo. El mensaje se oculta al salir del radio de la puerta seleccionada y se sustituye al interactuar con otra puerta.
- Una indicación visible explica «Flechas o WASD para moverte. E junto a una puerta para identificar la sala».
- Referencia de aceptación visual: ventana de escritorio de 1280 × 720 píxeles CSS, a zoom 100 %. Toda la nave y ambos paneles deben estar visibles a la vez, sin scroll ni cámara. Al redimensionar, conservar proporciones y coordenadas de movimiento/interacción mediante escalado uniforme. No se exige control táctil.

## Criterios de aceptación y evidencia requerida
1. Abrir index.html directamente en un navegador de escritorio permite jugar sin instalación, servidor ni conexión. Verificar con apertura local y red desconectada; no hay errores de consola ni solicitudes externas necesarias.
2. A 1280 × 720 se ven simultáneamente las seis salas, sus nombres, el pasillo, el astronauta, los recursos y los objetivos, con la disposición y fondo definidos. Evidencia visual y revisión manual; no reemplazarla por una prueba de lógica.
3. Los cinco recursos muestran exactamente los valores aprobados, iconos y barras proporcionales. El panel de objetivos contiene los tres textos exactos. Pruebas de datos/presentación y revisión visual; comprobar que no cambian al moverse, interactuar o esperar.
4. Flechas y WASD funcionan para cada dirección; soltar o perder foco detiene al astronauta. Distintos intervalos de actualización producen desplazamientos equivalentes dentro de tolerancia numérica, sin ventaja diagonal. Pruebas deterministas de movimiento y comprobación manual de ambos controles.
5. El cuerpo del astronauta permanece en el pasillo, incluso manteniendo direcciones contra sus límites. Pruebas de colisión en todos los bordes y esquinas, y revisión manual.
6. Para cada una de las seis puertas, E dentro del radio muestra su nombre exacto; fuera del radio no activa otra sala. Se respeta el desempate, la sustitución y el ocultamiento descritos. Pruebas de proximidad, límites del radio y estado del mensaje, más recorrido manual por las seis puertas.
7. La escena no pierde nitidez ni desajusta colisiones al escalar. Comprobar al menos la ventana de referencia y una ventana de 1600 × 900; documentar los navegadores y dimensiones realmente probados, sin afirmar compatibilidad no verificada.

## Plan de pruebas
Añadir en tests/ un ejecutor HTML/JavaScript local sin instalación que pruebe la lógica determinista y los datos estáticos, con resultados legibles de aprobado/fallido. Mantener esa lógica separable de la animación para verificarla sin depender del tiempo real. Constructor: TDD por criterio automatizable, con fallos previos y resultados posteriores registrados por Core. Probador: ejecución independiente de la batería completa y recorrido visual/manual de los criterios de navegador, con comandos o pasos, resultados y evidencia real. Las pruebas lógicas no bastan para acreditar fluidez, aspecto ni funcionamiento file://. No se consideran ejecutadas en esta fase.

## Exclusiones y límites
No modificar README.md, .github/ ni archivos fuera del alcance. No implementar interiores explorables, despegue, inventario, mapa adicional, gestión de recursos, objetivos completables, audio, persistencia, multijugador, backend o despliegue. Sin fidelidad exacta a imágenes no inspeccionadas. Sin instalación para quien juega; no introducir herramientas de construcción obligatorias.

## Entrega
Archivos locales index.html, styles.css y game.js, más pruebas bajo tests/. Instrucción de apertura incluida en la revisión del cambio: descargar los archivos conservando su estructura y abrir index.html. El PR debe enlazar al issue #4 e incluir evidencia por criterio y límites de la verificación. Nada se construye hasta que Core registre la aprobación humana de SPECIFIED.