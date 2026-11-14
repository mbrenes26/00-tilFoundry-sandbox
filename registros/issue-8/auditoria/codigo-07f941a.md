---
id: "issue-8/auditoria/codigo-07f941a"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre 07f941a: aprobado"
version: 1
estado: "aprobado"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "07f941a655d5314c2c7b6959c0e9a0cb243d33ba", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 505938, "tokens_salida": 4142, "monto_ia": 1.437727, "minutos_computo": 4.117, "monto_computo": 0.007411}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "07f941a655d5314c2c7b6959c0e9a0cb243d33ba"}
---
## Auditoría de código
- Trabajo: issue-8. PR: #9. Commit identificado por Core: 07f941a655d5314c2c7b6959c0e9a0cb243d33ba.
- Resultado: aprobado. No identifiqué bloqueantes de código contra la spec aprobada y C-2/C-3/C-4/C-5/C-7/C-8.
- Revisados: spec aprobada-original, discovery, contrato incluido en la spec, archivos de implementación/pruebas, diff disponible, cuerpo del PR, commits y checks. No hay checks publicados para el commit según leer_pr; las ejecuciones locales siguientes no se presentan como checks de GitHub.

## Evidencia ejecutada
- Node v22.23.5. `npm ci && npm test && npm run build`: salida 0; 5 pruebas Node y 200 Vitest aprobadas; TypeScript/build correctos. Salida 4 de la sesión.
- `npx playwright install chromium && npm run test:e2e`: salida 0; 15 pruebas aprobadas por HTTP, incluidas reproducción, importación, pausa, velocidades y final en 390 y 1600 px. Salida 6.
- Recálculo independiente mediante Node de step-8-evaluation.json: 30 episodios y semillas 1001–1030 por referencia; las 12 estadísticas de cada referencia coinciden. Salida del último comando de la sesión.
- Primera ejecución de npm test falló porque la sesión aún no tenía dependencias; quedó resuelto con npm ci. La sesión no contiene .git: el SHA auditado procede de Core, no de una comprobación Git local.

## Cobertura de criterios
- M-1: engine.ts/map.ts y map.test.ts ejercitan conectividad, objetos/inicios, legalidad, bordes, semillas y entradas congeladas.
- M-2: guardians.test.ts verifica objetivos, desempates en todo el mapa, inversión, fases 70/200, poder 60 y reaparición 20; phase-reset.test.ts cubre reinicio frente a transición real.
- M-3: resolution.test.ts comprueba cruces/casilla compartida, capturas por id y cadena, muerte simultánea de una sola vida, conservación/limpieza, última vida y prioridades de finales hasta 3000. El estado representa vulnerabilidad global de los guardianes activos.
- M-4: observation.test.ts y observation-independent.test.ts comprueban las 36 entradas, ausencia de objetos, distancias con oráculo independiente y continuidad JSON de estados/eventos.
- M-5: versiones exactas y scripts conformes; config.test.mjs y vitest-config.test.ts aprobados; instalación/build ejecutados. Core no identifica archivos fuera de alcance; el inventario no incluye cambios en .github/ o Foundry.
- A-1: network.test.ts contrasta todos los gradientes con diferencias finitas, forward/Huber/SGD y recorte; dqn.test.ts ejerce legalidad, terminales, descarte circular, fronteras de actualización y cambios reales de pesos.
- A-2: training.test.ts prueba reloj inyectado, exclusión de esperas/guardados, exceso de último lote y presupuesto acumulado. train-cli.test.ts ejecuta SIGINT real, guardado y reanudación sin renovar política inicial ni presupuesto.
- A-3: persistence.test.ts compara continuación tras 10003 pasos con checkpoint restaurado, incluyendo ambas redes, replay, PRNG y evolución exacta. Pruebas de persistencia/endurecimiento/coherencia rechazan archivos incompatibles y no finitos; fallos inyectados de escritura/sync/rename conservan destino válido.
- A-4: evaluation.test.ts y metrics-cli.test.ts ejercitan evaluación real de 90 episodios, agregación, inferencia sin exploración y pesos intactos. Recalculé además el artefacto persistente.
- A-5: memory.ts/memory.test.ts delimitan arrays y replay; presupuesto calculado 6040674 bytes. El humo registrado en step-8-smoke.json informa 60,006532 segundos activos, 232864 pasos y RSS máximo 132341760 bytes. No repetí ese humo en esta auditoría; el PR aporta además la ejecución independiente del probador. JSON/runtime y Windows 4 GB están expresamente fuera de la certificación.
- I-1: main.ts y las cinco escenas respetan FIT/1600×900/pixelArt y APIs Phaser; presentation.spec.ts ejerce carga, animaciones, tweens, temporizador e inventario.
- I-2: Playback consume motor e inferencia compartidos. playback.spec.ts:69 compara estados completos y acciones con el motor puro, comprueba pesos intactos y callbacks temporizados a ambas velocidades, además de pausa/reinicio.
- I-3: playback.spec.ts:27,133 y concurrency.spec.ts cubren archivos inválidos, límites, recuperación, lecturas concurrentes y final real. Inicio revocado mientras se valida; fixtures identificadas como no entrenadas.
- I-4: README documenta Node 22, PowerShell, HTTP, build/tests, entrenamiento, Ctrl+C/reanudación, evaluación/importación y medición local, con Windows/seis horas pendientes explícitos.
- TDD: el PR contiene la sección «Evidencia por paso (registro de Core)», válida como evidencia conforme a las reglas del rol. La tabla manual anterior declara históricos no recuperados; no la confundí con ausencia de la sección de Core ni reconstruí salidas históricas. La respuesta de leer_pr recortó parte de esa sección; no afirmo haber inspeccionado cada salida roja original.

## Bloqueantes
- Ninguno identificado.

## Sugerencias no bloqueantes
- Robustez numérica: policy-format.ts:36–39 acepta cualquier peso finito; network.ts:38–46 puede producir NaN por desbordamiento y policy.ts:33–39 elige silenciosamente la primera acción legal. Reproducción ejecutada: w1 y b1 llenos de Number.MAX_VALUE, w2 y b2 a cero; parsePolicy acepta, forward devuelve cuatro NaN y chooseAction devuelve 1. Añadir detección de salidas no finitas y error español controlado, con regresión, en un endurecimiento posterior. La spec exige validar números finitos de entrada, no fija límites de magnitud ni estabilidad para estos valores extremos; no se usa como bloqueo.
- Actualizar el resumen histórico de README.md:47 y la sección manual de verificación del PR: aún citan 199/200 Vitest, 2 Node y 10 Chromium/commit anterior. En este commit comprobé 200 Vitest, 5 Node y 15 Chromium, con maxWorkers=2 ya configurado por defecto. Los comandos siguen funcionando; la mejora es de claridad y trazabilidad.

## Límites
- Auditoría solo de código; no sustituye veredictos de seguridad, UX/UI ni aprobación de entrega.
- No certifica Windows, seis horas de entrenamiento, mejora neuronal ni rendimiento en 4 GB.
- Build emite aviso de tamaño del paquete; npm ci informa una vulnerabilidad baja. No se cambiaron versiones ni configuración durante la auditoría.