# Matriz de aceptación — issue-6, PR #7

## P3: estado, costos y reloj (R1–R3)

- Base contrastada: `spec-solucion`, versión `aprobada-original`, completa (API reglas v1, balance, R1–R3). La adenda vigente conserva esas reglas y tablas; no se modifican balance, contratos ni dependencias. Se respetan C-2–C-5 y C-7.
- Punto de partida informado por Core: `da92b9e00ca37820e825b92971ba6b8cae694885`, rama `foundry/issue-6`.
- Implementación leída, no modificada: `src/rules/index.ts`. Pruebas contra el motor real de reglas, sin dobles ni Phaser.
- Archivo de matriz inexistente al comenzar, tanto en la rama como en la sesión; se crea esta sección sin sustituir informes previos. Los 26 casos originales de `tests/rules/rules.test.ts` se conservan; se añaden 81 casos (107 en total).
- Comando de cada fila: `npm test -- tests/rules/rules.test.ts`. Resultado observado tras ajustar dos expectativas incorrectas de las nuevas pruebas: código 0, **107 passed**, **1 passed** (archivo), Vitest **4.1.12**. Detalle temporal de las ejecuciones al final de esta sección.

### R1 — Estado, inmutabilidad y recursos

| Requisito | Implementación contrastada | Archivo / test | Resultado real |
| --- | --- | --- | --- |
| Estado inicial completo: reloj 510, presupuesto 1.000.000, todos los inventarios/carga, banderas, perfil, ángulo y resultado | `src/rules/index.ts:26` (`createInitialState`) | `tests/rules/rules.test.ts`, `estado y reinicio exactos después de preparación y cada terminación`; expectativa independiente `EXPECTED_INITIAL` | Verde. Igualdad exacta del estado serializable; objetos anidados nuevos. |
| Reinicio exacto tras preparación, éxito, fallo de lanzamiento y tiempo | `createInitialState` | Mismo test; además se modifica una instancia inicial y se comprueba que las demás permanecen intactas | Verde. El reinicio de reglas consiste en crear el estado inicial; no acredita cancelación de animaciones del juego. |
| Pureza de `previewAction` y `applyAction`, todas las ramas válidas | `src/rules/index.ts:44–84` | `previewAction/applyAction inmutables: $name` (12 casos), `freezeDeep` y copia previa | Verde. Estado y acción congelados; entrada intacta, salida nueva con inventario/carga/reparaciones independientes. |
| Pureza de `getView`, `evaluateLaunch` y `getScore` | `src/rules/index.ts:31–43,87–98` | `getView/evaluateLaunch/getScore inmutables en inicio, preparación y resultados` | Verde. Inicio, preparación, éxito y dos fallos congelados; llamadas repetibles; modificar inventario/carga de la vista o métricas del puntaje no modifica el estado. |
| Presupuesto insuficiente y exactamente suficiente | `previewAction` valida presupuesto; `applyAction` descuenta el costo | `presupuesto un peso insuficiente y exacto: $name` (8 casos: tres diseños, trayectoria, dos reparaciones, carga con/sin bomba) | Verde. Rechazo a costo−1 sin cambio; con presupuesto exacto termina en cero. |
| Repuestos insuficientes para cada reparación; cada consumible de carga insuficiente | Validación `inventoryCosts` y descuento en `applyAction` | `inventario insuficiente y exacto: %s/%s` (bomba/repuestos 10, antena/repuestos 5, combustible 100.000, oxígeno 6.000, agua 2.000, alimentos 400) | Verde. Se prueban 0, costo−1 y costo exacto para cada recurso; razones específicas, sin mutación ni saldos negativos. |
| Acciones completadas sin doble consumo | Casos de reparación/clima/trayectoria/ángulo en `previewAction` | `completada sin doble consumo: %o` (ambas reparaciones, clima, trayectoria, mismo ángulo confirmado), más tests originales | Verde. Tres repeticiones, costo/duración cero y estado igual. |
| Carga única y rechazo sin cambios | `previewAction`, caso `load` | `carga repetida rechazada sin doble consumo`, helper `expectRejected` | Verde. Tres rechazos, misma referencia y contenido; razón `loaded`. Puede incluir además insuficiencia del inventario ya transferido. |

### R2 — Tablas, fórmulas y prerrequisitos

