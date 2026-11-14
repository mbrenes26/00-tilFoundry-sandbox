# P10b — despegue exitoso y reinicio (J5/J6)

- Base de Core: PR #7, `foundry/issue-6`, commit `1e242a6`, estado REWORK. Consultadas spec `aprobada-original`, adenda vigente y decisiones C-2–C-5/C-7 del contexto. `leer_registro('eventos')` no disponible; se usa el estado actual proporcionado por Core, no la conversación.
- Solo verificación y pruebas nuevas en `tests/e2e/`. Sin cambios funcionales, contratos, balance, gráficos ni dependencias. No corresponde inventar rojo: ambas ejecuciones pasan sobre el juego existente. No se ejecutó lote fallido ni cierre integral.

## Comandos y salidas reales

- Preparación aislada: `npm ci --no-audit --no-fund && ./node_modules/.bin/playwright install chromium`: salida 0; Node `v22.23.5`, Chromium v1254 (Chrome 158.0.8127.18). No es auditoría de dependencias; evidencia completa del comando registrada por Core.
- `./node_modules/.bin/playwright test tests/e2e/p10b-success.spec.ts`: salida 0, **2 passed (53.8s)**. Log `tests/e2e/p10b-run-1.log`.
- Refinamiento de prueba, no corrección del juego: permitir directorio de salida y tomar ascenso a pantalla completa para distinguir el corte del recorte focal de un defecto real del viewport; simplificar aserción del título. Se conservan las capturas y mediciones iniciales.
- `P10B_OUTPUT=tests/e2e/p10b-evidence/final ./node_modules/.bin/playwright test tests/e2e/p10b-success.spec.ts`: salida 0, **2 passed (52.4s)**. Log `tests/e2e/p10b-run-2.log`.
- `node tests/e2e/p10b-compose.mjs`: salida 0. Montaje de cuatro capturas existentes, sin volver a ejecutar el juego ni tomar nuevas capturas.

## J5 — secuencia y resultado reales

- Test `tests/e2e/p10b-success.spec.ts`: Equilibrada, trayectoria, clima, bomba, antena, carga, confirmar 72°, verificar y lanzar mediante clics reales. Sin inyección de estado, mocks ni aceleración. Se comprueba cada minuto intermedio: 520, 530, 535, 555, 575, 605, 610 y 620.
- Antes de lanzar: 10:20, $640.000, 35 repuestos y 100.000 L a bordo. Lanzamiento directo sin aviso de riesgos; controles mutantes deshabilitados y diagnóstico no prematuro.
- Resultado visible: Misión completada, 10:20, $640.000, 35 repuestos, 8000 L a bordo. Desglose DOM **256 + 140 + 166 + 150 = 712**. Estado completo estable desde lanzamiento hasta resultado.
- Reiniciar por su botón restaura exactamente el estado completo inicial capturado antes de jugar: minuto 510, presupuesto 1.000.000, inventario 120.000/30.000/10.000/2000/50, carga cero, perfil nulo, sin objetivos/reparaciones/verificaciones/resultado, ángulo 72 sin confirmar. Borrador 72, panel y confirmación nulos, progreso cero, sin busy/aviso.
- Observación continua posterior al reinicio: **8200,8 ms / 493 muestras** a 1600 y **8205,4 ms / 493 muestras** a 1280; cero desviaciones de estado o apariciones de resultado, progreso, aviso o lanzamiento. Solo BaseScene/UIScene activas; cohete visible; cero tweens y timers activos/pendientes en las cuatro escenas revisadas. Esto acota la ausencia de callbacks tardíos al período observado, no demuestra ausencia universal.

## J6 — animación, tiempos y limpieza

| Viewport | Clic real hasta aparición del resultado (final) | Primera ejecución |
|---|---:|---:|
|1600×900|7032,6 ms|7032,6 ms|
|1280×720|7031,4 ms|7032,7 ms|

