# Atrapa la estrella

Minijuego web en español para una persona, con ratón o pantalla táctil.

**Estado de construcción:** este primer paso prepara la instalación, el lienzo Phaser y las pruebas por HTTP. Las reglas y las pantallas jugables se incorporan en los siguientes pasos; los controles descritos abajo son los del juego previsto, todavía no están activos.

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

## Controles y reglas previstas

- Pulsa «Jugar» con clic o toque para empezar con cero puntos y cero fallos.
- Atrapa la única estrella visible con clic o toque: cada captura suma un punto. Tocar fuera no penaliza ni cambia el plazo.
- La primera estrella dura 2000 ms. Tras cada acierto, la siguiente dura `max(500, 2000 - 100 × puntaje)` ms.
- Dejar vencer una estrella suma un fallo; la siguiente conserva la duración vigente. En la frontera exacta del plazo prevalece el vencimiento.
- Al llegar a tres fallos termina la partida y se muestra el puntaje final. «Jugar otra vez» reinicia puntos, fallos y duración.
- Al ocultar la pestaña, el reloj se pausa. Al volver continúa con el tiempo restante, sin fallos acumulados por la pausa.

La resolución lógica del lienzo es 1600×900 con ajuste proporcional `Phaser.Scale.FIT` y `pixelArt: true`. Se comprobarán escritorio y teléfono mediante emulación táctil de Chromium, no certificación en teléfonos físicos.