| Requisito | Implementación contrastada | Archivo / test | Resultado real |
| --- | --- | --- | --- |
| Todas las acciones: duración, presupuesto e inventario tanto en previsualización como en transición | `src/rules/index.ts:16–25,44–84` | `tests/rules/rules.test.ts`, `costo/duración/inventario preview y transición: $name` (12 casos, tabla `costCases`) | Verde. Diseños 10 min/200.000, 260.000, 240.000; trayectoria 10/20.000; clima 5/0; bomba 20/60.000/10 repuestos; antena 20/40.000/5; carga 40 o 30/30.000; ángulo 5/0; verificar 10/10.000; lanzar 0/0. Efectos presentes y descuentos comprobados para los cinco inventarios. |
| Tres perfiles completos | `PROFILES`, `getView` | `perfil completo y fórmulas confirmadas/borrador: %s` (3 casos) | Verde. Nombre, costo, masa, potencia, resistencia, estado nave, combustible base y órbita coinciden con la tabla aprobada; expectativas no importan constantes del motor. |
| Ángulos 45, 70, 72, 74 y 90; combustible y órbita | `estimates`, `getView`, `applyAction` caso `angle` | Mismo test de perfiles y tests originales `perfil %s` / `ángulo entero y confirmación idempotente` | Verde para los 15 cruces perfil/ángulo. Borrador no confirma ni altera estado; estimación confirmada permanece en 72 hasta confirmar; tolerancia 70–74 inclusiva. |
| Rechazo de fraccionarios/fuera de rango; reconfirmar gratis, cambiar cobra tiempo | `previewAction`, caso `angle` | `ángulo rechazado sin cambios: %s` (44, 91, 45.5, 72.5, 89.5, NaN, ±Infinity); `cambiar ángulo confirmado cobra cinco minutos; reconfirmar es gratis` | Verde. Rechazos con razón `angle-value`, entrada intacta; cambiar 72 a 74 lleva el reloj a 520 y reconfirmar no lo altera. |
| Trayectoria requiere diseño; carga exige diseño y trayectoria válida | Casos `trajectory`, `load` | `prerrequisitos trayectoria/carga/verificaciones y rediseño` | Verde. Rechazos sin cambios por ausencia de cada prerrequisito; se conserva cobertura original. |
| Rediseño antes de carga paga de nuevo e invalida trayectoria; después de carga se rechaza | Casos `design`, `trajectory`, `load` | Mismo test y tests originales de perfiles/carga | Verde. Equilibrada con trayectoria a 530/780.000; rediseño Potente a 540/520.000 invalida; recalcular a 550/500.000 permite cargar. Rediseño posterior rechazado con `loaded`. |
| Carga 30/40 y transferencia, no desaparición de consumibles | Casos `load` en `previewAction`/`applyAction` | `carga conserva almacén+a bordo y duración con bomba %s` (2 casos) | Verde. Almacén final 20.000/24.000/8.000/1.600, carga 100.000/6.000/2.000/400; conservación de cada suma almacén+a bordo y repuestos según reparación. |
| Verificaciones no exigen reparación, consulta de clima ni confirmación de ángulo; pueden repetirse pagando | Caso `verify` | `verificar puede repetirse pagando sin exigir reparación, clima ni ángulo`; fila de costos para verificaciones | Verde. Solo diseño/trayectoria/carga son prerrequisitos; repetir consume 10 minutos y 10.000. |

### R3 — Reloj y clima deterministas

| Requisito | Implementación contrastada | Archivo / test | Resultado real |
| --- | --- | --- | --- |
| Pronóstico completo y condiciones en 09:59, 10:00, 10:39, 10:40, 11:00 y 11:01 | `src/rules/index.ts:27–43,91–98` | `tests/rules/rules.test.ts`, `pronóstico/bloqueos completos %s %s` (6 casos), expectativa independiente `EXPECTED_FORECAST` | Verde. Viento/lluvia/nubosidad 12/0/18, 20/0/25, 45/0/40 y tabla completa con límites. En 11:01 el estado de prueba usa el último tramo meteorológico y el lanzamiento se bloquea por tiempo. |
| Ventana inclusiva 600–660, riesgos separados de bloqueos | `evaluateLaunch`, caso `launch` | Mismo test y originales `lanzamiento aplicado en límite inclusivo %i` | Verde. 599 bloqueado por `early`; 600 y 639 éxito; 640 y 660 fallo meteorológico sin bloqueo; 661 bloqueado por `time`. Lanzamientos aplicados a 600 y 660 sin avance del reloj. |
| Leer vista/borrador/pronóstico no avanza reloj; consultar primera vez sí consume 5 | `getView`, `previewAction`, caso `weather` | `lectura de vista y pronóstico ya consultado no avanza reloj`; pruebas de inmutabilidad y límites | Verde. Diez lecturas y previsualizaciones conservan estado inicial; primera consulta termina en 515; diez relecturas/reaplicaciones de consulta completada sin avance. |
| Esperar 5, 10 o 20 sin costo material | Caso `wait` | `espera %i minutos sin costo material` (3 casos) | Verde. Estado exacto igual salvo reloj; duración previsualizada y presupuesto/inventario intactos. |
| Viento >40 o lluvia >30, comparaciones estrictas | `isUnfavorable` | `umbrales estrictos viento %s lluvia %s` (6 casos), además del test original de umbrales | Verde. 40/30 favorable; 40.001/0 y 0/30.001 desfavorables; se prueban también 41/30, 40/31 y 0/0. |
| Fallo inmediato al superar 660, advertencia sin impedir confirmar, estado terminal | `previewAction` y `applyAction:83` | `660 no termina; 661 produce fallo inmediato, advertido e irreversible` | Verde. Esperar de 650 a 660 no termina; de 656 a 661 sí, sin despegue, causa/hora/snapshot exactos y puntaje 0. Todas las ramas de acciones y esperas 5/10/20 rechazadas después por partida terminada, sin mutación. |
| Una reparación que sobrepasa la ventana también termina al completar | Mismas funciones | `una tarea no espera sobre ventana también termina al completarse` | Verde. Reparar bomba desde 655 termina a 675, paga 60.000/10 repuestos, conserva reparación y genera fallo por tiempo con métricas finales. |

