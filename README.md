# Atrapa la estrella

Minijuego web en español para una persona, con ratón, pantalla táctil o teclado.

El juego incluye una pantalla de inicio con «Jugar», una partida con una estrella activa e indicadores de puntos y fallos, y una pantalla de resultado con el puntaje final y «Jugar otra vez». Los botones y la estrella responden a clic o toque. Durante la partida, pulsa Tab para enfocar «Atrapar estrella» y Enter o Espacio para capturar la estrella actual. El foco tiene un contorno visible; mantener una tecla pulsada no captura estrellas sucesivas. La acción también admite clic o toque y respeta el vencimiento y la pausa al ocultar la pestaña. Las reglas y los controles disponibles se explican abajo.

## Instalación y desarrollo

Requiere **Node.js 22** y npm. Desde la raíz del repositorio:

```sh
npm ci
npm run dev
```

Abre la dirección HTTP que muestra Vite (normalmente `http://localhost:5173`). No abras `index.html` directamente: **file:// no está soportado**. No hay backend ni servicios externos durante el juego.

Versiones fijadas: TypeScript 5.9.3, Phaser 3.90.0, Vite 6.4.6, Vitest 4.1.12 y Playwright 1.65.0. No deben sustituirse las versiones aprobadas para resolver una instalación fallida.

El bloqueo se generó con npm 11.6.2 porque npm 10.9.9 falló al resolver dependencias iniciales (`edgesOut`). La instalación limpia `npm ci` desde ese bloqueo sí funciona con npm 10.9.9. No hace falta regenerar el bloqueo para ejecutar el proyecto.

## Pruebas

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

Las pruebas unitarias usan Vitest; las de navegador usan Chromium mediante Playwright. En Linux, si faltan bibliotecas del sistema para Chromium, instala sus dependencias con `npx playwright install --with-deps chromium` (puede requerir permisos de administrador). Las pruebas de navegador inician y detienen su propio servidor HTTP en `127.0.0.1:4173`; deja ese puerto libre.

Para verificar el cierre completo, después de instalar Chromium, ejecuta una sola cadena en una terminal POSIX:

```sh
npm test && npm run build && npm run test:e2e -- --workers=2 && TEST_STATIC=1 npm run test:e2e -- --workers=2
```

Cada etapa espera a que termine la anterior y la cadena se detiene si falla alguna. No ejecutes dos suites de navegador a la vez: ambas usan el puerto 4173 y reemplazan los mismos resultados. Si aparece «already used», espera a que termine la suite que ya está en marcha o detén el servidor de vista previa que hayas iniciado; después repite la etapa fallida. No reutilices un servidor desconocido ni cambies la configuración para omitir esa comprobación.

## Versión estática

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

El build verifica tipos y genera `dist/`. Abre `http://127.0.0.1:4173` para comprobarlo. Para probar automáticamente la carga de la versión estática, detén antes el servidor de vista previa y ejecuta:

```sh
TEST_STATIC=1 npm run test:e2e
```

El último comando usa sintaxis de terminal POSIX. La publicación y la elección de hosting quedan fuera de este trabajo.

## Controles y reglas

- Pulsa «Jugar» con clic o toque para empezar con cero puntos y cero fallos.
- Atrapa la única estrella visible con clic o toque: cada captura suma un punto. Tocar fuera no penaliza ni cambia el plazo.
- La primera estrella dura 2000 ms. Tras cada acierto, la siguiente dura `max(500, 2000 - 100 × puntaje)` ms.
- Dejar vencer una estrella suma un fallo; la siguiente conserva la duración vigente. En la frontera exacta del plazo prevalece el vencimiento.
- Al llegar a tres fallos termina la partida y se muestra el puntaje final. «Jugar otra vez» reinicia puntos, fallos y duración.
- Al ocultar la pestaña, el reloj se pausa. Al volver continúa con el tiempo restante, sin fallos acumulados por la pausa.

La resolución lógica del lienzo es 1600×900 con ajuste proporcional `Phaser.Scale.FIT` y `pixelArt: true`. Se comprobaron escritorio y teléfono mediante emulación táctil de Chromium. La emulación táctil no certifica teléfonos físicos.

## Verificación realizada

Con Node.js 22.23.5 y npm 10.9.9 se ejecutaron una instalación limpia con `npm ci`, las pruebas unitarias, `npm run build` y toda la suite Chromium tanto con el servidor de desarrollo como con la versión estática por HTTP (`TEST_STATIC=1 npm run test:e2e -- --workers=2`). Las versiones aprobadas se mantuvieron. El build termina correctamente; Vite advierte que el paquete principal, que incluye Phaser, supera 500 kB sin comprimir.

Las pruebas de interacción controlan el azar y el reloj desde Playwright, sin controles de trampa en la interfaz. Comprueban posiciones en los dos extremos y el centro del área, clic y toque, entrada fuera sin alterar el plazo, redistribución del mismo evento de ratón y toque, vencimiento prioritario en la frontera, duración reducida, mínimo de 500 ms y actualización después de un frame retrasado. También verifican la acción accesible con teclado en escritorio y teléfono emulado. Las reglas y la geometría permanecen independientes de Phaser.

Las tres pantallas (inicio, partida y resultado) se midieron en las cuatro ventanas. No se detectaron recortes, superposiciones de elementos informativos ni desplazamiento horizontal. El lienzo conserva 1600×900 píxeles lógicos y ajuste proporcional FIT; sus dimensiones CSS son menores cuando el título ocupa espacio vertical. El texto informativo mínimo fue 16 px CSS y los botones midieron 160×52 px («Jugar») y 196,38×52 px («Jugar otra vez»).

| Ventana CSS | Lienzo CSS medido | Límites de la silueta y zona interactiva en CSS |
| --- | --- | --- |
| 1280×720 | 1141,33×642 | 159,79×159,79 |
| 1600×900 | 1461,33×822 | 204,59×204,59 |
| 360×800 | 360×202,50 | 50,40×50,40 |
| 390×844 | 390×219,38 | 54,60×54,60 |

Estos rectángulos son los límites de la silueta, no superficies cuadradas de captura: las esquinas transparentes no capturan. Las pruebas observan el sprite real, sus transformaciones, los píxeles de ambos fotogramas y el contorno interactivo; proyectan sus límites a píxeles CSS y comprueban contención, separación de indicadores y mínimo de 44×44. No deducen el tamaño mostrado únicamente de constantes. En el teléfono menor, el área válida mide 309,60×108 px CSS, suficiente para los límites de estrella de 50,40×50,40 px, separados de los indicadores y controles.

Cada ejecución de `npm run test:e2e` guarda capturas con prefijos `inicio-`, `partida-`, `resultado-` y `medidas.json` en las carpetas `test-results/ventanas-*`. Esos archivos son resultados generados, no recursos del juego; Playwright los reemplaza al volver a ejecutar la suite. Para abrir el informe con las medidas adjuntas, ejecuta `npm run test:e2e -- --workers=2 --reporter=html` y después `npx playwright show-report`. La comprobación se limita a Chromium y emulación táctil, no a teléfonos físicos ni a otros navegadores.
