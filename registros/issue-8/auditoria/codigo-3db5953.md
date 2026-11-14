---
id: "issue-8/auditoria/codigo-3db5953"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre 3db5953: cambios"
version: 1
estado: "aprobado"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "3db59530ee48827dfa89db2c6267382576959d1b", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 674387, "tokens_salida": 3984, "monto_ia": 1.539695, "minutos_computo": 3.613, "monto_computo": 0.006503}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "3db59530ee48827dfa89db2c6267382576959d1b"}
---
## Auditoría de código
- Trabajo: issue-8. PR: #9. Commit: 3db59530ee48827dfa89db2c6267382576959d1b, identificado por Core y leer_pr.
- Criterio: spec-solucion aprobada-original, contrato incluido en ella y decisiones C-2, C-3, C-4, C-5, C-7 y C-8.
- Resultado: cambios por evidencia de TDD incompleta; no encontré otro bloqueante de código en la revisión realizada.

## Bloqueante
- COD-1 — Falta acreditar el rojo/verde exigido para la entrega.
  - Evidencia: cuerpo del PR #9, sección «Evidencia por criterio»: declara «Histórico no recuperado» para motor-1 a motor-4, aprendizaje-1 a aprendizaje-5 e interfaz-1 a interfaz-3. Solo motor-5 incluye una regresión con rojo verificable.
  - La spec exige «TDD rojo/verde por criterio» para motor y «PR […] con evidencia real rojo/verde por criterio y comandos» para la integración. No contiene una excepción que permita sustituirla por verdes finales.
  - La conversación accesible registra el rojo de tests/game/vitest-config.test.ts (expected undefined to be 2) y sus verdes posteriores. No permite acreditar los restantes rojos históricos; omite mensajes anteriores. Las declaraciones del autor, por ejemplo src/learning/FORMATS.md:85, tampoco sustituyen la evidencia registrada por Core.
  - Corrección: recuperar y enlazar en el PR los registros reales de Core, con comando, resultado y criterio correspondiente. Si no pueden recuperarse, escalar al manager para que gestione una excepción aprobada en la spec; no inventar resultados ni presentar una ejecución retrospectiva como TDD original.
  - Alcance del hallazgo: falta de evidencia verificable, no afirmación de que el autor omitiera realmente TDD.

## Implementación y cobertura revisadas
- M-1/M-2: src/game/map.ts, engine.ts y guardians.ts; tests/game/map.test.ts, guardians.test.ts y phase-reset.test.ts cubren conectividad, legalidad, determinismo, objetivos, inversión y fronteras temporales.
- M-3: src/game/engine.ts:111–159 resuelve colisiones, muerte/capturas, prioridad de finales y temporizadores; tests/game/resolution.test.ts ejercita cruces, cadena, reaparición, última vida y tick 3000.
- M-4: observación y serialización cubiertas por observation.test.ts y observation-independent.test.ts; este último usa un recorrido por capas independiente para contrastar distancias y desempates.
- M-5: versiones exactas y scripts en package.json; exclusiones y configuración probadas. Instalación, suite y build reproducidos. Core informa que no hay archivos fuera del alcance; el cambio no incluye .github/ ni configuración de Foundry.
- A-1: network.ts/dqn.ts/replay.ts implementan red 36/64/4, Huber, SGD, máscara legal y replay circular. network.test.ts contrasta gradientes mediante diferencias finitas; dqn.test.ts prueba terminales, sincronización y cambio real de pesos.
- A-2/A-3: training.ts y scripts/train.ts separan reloj activo y renderizado; pruebas con reloj inyectado y CLI real con SIGINT. persistence.test.ts compara continuación tras checkpoint con ejecución continua, incluyendo replay lleno y SGD; validación y fallos de E/S tienen pruebas específicas.
- A-4/A-5: evaluación de tres referencias y memoria acotada implementadas y probadas. Recalculé semillas y estadísticas de tests/learning/evidence/step-8-evaluation.json: las tres series de 30 episodios coinciden. El humo de 60 segundos tiene evidencia en la conversación de Core y en step-8-smoke.json; no lo repetí en esta auditoría.
- I-1/I-2/I-3: cinco escenas, APIs Phaser exigidas y Playback con motor/inferencia compartidos, sin entrenador. Chromium ejercita importación, trayectoria, pausa, velocidades, final y concurrencia.
- I-4: README documenta Node 22, comandos PowerShell, archivos, reanudación, evaluación y mediciones; declara Windows/4 GB y seis horas pendientes, sin prometer mejora.

## Evidencia ejecutada en esta auditoría
- Salida 4: npm ci && npm test && npm run build, código 0. Pasaron 2 pruebas Node y 200 Vitest; build correcto. Instalación informó una vulnerabilidad baja; build advirtió tamaño del paquete. No constituyen nuevos hallazgos de esta especialidad.
- Salida 24: npx playwright install chromium && npm run test:e2e, código 0; 10/10 pruebas Chromium aprobadas.
- Salida 35: recálculo independiente del JSON de evaluación, código 0; initial, policy y random: «30 semillas y estadísticas correctas».
- leer_pr: sin checks publicados en el commit vigente; las ejecuciones de sesión no se presentan como checks de GitHub.
- La sesión no contiene .git; no pude verificar el hash mediante git rev-parse y no lo presento como comprobación realizada.

## Sugerencia no bloqueante
- README.md:47 y src/learning/FORMATS.md:85–86 conservan el relato de 199 pruebas y la incidencia anterior al límite de concurrencia. Añadir una nota de cierre con el estado vigente: vitest.config.ts ya fija dos workers y npm test sin argumentos pasa 200 pruebas Vitest más 2 Node. Conservar el historial, pero distinguirlo del comportamiento actual.

## Límites
- No se ejecutó Windows ni un entrenamiento de seis horas; ambos están expresamente pendientes en la spec.
- No se evaluó diseño visual ni experiencia de usuario; corresponden a sus especialidades.
- Sin modificación de fuentes ni solicitud de transición.