### Evidencia real de esta ejecución

1. Antes de modificar pruebas: `npm test -- tests/rules/rules.test.ts`, **código 127**, `sh: 1: vitest: not found`. Es un problema de instalación de la sesión, no un rojo de aceptación.
2. `node --version && npm --version && npm ci`, **código 0**: Node **v22.23.5**, npm **10.9.9**, `added 48 packages`, `found 0 vulnerabilities`. No se resolvieron nuevas versiones ni se actualizó el lockfile.
3. Baseline: `npm test -- tests/rules/rules.test.ts && git status --short && ls tests/e2e`. Vitest mostró **26 passed / 1 passed**; el comando compuesto terminó en **128** por `fatal: not a git repository`. La sesión no contiene `.git`; no se usa este resultado como evidencia de un fallo de reglas ni como comprobación de cambios de rama.
4. Con las 81 pruebas añadidas: `npm test -- tests/rules/rules.test.ts`, **código 1**, **105 passed / 2 failed**. Fallaron expectativas de lista de motivos excesivamente restrictivas: la carga repetida devuelve `loaded` y `inventory-fuel`; en estado terminado también devuelve `finished`. La spec no exige omitir razones adicionales ni una lista única mínima.
5. Se corrigieron únicamente las pruebas nuevas: el helper comprueba presencia de las causas exigidas, mensajes, igualdad entre razones de preview/aplicación y rechazo sin cambio; no exige ausencia de otras razones válidas. El test terminal exige `finished` en cada acción, sin fijar duplicados ni el orden de causas adicionales. Se añadieron las tres esperas al rechazo terminal. **No se modificó el motor ni se redujo ninguna comprobación original.** La ejecución siguiente de `npm test -- tests/rules/rules.test.ts` terminó con **código 0, 107 passed / 1 passed**.
6. Regresión Vitest completa: `npm test`, **código 0**, **116 passed / 4 passed** (reglas 107, assets 2, juego 6, dependencias 1).

**Rojo/verde:** hubo rojo real por errores de expectativas de las pruebas nuevas, corregidos en los tests, no por una carencia funcional del motor. No se presenta como ciclo TDD de implementación. Las demás pruebas añadidas pasaron contra la implementación existente desde la primera ejecución. No se fabricó un rojo modificando el motor, el balance o las expectativas aprobadas.

### Límites y pendientes

- No se encontró un defecto funcional de implementación en las comprobaciones R1–R3 ejecutadas. No se necesita ampliar la corrección del motor para este paso.
- R1–R3 quedan trazados a reglas puras y pruebas automatizadas. El control de tarea en curso, doble clic, cierre/apertura de paneles y limpieza de animaciones al reiniciar pertenece al juego y exige pruebas de navegador; este paso no las revalida.
- No se ejecutaron build ni pruebas de navegador en P3. No se presenta esta matriz como verificación independiente, aprobación de entrega ni evidencia visual.
- R4/R5, A1–A4, J1–J7 y D1–D4 mantienen los requisitos de las specs aprobadas. Los tests originales R4/R5 y las otras suites Vitest sí se ejecutaron como regresión, pero su trazabilidad integral y las verificaciones de los pasos P4–P9 quedan pendientes; esta sección no los cierra ni sustituye sus informes existentes.
- No hay SQL, migraciones ni servicios externos en estas pruebas de reglas.
