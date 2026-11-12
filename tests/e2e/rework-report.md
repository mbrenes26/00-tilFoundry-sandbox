# Corrección de bloqueantes de interfaz — issue-6 / PR #7

- Base indicada por Core: `dea64d9c1a95dbb7af735fb9e60c6946fb062891`; rama `foundry/issue-6`.
- Cambios limitados a `src/game/`, `src/styles/`, `tests/e2e/`. Sin cambios de reglas, contratos, assets del juego, versiones ni configuración.

## Evidencia TDD por bloqueante

- Objetivos: `tests/e2e/rework.spec.ts`, prueba parametrizada «REWORK objetivos completos sin solapamiento», 1600×900 y 1280×720.
  - Rojo, antes de implementar: `npm run test:e2e -- tests/e2e/rework.spec.ts`, salida 1, `4 failed`. En ambas resoluciones: `Fuera del panel: Ventana: 10:00–11:00`, `Texto tapado: Ventana: 10:00–11:00`, notas de Clima/Fase fuera del panel.
  - Verde: mismo comando, salida 0, `4 passed (31.4s)`.
  - Se comprueba cada rectángulo de texto mediante Range y su pertenencia al panel; se comprueba que el elemento visible en su centro pertenece al panel y que scrollHeight no supera clientHeight. Se repite antes y después de preparar la misión. Captura HTTP adicional: clientHeight=471, scrollHeight=471 en ambas resoluciones.
  - Implementación: compactar márgenes, interlineado y distribución del panel sin ocultar contenido ni añadir desplazamiento.
- Confirmación: prueba «REWORK confirmación: semántica, teclado, cancelar, confirmar y foco tras render».
  - Rojo: comando anterior, `role` esperado `dialog`, recibido vacío. Segunda ejecución previa a implementar: `npm run test:e2e -- tests/e2e/rework.spec.ts --grep 'confirmación|riesgo'`, salida 1, `2 failed`; `cancel-action` y `confirm-action` inactivos frente a la expectativa de foco; primera navegación Tab incorrecta y pérdida de foco tras render.
  - Verde: comando completo de las cuatro pruebas, salida 0. Comprueba nombre accesible, aria-modal, foco inicial en Cancelar, 20 Tab y 20 Shift+Tab, conservación del foco tras render, cancelación sin perder el origen, confirmación con teclado, foco durante y después de reparación, y confirmación de espera con restauración a wait-5.
- Riesgos: prueba «REWORK riesgo: semántica, teclado, cancelar, confirmar y foco tras render».
  - Rojo: mismas dos ejecuciones anteriores; `risk-warning` sin role; `cancel-warning` y `launch-anyway` inactivos frente a la expectativa de foco; Tab incorrecto y pérdida de foco tras render.
  - Verde: comando completo de las cuatro pruebas, salida 0. Misma comprobación semántica y 20 Tab/20 Shift+Tab; cancelar restaura Lanzar; confirmar con teclado enfoca el estado de despegue y después Reiniciar en el resultado.
- Implementación de foco: identidad estable de controles antes de reemplazar innerHTML, origen de diálogo registrado al abrir, restauración después de renderizar, manejador Tab/Shift+Tab limitado al diálogo y eliminado al cerrar la escena.
- Excepción necesaria a restaurar el control: los botones nativos deshabilitados no admiten foco. Tras confirmar una reparación se enfoca Progreso; al terminar, su panel de Reparaciones. Tras confirmar lanzamiento se enfoca Despegue y después Reiniciar. Al cancelar y al confirmar una acción cuyo control sigue disponible se restaura el control de origen. No se habilitan acciones completadas para forzar foco.

## Regresión y entorno

