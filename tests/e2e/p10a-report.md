# P10a — reparación y carga (J3/J6)

- Base indicada por Core: PR #7, `foundry/issue-6`, commit `85ef25c`. Spec consultada: `aprobada-original`, J3/J6; decisiones C-2/C-3 vigentes del contexto.
- Se leyeron `tests/e2e/p10-observe.mjs`, `p10-launch.spec.ts`, `p10-evidence/work-1600.json`, `src/game/Session.ts` y `src/game/scenes.ts`. Se conservan los tests/capturas/json P10 existentes sin sobrescribirlos.
- Solo se añade verificación focal; no hay cambio funcional ni de contrato. No se ejecutaron despegues, auditoría de dependencias, build, manual ni suite integral.

## Comandos y resultados reales

- `npx playwright test tests/e2e/p10a-work.spec.ts`: salida 1; faltaba la instalación local (`Cannot find package '@playwright/test'`). Npx intentó obtener `playwright@1.65.1`, pero no llegó a ejecutar tests. Esto NO es rojo funcional. Salida en `tests/e2e/p10a-run-1.log`.
- Preparación de sesión: `npm ci --no-audit --no-fund` y `./node_modules/.bin/playwright install chromium`: salida 0. Sin modificar dependencias ni lockfile. Log `tests/e2e/p10a-setup.log`; Node observado `v22.23.5`.
- `./node_modules/.bin/playwright test tests/e2e/p10a-work.spec.ts`: salida 0, **4 passed (33.6s)**; `tests/e2e/p10a-run-2.log`.
- Intento de montaje con Python: no disponible PIL; no creó imagen. `node tests/e2e/p10a-compose.mjs`: salida 0; monta las tres capturas existentes, sin ejecutar juego ni tomar capturas adicionales.

## J3 — controles y transiciones

Test `tests/e2e/p10a-work.spec.ts`, cuatro casos (1600×900/1280×720, bomba reparada/no reparada), ocho tareas reales:

| Tamaño | Tarea | Minutos / costo / repuestos | Primera muestra final (ms) |
|---|---|---|---|
|1600|bomba|20 / $60.000 / 10|2079,8|
|1600|antena|20 / $40.000 / 5|1997,5|
|1600|carga con bomba|30 / $30.000 / 0|2014,5|
|1600|carga sin bomba|40 / $30.000 / 0|2047,5|
|1280|bomba|20 / $60.000 / 10|2013,1|
|1280|antena|20 / $40.000 / 5|1997,7|
|1280|carga con bomba|30 / $30.000 / 0|2014,3|
|1280|carga sin bomba|40 / $30.000 / 0|2013,1|

- Previsualización visible antes de confirmar: minutos, presupuesto, repuestos y cantidades transferidas. Bomba y antena mediante botones inferiores; carga mediante Combustible. Diseño/trayectoria previos también se hacen mediante controles reales, sin inyección de estado.
- Doble clic real sobre Confirmar: una sola tarea y una sola transición observada del estado completo.
- Durante tarea: lectura real de Almacén, Sistemas y Meteorología y apertura/cierre de paneles, con estado entero idéntico al anterior en todas las muestras ocupadas. Verificar, consultar clima y controles mutantes del HUD deshabilitados; no queda confirmación adicional.
- Final: una deducción exacta de dinero/repuestos/minutos; carga a bordo `{fuel:100000,oxygen:6000,water:2000,food:400}` y deducciones correspondientes de inventario. Estado posterior estable; objetivos y checks Propulsión/Comunicación/Soporte vital actualizados.
- Medidas desde clic capturado hasta primera muestra final por `requestAnimationFrame`; no se afirma precisión sub-frame ni que la demora de captura sea duración del juego. Timer fuente de 2000 ms; margen de prueba 1980–2250 ms por resolución de frame/planificación del navegador.

## J6 — secuencia técnica y revisión visual

- Cada tarea observa `technician-work` con ambos frames **2,3**, progreso creciente de menos de 10% a más de 90%, y `technician-idle` con frames **0,1** tras terminar. Lectura de Phaser/Session exclusivamente observacional; no llama `work()` ni altera reglas.
- `src/game/scenes.ts:20`: animaciones originales creadas con `this.anims.create`; `:40`: reparación usa técnico de Ingeniería (índice 3) y carga técnico de Combustible (índice 4), con `Sprite.play` y vuelta a idle. `:168`: finalización con token y regreso a idle. `:171`: progreso con `this.tweens.add`, duración 2000; `:172`: `this.time.delayedCall(2000,finish)`. `:152`: guardia para acciones mutantes. Búsqueda `grep -R -n 'setInterval' src/game/`: sin coincidencias.
- `src/game/Session.ts`: `begin` rechaza concurrencia y `complete` consume el token pendiente una sola vez; no duplicación de reglas Phaser.
- Capturas nuevas limitadas a tres: `p10a-evidence/pump-work-a.png`, `pump-work-b.png`, `pump-idle.png`. Montaje `pump-sequence.png` deriva de ellas. Inspección real: progreso aproximadamente 6% y 22%, reloj/presupuesto iniciales; al terminar 08:50/$940.000/40 repuestos, bomba 100%, sin barra. Técnico visible y sin recorte. **La comparación visual de las posturas es muy sutil: no confirma por sí sola un gesto de herramienta o regreso animado perceptible.** La evidencia de ambos frames y work→idle está en la secuencia técnica, no en una afirmación visual inventada.
- La sonda existente `astronaut-work-TECHNICAL-PROBE` solo demuestra frames del astronauta. No se ejecutó en este lote; NO demuestra una acción jugable del astronauta. Pasillo es descriptivo conforme a la spec.
- Los cuatro casos verifican ausencia de errores de consola no tratados, solicitudes fallidas y respuestas HTTP >=400.

## Evidencia y límites

- Ocho JSON `tests/e2e/p10a-evidence/P10a-work-*-repair-pump.json`, `*-repair-antenna.json`, `*-load.json` contienen previsualización, estado previo y muestras por frame (ms, estado, busy, animación, frame, progreso). Se guardan antes de las aserciones temporales.
- No hay rojo funcional: los nuevos tests pasaron sobre la implementación existente; no se construyó una corrección. El fallo inicial fue de entorno. No se finge TDD ni rojo visual.
- Pendiente del probador independiente: reproducir este lote y revisar una secuencia temporal focal, particularmente percepción visual de trabajo/carga. Este informe no reemplaza esa revisión ni las auditorías finales.
- Archivos añadidos: `tests/e2e/p10a-work.spec.ts`, `p10a-compose.mjs`, `p10a-report.md`, `p10a-run-1.log`, `p10a-run-2.log`, `p10a-setup.log`, y ocho JSON/cuatro PNG en `tests/e2e/p10a-evidence/`. No se modificó código del juego ni evidencia P10 previa.