- Tiempo medido con `performance.now()` desde listener de captura del clic y MutationObserver del resultado, sin modificar reloj/tween/timer. Cumple 6–8 s; incluye resolución de frame y actualización DOM.
- Sondeo requestAnimationFrame de Phaser de solo lectura: humo `smoke-burn` y llama `flame-burn`, ambos reproduciendo frames **0/1/2**; dos tweens activos durante ascenso. Cohete Y decrece monótonamente de aproximadamente 570 a **−180**, sin salto de resultado anticipado. Los JSON conservan muestras y estado serializado; no reemplazan la inspección visual.
- Revisión `src/game/scenes.ts`: `:20` crea animaciones con `this.anims.create`; `:184–185` sprites humo/llama con `play`; `:186` ascenso de cohete/llama con tween de 6500 ms; `:187` expansión/desvanecimiento del humo; `:189` resultado con `this.time.delayedCall(7000)`; `:190` shutdown elimina tweens y eventos. `:176` detiene lanzamiento/base/UI para resultado; `:198–199` reinicio/restablecimiento y limpieza de ResultScene. Base/UI también limpian eventos, timers, tweens y DOM en shutdown. `src/game/Session.ts` reset invalida tokens pendientes. `grep -R -n setInterval src/game/`: sin coincidencias.
- Ambas ejecuciones: cero pageerror, errores de consola, requests fallidos o HTTP >=400 en preparación, lanzamiento, resultado y reinicio.

## Inspección visual efectuada

- Inspeccionadas realmente: cinco capturas iniciales 1600; seis finales (ascenso completo1600, ascenso/igniciónA/igniciónB/resultado/reinicio1280); montaje final de ignición de ambos tamaños.
- Montaje `final/ignition-sequence.png`: humo cambia perceptiblemente de silueta/anchura y detalles entre ~0,05 s y ~0,4 s en ambos tamaños. Cohete íntegro y alineado, sin rótulo sobre trayectoria. **La diferencia visual de la llama es menos clara porque el humo tapa parcialmente su extremo**; los tres frames animados se prueban técnicamente, no se afirma un cambio visual inequívoco de llama.
- Ascenso completo final a ~3,1 s: cohete completo por encima de torre, llama y humo visibles, sin tapar textos ni invadir recursos/panel de diagnóstico. Las capturas focales iniciales recortan la punta en ascenso: corte de la captura, no del viewport, comprobado con las finales completas.
- Resultados de ambos tamaños legibles y completos, cuatro componentes alineados, botón Reiniciar visible, sin restos de lanzamiento. Reinicios muestran recursos/objetivos iniciales, nueve personajes/cohete y ausencia de efectos/diálogos/resultados.
- Observaciones preexistentes no corregidas en este lote: posible glifo rectangular del título; duración repetida en botones Esperar; etiqueta «Confirmado ... inicial, no confirmado». No afectan esta secuencia y no se cambian estilos ni alcance por cuenta propia.

## Archivos y límites

- Nuevos: `tests/e2e/p10b-success.spec.ts`, `tests/e2e/p10b-compose.mjs`, `tests/e2e/p10b-report.md`, `tests/e2e/p10b-run-1.log`, `tests/e2e/p10b-run-2.log`.
- Evidencia en `tests/e2e/p10b-evidence/` y `tests/e2e/p10b-evidence/final/`: para cada ancho 1600/1280, `success-<ancho>.json`, `restart-<ancho>.json`, `success-<ancho>-ignition-a.png`, `-ignition-b.png`, `-ascent.png`, `-result.png`, `-restart.png`; adicional final `ignition-sequence.png`. Total 8 JSON y 21 PNG; no se sobrescribe evidencia P10/P10a anterior.
- Sin cambio de interfaz documentada: no corresponde modificar contrato ni manual.
- Pendiente del probador: reproducción e inspección independientes de este lote; este reporte no las sustituye. No se verifican aquí fallo/reinicio fallido (P10c), dependencias, manual, build/preview ni suite integral, ni se solicita transición o entrega.