- Node.js `v22.23.5`, npm `10.9.9`.
- `npm ci && npx playwright install chromium`: salida 0; Chromium compatible instalado.
- `npm test`: salida 0; `35 passed`, sin modificar las pruebas existentes.
- `npm run build`: salida 0; compilación TypeScript y Vite 6.4.6 correctas. Persiste aviso no bloqueante de tamaño de paquete superior a 500 kB; no se cambia configuración para ocultarlo.
- `npm run test:e2e`: salida 0; `18 passed (3.9m)` (14 existentes + 4 nuevas). Se conserva, entre otras, «J4 aviso se invalida y revalida tras controles reales de espera».
- `PREVIEW=1 npm run test:e2e`: salida 0; `18 passed (3.8m)` sobre la compilación estática final, sin omitir comprobaciones.
- `npm audit --json`: salida 0; metadata.vulnerabilities con info/low/moderate/high/critical/total en 0, incluyendo dependencias de desarrollo. No se usaron exclusiones, overrides ni audit fix.
- Salidas finales guardadas en `tests/e2e/rework-unit.log`, `rework-build.log`, `rework-dev.log`, `rework-preview.log`, `rework-audit.json`, con sus archivos `.exit`.
- Incidencias de sesión: una ejecución larga agrupada devolvió `Function failed` aunque el proceso seguía ejecutándose; no se usa su salida ausente como resultado. Se esperó a que terminara y se repitió la verificación completa con logs y códigos de salida. Un intento de captura durante el relevo del servidor recibió `ERR_CONNECTION_REFUSED`; repetido correctamente con el servidor activo.

## Revisión visual real

- `tests/e2e/rework-captures/objectives-1600.png` y `objectives-1280.png`: herramienta de revisión visual confirma ocho objetivos y notas Ventana/Clima/Fase completos, dentro del panel y sin solapamientos. A 1280 el texto de notas es pequeño pero legible.
- `tests/e2e/rework-captures/confirmation-keyboard-1280.png`: diálogo completo y foco amarillo visible en Cancelar. Captura obtenida con Enter; evaluación del navegador: focused=true, focusVisible=true.
- `tests/e2e/rework-captures/risk-keyboard-1280.png`: diálogo completo, sin solapamiento interno, foco amarillo visible en Cancelar; navegador: role=dialog, modal=true, focused=true, focusVisible=true.

## Pendiente documental independiente — B1

- `leer_registro(spec-solucion)` devuelve únicamente la adenda D1–D4, con referencia a la spec base «Nivel 1 Despegue, preparación y fallos deterministas», pero sin su contenido íntegro.
- `leer_registro(eventos)` y `leer_registro(rework)`: `No existe`.
- `leer_conversacion`: informa 69 mensajes intermedios omitidos.
- Core debe recuperar la spec base aprobada completa, R1–R5/A1–A4/J1–J7 y contratos API reglas v1/Assets v1, con su aprobación registrada. No se reconstruyeron a partir de README/tests ni se inventó aprobación. Estas regresiones no acreditan cumplimiento íntegro de una spec inaccesible.
- No se cambió una interfaz pública documentada; no corresponde modificar documentación de contratos en esta corrección.
- No se acredita prueba de duración 10–15 minutos con jugadores, revisión independiente de otra familia de modelos ni checks alojados en GitHub. Corresponden al proceso de verificación, no a esta implementación.

## Archivos modificados o añadidos

- `src/game/scenes.ts`
- `src/styles/game.css`
- `tests/e2e/rework.spec.ts`
- `tests/e2e/rework-report.md`
- `tests/e2e/rework-unit.log`, `tests/e2e/rework-unit.exit`
- `tests/e2e/rework-build.log`, `tests/e2e/rework-build.exit`
- `tests/e2e/rework-dev.log`, `tests/e2e/rework-dev.exit`
- `tests/e2e/rework-preview.log`, `tests/e2e/rework-preview.exit`
- `tests/e2e/rework-audit.json`, `tests/e2e/rework-audit.exit`
- `tests/e2e/rework-captures/objectives-1600.png`
- `tests/e2e/rework-captures/objectives-1280.png`
- `tests/e2e/rework-captures/confirmation-keyboard-1280.png`
- `tests/e2e/rework-captures/risk-keyboard-1280.png`

El hash de entrega lo devuelve Core al confirmar y se incluye en el reporte final al manager; este documento no afirma una transición ni aprobación.
