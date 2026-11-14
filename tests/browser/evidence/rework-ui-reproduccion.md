# Paso 3: reproducción y resultado en teléfono

## Comandos y resultados del constructor

- Node.js de la sesión: `v22.23.5`.
- `git status --short && git rev-parse HEAD ...`: salida 128; la sesión no contiene `.git`. La base d051334 es la informada por Core; no se comprobó mediante Git local.
- `npm ci && npx playwright install chromium && npx playwright test tests/browser/playback.spec.ts --grep 'acciones|final real' --workers=1`: salida 0; instalación de 55 paquetes y Chromium 158.0.8127.18; cuatro regresiones aprobadas en 48,8 s. npm informa una vulnerabilidad de severidad baja; este paso no cambia dependencias.

## Evidencia por criterio

- I-1: Chromium con viewport 390×844 y escritorio 1600×1000. `checkLayout` comprueba HUD y panel por debajo del canvas en móvil, ausencia de scroll interno del panel, fuente del panel ≥14px, controles ≥44px y ancho de documento 390px. En escritorio comprueba panel dentro del canvas. Revisión visual de las cuatro capturas confirma mapa completo y paneles sin cubrirlo. La configuración 1600×900/FIT/pixelArt no se modificó.
- I-2: en ambas resoluciones, 100 pulsos del callback real de LaunchScene coinciden en acción y estado serializado con inferencia y motor puros. Política permanece idéntica. Los cinco indicadores coinciden con el estado. Pausa y cambio a 4× mientras está pausado no avanzan estado; reinicio vuelve a paso 0. Pulsos del temporizador a 4× (25ms) y 1× (100ms) se contrastan con un paso puro; reanudación y pausa funcionan.
- I-3: cada final se obtiene pulsando hasta un final real del motor, no inyectando un resultado. Resumen coincide con estado, pesos no cambian y «Reiniciar partida» vuelve a paso 0 con «Reanudar» visible. En ambos tamaños las capturas muestran 720 puntos, 0 vidas y 114 pasos; la captura de reproducción muestra 720 puntos, 1 vida y 100 pasos.
- Fixture compartida: `toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 })`; sintética y explícitamente no entrenada. Semilla de partida 42. No evidencia de aprendizaje.

## Capturas revisadas con ver_captura

- `rework-390-playback.png`: documento completo 390×1075 de viewport 390×844. HUD externo y controles legibles; «Reanudar», selector 1×, «Reiniciar» e importación visibles en el documento completo. Para acceder a todo se admite scroll del documento; no se afirma que todo quepa en 844px.
- `rework-390-final.png`: mapa completo, HUD legible y tarjeta de resultado separada con resumen y botón de reinicio completos.
- `rework-1600-playback.png`: mapa completo; HUD superior y controles a su derecha, sin cubrirlo.
- `rework-1600-final.png`: resultado separado a la derecha del mapa; resumen coincide con HUD y reinicio completo.
- Los rótulos secundarios dibujados dentro del canvas son pequeños en teléfono; el HUD externo ofrece los indicadores legibles. Se conserva el dibujo original. Un rectángulo oscuro de fondo sobre el panel de escritorio no cubre el tablero.

## Alcance y límites

- Se ejecutaron regresiones existentes; todas pasaron a la primera. No se descubrió una falla nueva ni se modificó implementación, por lo que no se reconstruyó un rojo histórico.
- Cambios: esta evidencia y capturas regeneradas de reproducción/final; Core determina cuáles imágenes cambiaron de bytes al confirmar.
- No se ejecutó cierre, suite completa, build ni entrenamiento. La verificación independiente corresponde al probador; este registro es solo del constructor.
- Chromium de sesión no certifica teléfono físico, Safari, Windows ni rendimiento de entrenamiento con 4 GB. Capturas no prueban interacción por sí solas: la interacción está cubierta por las regresiones ejecutadas.
