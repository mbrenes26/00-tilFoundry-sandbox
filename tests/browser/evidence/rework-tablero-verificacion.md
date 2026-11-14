# I-1/I-2: verificación de teléfono y escritorio tras 63971c5

## Alcance y procedencia
- Paso `rework-ui-tablero-390-verificacion`, PR #9. Verificación del constructor; no sustituye la prueba independiente ni la aceptación de auditoría.
- Leídos `rework-tablero-390.md`, `rework-ui-reproduccion.md` y pruebas existentes. Se conserva la evidencia anterior: el único cambio de prueba es el prefijo de salida de capturas en `playback.spec.ts`, de `observable-` a `verification-`. No se modifica implementación, motor, inferencia, contrato ni dependencias.
- HTTP local `http://127.0.0.1:5173`, Chromium 158.0.8127.18 / Playwright chromium v1254, Node v22.23.5. Viewports 390×844 y 1600×900.
- Fixture PolicyV1 sintética: `toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 })`. Inicio importado con semilla 0; reproducción y final con semilla 42. No evidencia de aprendizaje.

## Comandos reales y resultado
1. `node --version; test -d node_modules && echo 'Dependencias disponibles'; python3 ...; npm run test:e2e -- tests/browser/presentation.spec.ts tests/browser/playback.spec.ts tests/browser/resize.spec.ts`: salida 127, `playwright: not found`. El script Python solo cambia el prefijo de capturas; no cambia aserciones.
2. `npm ci --ignore-scripts && npx playwright install chromium && npm run test:e2e -- tests/browser/presentation.spec.ts tests/browser/playback.spec.ts tests/browser/resize.spec.ts`: salida 0, **16 passed (1.6m)**. Instalación informa una vulnerabilidad low; no se ejecutó reparación ni se cambió el lockfile.
3. `node --input-type=module` con lectura del encabezado PNG y SHA-256 de `verification-*.png`: salida 0; dimensiones y hashes debajo. Core registra los comandos completos y su salida.
- Son regresiones existentes que pasan sin cambiar implementación. No hay nuevos criterios/asserts ni un rojo funcional nuevo: la falta de Playwright es preparación del entorno, no TDD rojo. No se reconstruye el rojo histórico del paso anterior.
- No se ejecutaron `npm test`, `npm run build` ni la suite completa de navegador: quedan para cierre.

## Cobertura ejecutada
- `presentation.spec.ts` (4): arranque HTTP, cinco escenas de C-3, 1600×900/FIT/pixelArt, carga/animación del atlas; dibujo sin mutar fixture, cinco indicadores, tweens, temporizadores y resultado; inventario de arte original y ausencia de setInterval; tablero y cinco actores opacos a 390 px.
- `resize.spec.ts` (6): escritorio 1920×600 con panel dentro del canvas; teléfono con panel/HUD fuera del canvas, fuentes ≥14 px, controles ≥44 px, sin scroll interno ni desbordamiento horizontal; secuencia 390 → 1600 → 390 → 1600 con tablero/actores íntegros y estado idéntico; Tab y foco en semilla/inicio, Enter para iniciar, Space para pausar, flechas para 4×/1×, Tab/Enter para reiniciar y `:focus-visible`.
- `playback.spec.ts` (6, tres por viewport): 100 acciones mediante el callback real `LaunchScene.pulse`, trayectoria idéntica al motor/inferencia puros y política intacta; cinco indicadores iguales al estado; pausa sin evolución, cambio de velocidad pausado sin evolución, reinicio, reanudación y pulsos reales de Phaser a 25 ms (4×) y 100 ms (1×) contra motor puro; final real con política intacta y reinicio. Las pruebas de importación/final I-3 incluidas en estos archivos también pasaron, sin cambios de criterio ni implementación.

## Medidas reales CSS
Obtenidas por `boardGeometry`, que proyecta el área opaca del frame del atlas (no su margen transparente). Valores de las capturas regeneradas:

| Viewport / fase | Tablero (x,y; ancho×alto) | Casilla | Luciérnaga opaca | Cada guardián opaco |
|---|---|---:|---|---|
| 390×844 / importación | 9,75;153; 370,5×292,5 | 19,5 | 17,0625×14,625 | 12,1875×13,40625 |
| 390×844 / reproducción | 9,75;153; 370,5×292,5 | 19,5 | 17,0625×14,625 | 12,1875×13,40625 |
| 390×844 / resultado | 9,75;153; 370,5×292,5 | 19,5 | 17,0625×14,625 | 12,1875×13,40625 |
| 1600×900 / importación | 80;237; 760×600 | 40 | 24×24 | 20×22 |
| 1600×900 / reproducción | 80;237; 760×600 | 40 | 28×24 | 20×22 |
| 1600×900 / resultado | 80;237; 760×600 | 40 | 28×24 | 20×22 |

