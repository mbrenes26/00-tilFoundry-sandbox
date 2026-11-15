# rework-ui-inicio (paso 2/3)

## Evidencia histórica recuperada

- Base del paso: commit `a86643a69805ddd53b19107b252de6fa3e8acbe5`, PR #9.
- `tests/browser/evidence/rework-ui-1.md` conserva el comando histórico `npx playwright test tests/browser/resize.spec.ts tests/browser/playback.spec.ts --workers=1` y su resumen: rojo previo al CSS, 5 fallos/4 correctas (panel y=171.03125 frente a borde del canvas=333.375; HUD=9px frente a mínimo=14px); verde posterior, 9 correctas.
- Es un resumen guardado, no la salida cruda de Core. `leer_conversacion` solo devolvió los comentarios recientes; no se recuperó aquí el registro original ni su identificador de salida. No se simula ni se vuelve a producir ese rojo histórico. Las pruebas de reproducción/final del comando histórico NO se ejecutaron en este paso.

## Ejecución actual

- `node --version; npm ci`: código 0; Node v22.23.5, 55 paquetes instalados, una vulnerabilidad baja informada. No se modificaron dependencias.
- `npx playwright install chromium; npx playwright test tests/browser/resize.spec.ts --workers=1`: código 0; Chromium 158.0.8127.18 instalado; 3/3 pruebas existentes correctas, 12,0 s.
- Se amplió exclusivamente la cobertura de inicio: FIT explícito, los cinco indicadores iniciales y validación/recuperación móvil mediante selector de archivo real. No se cambió la implementación. Son comprobaciones adicionales de comportamiento existente, no TDD de una corrección nueva.
- `npx playwright test tests/browser/resize.spec.ts --workers=1`: código 1; 3 correctas/1 fallo de la comprobación añadida: `Failed to resolve module specifier 'phaser'` dentro de `page.evaluate`. Es un defecto del test, no una regresión del producto.
- Se corrigió esa comprobación para comparar `game.scale.scaleMode` con 3, valor de `Phaser.Scale.FIT` confirmado en `node_modules/phaser/src/scale/const/SCALE_MODE_CONST.js` (`FIT: 3`).
- `npx playwright test tests/browser/resize.spec.ts --workers=1`: código 0; 4/4 correctas, 25,8 s. Salida de Core de esta ejecución: comando 5. No se ejecutó suite completa, build, reproducción ni resultado.

## Cobertura seleccionada

- I-1, escritorio: inicio visible, canvas 16:9, panel dentro del canvas y botón iniciar deshabilitado.
- I-1, móvil 390×844: panel debajo del canvas; sin scroll interno ni desbordamiento horizontal; botones >=44px; cinco escenas, resolución lógica 1600×900, pixelArt=true y FIT.
- I-1/I-2, móvil: puntos=0, vidas=3, fase=dispersión, poder=0 y pasos=0; los cinco indicadores >=14px; HUD entre canvas y panel.
- I-3, móvil: selección de archivo mediante filechooser; JSON corrupto e incompatible muestran error español y deshabilitan iniciar tras una política válida; recuperación con fixture válida; error de semilla y recuperación; controles visibles alcanzables mediante scroll del documento; sin errores de página ni inicio de reproducción.
- Fixture: `toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 })`, sintética y no entrenada. El mensaje lo declara explícitamente.

## Capturas y revisión del constructor

- `rework-mobile-start-viewport.png`: viewport exacto 390×844. HUD y panel separados del canvas; texto externo legible; iniciar visible y con aspecto deshabilitado. El cierre del panel queda debajo del viewport y requiere scroll del documento.
- `rework-mobile-start.png`: documento completo de inicio sin política, con viewport 390×844.
- `rework-mobile-start-valid.png`: documento completo tras recuperación de política y semilla; imagen 390×1103 con viewport 390×844. Muestra aviso sin entrenamiento, controles completos e iniciar con aspecto habilitado. No es una captura de viewport de altura 844.
- `rework-desktop-start.png`: documento completo con viewport 1920×600; imagen 1920×1017. HUD, panel y tablero completos y separados; no afirma que todo quepa en 600px sin scroll.
- Las tres capturas start-viewport, start-valid y desktop-start se revisaron con `ver_captura`. Las etiquetas secundarias dibujadas dentro del canvas siguen siendo diminutas en móvil; el HUD externo proporciona los indicadores legibles. Se conserva la escala y el dibujo originales.
- Las imágenes no prueban interacción ni validación: eso lo comprueban las pruebas. La comprobación independiente del probador sigue pendiente. No certifica teléfono físico ni Windows.

## Cambios

- `tests/browser/resize.spec.ts`: cobertura dirigida adicional; implementación y regresiones previas conservadas.
- `tests/browser/evidence/rework-mobile-start-valid.png`: captura nueva.
- `tests/browser/evidence/rework-ui-inicio.md`: este registro.
- Se regeneraron las capturas de inicio ya existentes; Core determina si sus bytes cambiaron al confirmar. No se tocaron escenas, CSS, contratos, documentación de comandos ni archivos fuera del alcance del paso.