- Los cinco actores aparecen visibles en todas estas mediciones. El test dedicado a 390 midió otro frame de luciérnaga de 14,625×14,625; la animación explica la diferencia.
- Canvas CSS móvil: 780×438,75, x=0, y=114; contenedor visible de 390 px. Se recorta la zona derecha ajena al tablero, no el mapa. Tablero termina en x=380,25; HUD y panel están debajo del canvas. Escritorio: canvas 1600×900, x=0,y=77; HUD encima del tablero y panel a su derecha.

## Revisión visual de las seis imágenes con ver_captura
- `verification-390-import.png`: tablero y bordes completos; figura alada clara y cuatro guardianes naranja/amarillo/violeta/celeste distinguibles por forma, color y posición. Política válida, inicio habilitado, cinco indicadores y controles completos, sin superposición.
- `verification-390-playback.png`: estado tras 100 pasos, 720 puntos y una vida; figura alada y cuatro guardianes reconocibles. Tablero completo, cinco indicadores y controles separados. La toma está **pausada**, tras terminar tweens; «Reanudar» es correcto. Tres objetos luminosos celestes pueden confundirse inicialmente con la luciérnaga; la silueta alada permite distinguirla, sin afirmar detalle perfecto.
- `verification-390-final.png`: final real de 114 pasos, 720 puntos y cero vidas. Actores y mapa íntegros; resumen y reinicio completos. Espacio vacío amplio entre tablero y HUD, sin ocultar contenido.
- `verification-1600-import.png`: tablero/actores completos, cinco indicadores alineados y panel válido legible. La identificación verbal del color/rol por el lector visual no es inequívoca; los cinco actores sí se ven. No se deduce su identidad solo del color.
- `verification-1600-playback.png`: actores distinguibles por color/forma, indicadores y controles completos. Persiste el rectángulo negro detrás de la parte superior del panel descrito en evidencia anterior; no cubre textos, controles ni tablero. No se atribuye origen ni se modifica implementación en este paso.
- `verification-1600-final.png`: tablero y figuras completos; resumen/indicadores/reinicio sin recortes. El lector visual no determina con precisión si el jugador está junto o superpuesto a un objeto claro; no hay superposición evidente de paneles.
- Conclusión de esta revisión: el tablero y la luciérnaga/guardianes se distinguen a 390 px, con detalles internos pequeños y guardianes de silueta similar. No hay recorte del mapa ni superposición de paneles/indicadores/controles. Las imágenes estáticas no demuestran movimiento ni foco; las pruebas ejecutadas cubren animación, controles, foco y evolución. La aceptación visual final sigue pendiente de auditoría.
- Capturas `fullPage: true`: incluyen el documento completo, no todo cabe simultáneamente en 844/900 px; se permite scroll vertical normal. En móvil las tomas miden 390×1322 (inicio), 390×1294 (reproducción), 390×972 (resultado); en escritorio todas 1600×1017. No se presenta documento completo como viewport ni se afirma visibilidad simultánea de todos los controles.

## Identidad de capturas (SHA-256)
- `verification-1600-final.png`: `1cfc40d0faa2ddc27cfc9654c436e876ec8b6a065105aaa41c58940c759ce232`
- `verification-1600-import.png`: `da3a77d40dd72dd5c91371332d795f584c383d39b98ba939ad07faf8bdfcf713`
- `verification-1600-playback.png`: `90828b3e07465f98ba0d6e43ba21b4e305f3c392ccf90965a3c6479021d2ab75`
- `verification-390-final.png`: `601c806afbe42738d06c84397745dd3ab82b24a72bd253c11e99f04995231a76`
- `verification-390-import.png`: `219a83644999ba8fcf4fa7b5ee33be10fa4ba64644bae27916aea25f1564e9a6`
- `verification-390-playback.png`: `eb6b2211850a269fe2fc1b0d7872721e198c324ac6b220681579e6bf239c6874`

## Pendientes
- Probador independiente, auditoría y cierre completo en PR #9.
- Windows, teléfono físico/Safari, rendimiento en 4 GB, entrenamiento de seis horas y aprendizaje efectivo siguen **sin verificar**. Chromium de sesión no los certifica.
