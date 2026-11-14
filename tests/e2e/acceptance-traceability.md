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


## P4: derivados, riesgos, resultados y puntaje (R4–R5)

- Base leída completa: `spec-solucion`, `aprobada-original`; adenda `vigente` leída. La vigente conserva balance, API reglas v1 y R4/R5. Decisiones C-2–C-5 y C-7 respetadas; este paso no cambia fuentes, dependencias ni contratos.
- Punto de partida de Core: `bddb3fa47177327bace7179f385c248999e2aa8d`, rama `foundry/issue-6`, PR #7.
- Fuentes contrastadas: `src/rules/index.ts` y `src/game/Session.ts`. Las pruebas importan esas implementaciones reales. No hay mocks del motor; Session se prueba sin renderizador ni temporizadores reales de Phaser.
- Cambios exclusivos: `tests/rules/rules.test.ts` (+29 casos; 136 totales), `tests/game/game.test.ts` (+18 casos; 24 totales), esta matriz. Se conservan todas las pruebas anteriores y la sección P3.
- Comando por fila: `npm test -- tests/rules/rules.test.ts tests/game/game.test.ts`, resultado final código **0**, **160 passed / 2 passed**. Regresión unitaria completa: `npm test`, código **0**, **163 passed / 4 passed**. Evidencia temporal detallada debajo.

### R4 — Derivados sin barreras de fase

| Balance / contrato | Implementación | Test en `tests/rules/rules.test.ts` | Resultado |
| --- | --- | --- | --- |
| Ocho objetivos exactos: diseño, trayectoria, clima, reparaciones, carga, ángulo, revisión, ejecución de despegue | `getView`, `src/rules/index.ts:91–98`; `applyAction:68–84` | `ocho objetivos en cada transición, reparaciones 0/2→2/2 y fases completadas por objetivos` | Verde. Igualdad de los ocho booleanos en inicio y cada transición de la ganadora, contador 0/1/2 y marca final de ejecución. Las nueve referencias también comprueban la marca de despegue en fallos y su ausencia en fallo por tiempo. |
| Fases orientativas Planificación, Preparación, Verificaciones y Lanzamiento; completadas solo por sus objetivos | `getView` | Mismo test; `éxito con clima, ángulo inicial y revisión omitidos, sin riesgos inventados ni barreras de fase` | Verde. Tabla completa de fase y cuatro marcas en cada paso. El éxito desde Planificación con objetivos incompletos no marca falsamente las fases previas como completas. |
| Rediseño invalida trayectoria y su objetivo/sistema | `applyAction`, caso `design`; `getView` | `rediseño invalida objetivo y sistema de trayectoria y devuelve guía a planificación` | Verde. Conserva diseño/clima, anula trayectoria/navegación, vuelve a Planificación y añade bloqueo de trayectoria. |
| Nave inicial 86 y perfiles 86/88/92; Sistemas 90+5 por reparación | `getView`; `PROFILES` | `barra Nave %s, independiente de verificaciones` (3 casos), tabla de objetivos y `reparación aislada %s y revisión no esconden los cinco sistemas` (2 casos) | Verde. Sistemas 90/95/100, incluidas ambas reparaciones aisladas. |
| Recursos: promedio de cinco fracciones del inventario inicial, por 100, redondeado; no incluye presupuesto ni carga | `getView` | `Recursos promedia cinco fracciones, redondea y excluye presupuesto/carga` | Verde. Fracciones distintas 0.5/0.25/0.75/0.1/0.4 producen 40; variaciones de presupuesto/carga no afectan. Casos 0.4→0 y 0.8→1; preparación ganadora 65. |
| Cinco sistemas actualizados sin esperar revisión: propulsión/bomba, comunicación/antena, energía siempre OK, soporte vital/carga, navegación/trayectoria | `getView` | Tabla de objetivos, rediseño y dos reparaciones aisladas | Verde. Igualdad exacta de los cinco indicadores; verificar con ambas averías conserva los indicadores visibles y registra revisión, sin esconder riesgos. |

### R5 — Nueve referencias del balance

- Prueba de reglas: `P4 R5 nueve secuencias, causas completas, instantánea y reinicio`, caso parametrizado `$name: reloj de cada acción, evaluación, consumo, causas, diagnóstico y reinicio` (9 casos).
- Prueba de Session: `P4 R5 Session referencia $name y reset terminal exacto` (10 casos: la referencia 7 incluye fallo y éxito sin revisión). Se ejecutan acciones por `begin/complete` reales; no son controles de navegador.
- Las reglas comparan **cada hora intermedia**, inventario/carga, causas exhaustivas y fragmentos explicativos, métricas congeladas y los cuatro componentes de puntaje con tablas independientes, no con constantes importadas del motor.

| Ref. | Horas al completar acciones de preparación / espera | Resultado y causas completas | Componentes presupuesto/repuestos/tiempo/precisión; total | Session |
| --- | --- | --- | --- | --- |
| 1 Ganadora | 08:40, 08:50, 08:55, 09:15, 09:35, 10:05, 10:10, 10:20 | Éxito; ninguna causa | 256+140+166+150; **712** | Directo, sin aviso |
| 2 Ángulo 80 | Como ganadora | Fallo `angle`; explica 80° frente a 72° | 256+140+166+83; **0** | Aviso, cancelar sin cambio y confirmar |
| 3 Bomba omitida | 08:40, 08:50, 08:55, 09:15, 09:55, 10:00, 10:10 | Fallo solo `pump`, eficiencia 76 % | 280+180+208+150; **0** | Aviso y confirmación |
| 4 Antena omitida | 08:40, 08:50, 08:55, 09:15, 09:45, 09:50, 10:00 | Fallo solo `antenna`, señal 68 % | 272+160+250+150; **0** | Aviso y confirmación |
| 5 Clima | Ganadora más espera a 10:40 | Fallo solo `weather`; hora 10:40, viento 45 km/h y lluvia 0 % | 256+140+83+150; **0** | Aviso y confirmación |
| 6 Ventana perdida | Ganadora, 10:40, 11:00, 11:20 | Fallo automático `time`; hora final 11:20 y cierre 11:00; no despegue | 256+140+0+150; **0** | Launch bloqueado por partida terminada |
| 7 Sin revisión, antena omitida | 08:40, 08:50, 08:55, 09:15, 09:45, 09:50, espera a 10:00 | Fallo solo `antenna` | 276+160+250+150; **0** | Directo, sin aviso |
| 7 Sin revisión, reparaciones completas | Ganadora hasta 10:10, omitiendo verificar | Éxito, ninguna causa | 260+140+208+150; **758** | Directo, sin aviso |
| 8 Ángulo 90 y antena omitida | Como ref. 4 | Fallo `angle`, `antenna`, `fuel`; 90°/72°, señal 68 %, requerido 110.000 frente a 100.000 L | 272+160+250+0; **0** | Aviso enumera los tres riesgos actuales |
| 9 Carga antes de reparar | 08:40, 08:50, 08:55, 09:35, 09:55, 10:15, 10:20, 10:30 | Éxito; carga tarda 40, no 30; margen reducido | 256+140+125+150; **671** | Directo, acciones secuenciales y tokens no duplicables |

- Ref. 1: presupuesto 640.000, repuestos 35, combustible de almacén 20.000 y a bordo 100.000 antes / 8.000 después; márgenes meteorológico 20 min y de ventana 40 min.
- En todas las nueve referencias se comprueban los consumibles a bordo restantes: oxígeno 6.000, agua 2.000, alimentos 400. Combustible termina en 8.000, salvo ángulo 80/90 (0) y fallo por tiempo (100.000).
- Los fallos conservan componentes diagnósticos y total cero. Se cambia reloj, presupuesto, repuestos, ángulo y carga del estado terminal de prueba y el puntaje continúa usando su instantánea. Alterar la copia de métricas expuesta por `getScore` no modifica el puntaje posterior.
- Reinicio: cada referencia comprueba `createInitialState` contra `EXPECTED_INITIAL` independiente y rechazo terminal sin mutación. Cada terminación de Session comprueba `reset`, igualdad exacta, objetos anidados nuevos, aviso/tarea/resultados eliminados y nueva reparación funcional. Prueba adicional de token anterior al reset rechazado mientras la nueva tarea permanece en curso.

### API reglas v1 y códigos R4/R5

| Exportación contractual | Fuente | Pruebas vinculadas |
| --- | --- | --- |
| `createInitialState(): GameState` | `src/rules/index.ts:26` | P3 estado exacto; P4 reinicio de cada referencia de reglas y Session, tabla independiente `EXPECTED_INITIAL`. |
| `previewAction(state, action): ActionPreview` | `src/rules/index.ts:44` | P3 costos y pureza; P4 referencias verifican lanzamiento permitido con riesgos, bloqueos separados y rechazo terminal idéntico a razones de aplicación. |
| `applyAction(state, action): ActionResult` | `src/rules/index.ts:68` | P3 transición inmutable y rechazo con misma referencia; P4 todas las referencias, consumo limitado a carga y resultados completos. |
| `getView(state, draftAngle?): GameView` | `src/rules/index.ts:91` | P3 borrador frente a ángulo confirmado y pureza; P4 objetivos/fases/barras/sistemas, trayectoria invalidada y éxito con checklist incompleto. |
| `evaluateLaunch(state): LaunchEvaluation` | `src/rules/index.ts:31` | P3 límites de ventana; P4 listas exactas de bloqueos/riesgos, nueve referencias y omisiones; Session consume evaluación real al solicitar y confirmar aviso. |
| `getScore(state): ScoreBreakdown` | `src/rules/index.ts:87` | P4 componentes independientes por referencia, 712, fallos cero, copia de métricas y snapshot; siete filas `floor/round/clamp minute %i budget %i parts %i angle %i`. |

- **Códigos de riesgos estables del contrato**: `angle`, `pump`, `antenna`, `weather`, `fuel`. Los cuatro primeros se prueban aisladamente con referencias jugables. `fuel` aislado se comprueba con un **estado sintético** con 91.999 L a bordo y ángulo 72 (requerido 92.000); no se afirma que esa carga parcial sea una acción jugable. La referencia 8 prueba combustible insuficiente por decisiones reales. Otro caso prueba exhaustividad/determinismo de los cinco riesgos simultáneos, repetido tres veces.
- **Bloqueos separados**: ausencia de diseño, trayectoria ausente/invalidada, carga ausente, antes de ventana, fuera de ventana y partida terminada. Los códigos usados por la implementación son `design`, `trajectory`, `load`, `early`, `time`, `finished`; API v1 fija la semántica de bloqueos, no declara estos nombres como nuevos códigos estables. Test `bloqueos contractuales separados de riesgos, sin códigos de omisiones` compara listas exactas de evaluación y rechazos sin mutación. Los riesgos pueden coexistir con bloqueos; no se mezclan las listas.
- `busy` pertenece a **Session**, no a riesgos del motor. Test `busy es bloqueo del juego, no riesgo de reglas; reset invalida token y aviso` comprueba rechazo mutante, estado intacto y que las reglas no agregan ese riesgo.
- Omisiones de clima, confirmación del 72 inicial y revisión no añaden códigos de riesgo ni bloqueos; se prueba éxito omitiendo las tres tanto en reglas como en Session. Las fases no son bloqueos.
- Aviso: referencias de Session comprueban lista actual, Cancelar con misma referencia/contenido, confirmación única y lanzamiento directo sin revisión o sin riesgos. Tests `aviso recalculado al cambiar clima y ángulo después de revisar`, `reparación después de revisión elimina riesgo; aviso viejo no autoriza` y `reemplazar estado invalida aviso` verifican invalidación y evaluación nueva. El test `confirmar revalida bloqueos actuales incluso si la referencia del aviso permanece` usa mutación sintética de trayectoria para comprobar defensa de `confirmLaunch`; no sustituye pruebas de cambios jugables por `begin/complete`, que producen estados nuevos.
- Puntaje: `floor` de presupuesto/repuestos/tiempo, `round` de precisión, límites temporales 599/600/660/661 y ángulos 45/70/71/72/90; tiempo y precisión clamp 0–1 y total limitado a 1.000. El caso de presupuesto/repuestos superiores al inicial es **sintético** para probar clamp del total, no una victoria alcanzable. Cada fila comprueba también total 0 si el resultado es fallo.

### Evidencia temporal P4 (Core conserva las salidas completas)

1. `npm test -- tests/rules/rules.test.ts tests/game/game.test.ts`, código **127**, `vitest: not found`. Falta instalación de la sesión, **no rojo funcional**.
2. `node --version && npm --version && npm ci && npm test -- tests/rules/rules.test.ts tests/game/game.test.ts`, código **0**. Node **v22.23.5**, npm **10.9.9**; instalación del lockfile sin actualización; baseline **113 passed / 2 passed** (107 reglas, 6 juego), Vitest **4.1.12**.
3. Primera ejecución con 45 casos nuevos, antes de corregir nada: comando dirigido, código **1**, **157 passed / 1 failed**, reglas **134 passed**, juego **23 passed / 1 failed**. Único fallo: la expectativa nueva de éxito sin revisión decía **752**; motor devolvió **758**. La fórmula aprobada da presupuesto 650.000 → 260, repuestos 35 → 140, minuto 610 → floor(250×50/60)=208, precisión 150: **758**. Es error aritmético del test nuevo, **no discrepancia funcional ni regresión del motor**.
4. Se corrigió solo esa expectativa nueva a 758 y se añadió comprobación explícita de sus cuatro componentes. Comando dirigido más `npm test`, código **0**: **158 passed / 2 passed**, después **161 passed / 4 passed**. Los otros 44 casos nuevos fueron cobertura verde desde su primera ejecución; no se fabricó rojo alterando producción.
5. Se añadieron dos casos de reparación aislada y revisión sin ocultar indicadores. Primera ejecución de esos casos, mismo comando dirigido más suite completa, código **0**: **160 passed / 2 passed** (136 reglas, 24 juego), después **163 passed / 4 passed** (además assets 2 y dependencias 1). Son cobertura nueva verde, no TDD rojo/verde de implementación.
6. Búsqueda de ubicaciones con `grep -nE` en las dos fuentes y las dos suites, código **0**; las ubicaciones de las seis exportaciones y de `requestLaunch`, `cancelWarning`, `confirmLaunch`, `reset` se contrastaron con las pruebas. No se editó ninguna fuente.

### Límites del cierre P4

- R4/R5 quedan trazados y verdes en pruebas de reglas puras y Session real. No se detectó discrepancia funcional que requiera modificar fuentes, contrato o balance.
- No se ejecutaron build, Chromium, controles DOM, animaciones ni inspección visual en este paso. La confirmación visual de que el diálogo muestra la lista y el reinicio limpia tweens/callbacks reales permanece en los pasos de integración/verificación; estas pruebas no acreditan motor Phaser ni sustituyen J4/J5 de navegador.
- No hay SQL, migraciones o servicios externos. No se usan mocks como evidencia de motor real.
- P5–P9, gráficos, dependencias exactas/auditoría final y verificación independiente permanecen pendientes; esta sección no pide transición ni aprueba la entrega.


## P5: manifiesto, frames y procedencia declarada (A1/A3)

- Base contrastada: `spec-solucion`, `aprobada-original`, contrato Assets v1 y A1/A3 completos; adenda vigente conserva estos criterios. C-2–C-5 y C-7 intactas. Punto de partida de Core: `e9b65dfd0117525e8bbb83212de2e0e859d2e210`, rama `foundry/issue-6`, PR #7.
- Archivos leídos sin modificar: `public/assets/manifest.json`, los nueve PNG locales, `scripts/assets/generate.mjs`, `docs/assets.md`. `package.json` se consultó para contrastar el comando documentado `npm run assets`; no se ejecutó ese comando ni el generador.
- Cambios exclusivos: `tests/assets/assets.test.ts` (se conservan las dos pruebas originales y se añaden 58 casos: 60 totales), esta matriz (se conservan P3/P4). No se regeneró ni modificó arte, fuentes, documentación de arte, dependencias o configuración.
- Pruebas sobre los archivos PNG reales, no imágenes simuladas: descompresión zlib, verificación de CRC y reconstrucción de píxeles RGBA. Fixtures negativos solo en memoria; no se alteran archivos PNG. No hay SQL, migraciones ni servicios externos.
- Comando de todas las filas: `npm test -- tests/assets/assets.test.ts`, resultado final **código 0, 60 passed / 1 passed**, Vitest **4.1.12**. Regresión `npm test`: **código 0, 221 passed / 4 passed** (136 reglas, 24 juego, 60 assets, 1 dependencias).

### A1 — Assets v1 y fondos

| Requisito | Ubicación contrastada | Prueba / resultado real |
| --- | --- | --- |
| Versión 1 y nueve claves mínimas | `public/assets/manifest.json:2–154`; generación del manifiesto en `scripts/assets/generate.mjs:39` | `tests/assets/assets.test.ts:98`, `P5 A1 contrato mínimo y nueve claves exactas de salas`. Versión 1 y claves base-rooms, rocket, tower, terrain, technician, astronaut, smoke, flame, resource-icons presentes. Verde desde primera ejecución. |
| Rutas PNG locales, existencia y dimensiones reales | Rutas/tamaños de cada entrada de manifiesto; nueve archivos en `public/assets/`; `docs/assets.md:8–17` | Test parametrizado `P5 A1 PNG local %s` en `tests/assets/assets.test.ts:103`, helper `localPath:25`, `decodePng:53`. Nueve PNG leídos y decodificados; dimensiones coinciden. Rechazo de traversal, URL, rutas absolutas, data URL, separadores, query y escape porcentual en `:175` (8 fixtures). Verde desde primera ejecución para PNG/rutas. |
| PNG decodificables, no solo cabecera o longitud comprimida | `scripts/assets/generate.mjs:12`: perfil RGBA8 y PNG zlib; los nueve PNG almacenados | Decoder independiente: firma, límites de chunks, CRC de cada chunk, IHDR/IEND, RGBA8 no entrelazado, tamaño exacto de scanlines y reconstrucción de filtros 0–4. `P5 decodificador rechaza PNG en memoria: %s` (`:178`, 3 fixtures) rechaza truncado, firma y CRC alterados; comprueba archivo original intacto. Verde desde primera ejecución. No es un decoder universal para otros perfiles PNG. |
| Dimensiones/recortes enteros positivos, coordenadas enteras no negativas y límites inclusivos | `manifest.json:5–65`, mapa de nueve recortes; `generate.mjs:16–18`; docs `:8` | `validateGeometry` (`tests/assets/assets.test.ts:31`) valida tamaños de todos los assets y cada recorte. Fixtures negativos (`:135–169`) ejercitan geometría/índices; `P5 límites válidos` (`:170`) admite x/y cero, recorte completo e índices 0 y frames−1. Hubo rojo real del helper antes de fortalecerlo; verde final. |
| Nueve claves de salas y datos diferenciados | Mapa `crops`: design, control, weather, engineering, fuel, systems, storage, airlock, observation; `generate.mjs:16–31`; inventario textual en docs `:8` | Tests `:98` y `P5 A1 nueve fondos con recortes y datos RGBA distintos` (`:109`). Conjunto exacto de claves; nueve geometrías diferentes y nueve hashes SHA-256 diferentes sobre los píxeles de los recortes decodificados, no sobre PNG comprimidos. Verde desde primera ejecución. La diferencia de datos no acredita identificación visual de cada sala (A2). |

### A3 — Spritesheets e inventario de procedencia

| Requisito | Ubicación contrastada | Prueba / resultado real |
| --- | --- | --- |
| Técnico y astronauta: al menos 2 idle y 2 work | `manifest.json:81–115`; `generate.mjs:36`; `docs/assets.md:12–13` | `P5 A3 geometría y contenido de todos los frames: %s` (`tests/assets/assets.test.ts:116`): cuatro frames 16×24 en sheet 64×24; idle [0,1], work [2,3]; mínimos de longitud e índices diferentes en cada animación. Límites enteros 0≤índice<frames por helper. PNG y mínimos verdes desde primera ejecución; fixtures fortalecen rechazo de índices negativos/fraccionarios/NaN/igual o mayor a frames. |
| Humo y llama: al menos 3 frames y geometría válida | `manifest.json:117–145`; `generate.mjs:37`; `docs/assets.md:14–15` | Mismo parametrizado: sheets 96×32, tres frames 32×32, burn [0,1,2]; recortes implícitos dentro de imagen y alpha no vacío en cada frame. Se validan alto, ancho, frameWidth, frameHeight, frames e índices, también para humo/llama, no solo personajes. Verde final. La expectativa nueva de que todos los dibujos fueran únicos era más estricta que Assets v1 y se corrigió (detalle temporal debajo). |
| Iconos: geometría completa, no excluidos del validador | `manifest.json:147–153`; `generate.mjs:38`; `docs/assets.md:16` | Mismo parametrizado: sheet 96×16, seis frames 16×16, todos con contenido alpha; geometría entera positiva y límites de todos los recortes implícitos. Verde desde primera ejecución. No se agrega un requisito contractual de animación de iconos. |
| Dimensiones, recortes y animaciones documentados | `docs/assets.md:8–17`; datos del manifiesto y procedimiento en `generate.mjs:16–39` | `P5 A3 documentación: inventario dimensional, animaciones y procedencia declarada` (`tests/assets/assets.test.ts:184`): fila de cada clave con tamaño real del manifiesto, cantidad/tamaño de frames y arrays de cada animación; mapa crops y nueve recortes 128×64 documentados. Verde desde primera ejecución. |
| Autoría y procedimiento original declarados, sin afirmar inspección del mockup | `docs/assets.md:3–5`; `manifest.json:3`; `generate.mjs:1–12,16–39` | Mismo test comprueba autoría, ausencia de terceros declarada, referencia textual y negación expresa de inspección del mockup; comando, script, Node.js 22, Buffer/zlib, raster entero RGBA y sin suavizado. Revisión de código: importa solo node:fs/node:zlib, dibuja rectángulos/líneas/círculos con paleta definida, construye los nueve recursos y escribe PNG/manifiesto localmente; no hay descargas de imágenes de terceros en el procedimiento leído. `package.json` confirma script assets. Verde desde primera ejecución; es trazabilidad de documentación/procedimiento, no garantía jurídica de autoría. |

### Evidencia temporal P5 (salidas conservadas por Core)

1. Antes de modificar: `npm test -- tests/assets/assets.test.ts`, **código 127**, `vitest: not found`. Falta de instalación en sesión, no rojo de aceptación.
2. `node --version && npm --version && npm ci && npm test -- tests/assets/assets.test.ts`, **código 0**. Node **v22.23.5**, npm **10.9.9**, instalación del lockfile existente: `added 48 packages`, `found 0 vulnerabilities`; baseline **2 passed / 1 passed**. No se cambiaron versiones ni se resolvió un nuevo lockfile; este resultado no sustituye P7/D4.
3. Se escribieron primero los 58 casos adicionales y un helper geométrico que reproducía las comprobaciones antiguas (límites superiores, ancho de sheet). `npm test -- tests/assets/assets.test.ts`, **código 1, 36 passed / 24 failed**. **23 fallos** de fixtures del helper: algunos inválidos no se rechazaban y otros devolvían un diagnóstico insuficiente (`ancho spritesheet` en vez de dimensión inválida). El fallo restante fue una expectativa nueva demasiado estricta sobre dibujos únicos de llama. Los tests de manifiesto/PNG/rutas/docs y nueve fondos fueron cobertura verde desde primera ejecución.
4. Se fortaleció solo `validateGeometry`: enteros positivos en todas las dimensiones/cantidad de frames, coordenadas no negativas, alto y ancho de todos los spritesheets e índices enteros dentro de ambos límites. Nueva ejecución del comando dirigido, **código 1, 59 passed / 1 failed**: todos los fixtures ya rechazados; únicamente seguía fallando el requisito nuevo de dibujos únicos de llama. El `&& npm test` del comando compuesto no se ejecutó por ese fallo.
5. Se revisó `generate.mjs:37`: llama usa f%2 y, por tanto, frames 0 y 2 tienen el mismo dibujo. **Assets v1 exige >=3 frames, no tres dibujos únicos**; un ciclo puede volver al dibujo inicial. Se corrigió únicamente esa sobreexigencia del test nuevo: se mantiene mínimo de tres frames, burn con tres índices válidos distintos, contenido en cada frame y al menos dos dibujos diferentes. No se cambió arte ni se debilitó una prueba original o un mínimo contractual. Comando dirigido y regresión, **código 0**: **60 passed / 1 passed**, después **221 passed / 4 passed**.
6. `nl -ba`, `grep -nE` y lectura de `package.json`/listado de PNG, **código 0**, contrastan ubicaciones del manifiesto, suite, documentación y procedimiento. Sin ejecución del generador, build, Chromium o inspección visual.

**Rojo/verde:** ciclo real para el validador de pruebas con fixtures inválidos en memoria, no implementación de arte faltante ni rojo productivo. No se presenta el error de sobreexigencia de dibujos únicos como defecto contractual. No se encontró defecto real que exija editar arte/docs fuera de P5.

### Límites del cierre P5

- A1 queda trazado a archivos reales y pruebas automatizadas. A3 queda trazado a geometría/mínimos animables y documentación de procedencia declarada; no se garantiza jurídicamente la originalidad por una prueba de texto o lectura de código.
- Los hashes prueban diferenciación de datos de salas, no estética, significado visual o legibilidad. El decoder cubre el perfil RGBA8 no entrelazado del inventario, no todos los formatos posibles de PNG; los PNG actuales usan filtro 0, por lo que esta ejecución no acredita por fixtures los filtros 1–4.
- Validar sheets de una fila es comprobación del inventario actual documentado, no cambio del contrato que también permite atlas u otros spritesheets.
- No se inspeccionó el mockup ni se observaron animaciones, integración Phaser o capturas reales. **A2, A4 y P6 siguen pendientes**; P5 no los cierra ni sustituye revisión visual. Tampoco acredita reinicios en navegador, build, infraestructura final P7, documentación integral P8 o verificación independiente P9.
- No se pide transición ni aprobación de entrega en este paso.


## P6: arte integrado y animaciones (A2/A4/J6), cierre parcial con defecto visual

- Base completa leída: spec `aprobada-original` (A2/A4/J6, contratos y secuencias) y adenda vigente; cerebro C-2–C-5/C-7. Punto de partida informado por Core: `c3c63ec83af1c9b6695b54e7f8c92dfe1fb99f3d`, PR #7. No se modifica implementación, assets, dependencias ni evidencia P3–P5.
- Nuevos tests: `tests/e2e/game.spec.ts:60–106`, prefijo P6. HTTP `http://127.0.0.1:4173`, Chromium headless 158.0.8127.18 / Playwright v1254; 1600×900 y FIT 1280×720. Nueve salas por controles reales; idle de nueve personajes, trabajo del técnico en reparación, éxito con preparación completa, fallo por ángulo 80°, humo/llama activos, ascenso por comparación de posición, anomalía/interrupción y reinicios con lectura posterior. Se añade escucha de console.error/requestfailed a los pageerror/HTTP >=400 existentes.
- Sonda explícita: `astronaut-work-probe-*` llama `Sprite.play('astronaut-work')` en los dos astronautas reales, sin cambiar reglas. No es una acción de juego: el código actual solo activa trabajo de técnicos en Ingeniería/Combustible. No se afirma que se haya observado astronaut-work iniciado por una acción del jugador. No se añadió captura dedicada de carga/trabajo en Combustible antes de detener el cierre por el defecto visual.

### Comandos y resultados reales

1. Lecturas de fuentes y versiones: Node **v22.23.5**, npm **10.9.9**. `npm ci` código 0, 48 paquetes añadidos, sin cambios de versiones/lockfile. Instalación necesaria para poder probar, no validación P7.
2. `npm run test:e2e -- --grep 'J1/J2/A4/J6'`: código 1 por Chromium no instalado, **no rojo funcional**. `npx playwright install chromium` instala Chromium v1254; baseline del mismo test **1 passed (4.8 s)**, antes de las nuevas pruebas.
3. `npm run test:e2e -- --grep P6` tras añadir cobertura: **2 passed / 1 failed**. Falló medición exitosa (15752 ms) porque se consultó `LaunchScene.time.startTime` antes de que Phaser creara la escena encolada. Segundo intento `--grep 'P6 J6'`: **1 passed / 1 failed**, mismo problema de sincronización: Sprite smoke aún ausente al muestrear. Son errores de instrumentación nuevos, **no defectos productivos ni TDD rojo de arte**. Se corrige únicamente el test: esperar creación del sprite real antes de muestrear y usar performance.now en ambos extremos.
4. `npm run test:e2e -- --grep P6` corregido: **código 0, 3 passed (42.2 s)**. Primera observación de animación a creación del resultado: éxito **6915.9 ms**, fallo **3902.2 ms**, dentro de 6–8 / 3–5 s. No es tiempo exacto desde el clic (incluye sincronización inicial no medida); código fuente confirma timers 7000/4000. Sin console.error, pageerror, requestfailed o HTTP >=400 en los tres recorridos. Reinicio de ambos con estado inicial y espera de 2200 ms sin callbacks tardíos observados.
5. Regresión `npm test`: **código 0, 221 passed / 4 files**. Se intentó `npm test && npm run test:e2e` por herramienta paralela: error de herramienta sin salida final, aunque quedó un proceso ejecutándose. Reintento registrado: Vitest 221 passed y e2e **código 1 por puerto 4173 ocupado**, no fallo funcional. Un comando de espera y reejecución también terminó con error de herramienta y dejó otra suite ejecutándose; se detuvo su proceso Playwright y el servidor temporal para no dejar ejecuciones sin resultado registrado. **No se acredita regresión e2e integral en P6**; no se modificó configuración para evitar el conflicto. La suite P6 dirigida sí tiene salida final registrada. P9 no realizado.

### Revisión de fuentes, sin modificarlas

- `src/main.ts:5`: cinco escenas, 1600×900, pixelArt true, roundPixels y Phaser.Scale.FIT.
- `src/game/scenes.ts:17–21`: manifiesto, NEAREST, creación `this.anims` a partir de metadatos. `:34–40`: nueve salas y personajes Sprite.play idle/work, cohete/torre/terreno.
- `:168–172`: progreso de 2000 ms con `this.tweens` y `this.time.delayedCall`; `:178–190`: humo/llama Sprite.play, ascenso tween 6500/2200 ms, resultado this.time 7000/4000 ms, anomalía a 2200 ms. `:198–199`: reset y limpieza. La búsqueda `grep -Rn setInterval src` no devolvió coincidencias.

### Inspección visual efectivamente realizada

Herramienta **ver_captura**, no solo generación o geometría. Capturas P6 revisadas en `tests/e2e/rework-captures/` (prefijo `p6-`, extensión `.png`):

- `base-idle-1600-a`, `base-idle-1600-b`, `base-idle-1280`.
- `repair-work-a`, `repair-work-b`, `astronaut-work-probe-b`.
- `success-launch-a`, `success-launch-b`, `success-ascent`.
- `failure-launch-b`, `failure-anomaly`.
- `success-result`, `success-restart`.
- Además se vio `test-results/game-P6-J6-ascenso-exitoso-humo-llama-y-reinicio/test-failed-1.png` para diagnosticar el muestreo. No se conserva esa imagen fuera de la salida temporal ni se usa como aceptación.

**Visto:** nueve salas completas y diferenciadas por plano, monitor orbital, nube/manga de viento, herramientas, depósitos, racks, estanterías, esclusa y ventanal; nueve figuras completas en reposo a ambos tamaños. Paleta navy/gris con cian/naranja/amarillo/verde y bordes pixelados; cohete blanco/naranja, torre roja, montañas y dos reflectores amarillos, sin afirmar haces de luz. Astronautas visibles en la sonda. Resultado de éxito completo, 712 y componentes 256/140/166/150, sin restos de animación; captura de reinicio con cohete, nueve personajes y 08:30.

**Defecto bloqueante observado, no corregido por alcance:** panel inferior de Bloqueos/Riesgos tapa la zona bajo el cohete al iniciar y durante el ascenso, deja solo una franja de llama y no permite distinguir humo completo (`success-launch-a/b`, `success-ascent`, `failure-launch-b`). El aviso superior DESPEGUE EN CURSO superpone el encabezado/“Cohete Equilibrada”. Durante reparación, el panel de progreso tapa parte de las salas/personajes de la fila inferior (`repair-work-a/b`); el bloque de riesgos se corta por abajo. A4 exige ausencia de recortes/personajes invisibles y J6 inspección real de efectos: **no quedan aceptados** aunque las comprobaciones de Sprite/anims y los tiempos pasen.

- Para corregir hay que editar layout/renderizado en `src/game/scenes.ts` y/o `src/styles/game.css`, fuera de los tres destinos permitidos para P6. Se detiene la corrección productiva y se devuelve al manager para decisión; no se oculta el panel mediante el test ni se cambia arte o contrato.
- El visor también señala glifo vacío antes del título y mensajes “DESPEGUE EN CURSO” / “La partida terminó” simultáneos durante la animación. Se registran como observaciones, no como nuevos requisitos inventados. La salida superior del cohete durante el ascenso no se toma por sí sola como recorte defectuoso; la obstrucción inferior sí está comprobada.
- Las imágenes individuales revisadas no acreditan continuidad temporal ni comparación automática entre dos posturas: el visor no tuvo ambas imágenes simultáneamente. Ciclos activos y desplazamiento se comprueban con Phaser real; **suavidad/continuidad visual de las animaciones no verificada por vídeo**. No se presenta la estética como validada por hashes o geometría.
- Hay 27 capturas P6 generadas; las nueve `room-*`, `astronaut-work-probe-a`, `failure-launch-a`, `failure-ascent`, `failure-result` y `failure-restart` no fueron abiertas con el visor. Sus controles/recorridos sí se ejecutaron; no se declaran inspeccionadas. A2 tiene evidencia visual de contenido en la base, pero **P6 no está completamente verde**: A4/J6 visuales pendientes de corrección y nueva inspección. Sin trabajo P7–P9 ni solicitud de transición/entrega.

### P6 — Recomprobación desde `4e8a4dd` (esta ejecución)

- Solo P6, PR #7, `foundry/issue-6`. Spec base completa y vigente consultadas; se conservan P3–P5 y la evidencia P6 anterior. No se modifican fuentes, arte, versiones, configuración ni contratos.
- **A4 y parte visual J6 no aceptados**: se confirma la obstrucción documentada anteriormente. Para corregirla hacen falta `src/game/scenes.ts` y/o `src/styles/game.css`, fuera de los archivos autorizados en este paso. No se ocultan paneles desde las pruebas ni se altera el render para fabricar una captura verde. Se devuelve el bloqueo al manager antes de tocar esos archivos.

#### Cobertura real y resultados

| Criterio | Test / evidencia | Resultado de esta ejecución |
| --- | --- | --- |
| A2/A4: nueve salas, idle/work, integración a 1600×900 y 1280×720 | Tres tests P6 existentes de `tests/e2e/game.spec.ts`, conservados; capturas regeneradas por Chromium mediante controles reales | Baseline `npm run test:e2e -- --grep P6`: código 0, 3 passed; éxito 6917.9 ms y fallo 3918.9 ms desde primera observación de animación hasta resultado. No certifica ausencia de obstrucciones. |
| J6: frames efectivos, no solo `isPlaying` | Nuevo `P6 J6 frames reales idle, reparación y carga; configuración FIT`; `expect.poll` observa frames 0/1 técnico y astronauta idle, 2/3 técnico durante reparación y carga y retorno a idle | Primera ejecución `npm run test:e2e -- --grep 'P6 J6 frames'`: código 0, 1 passed. Trabajo activado por botones reales. Astronaut-work continúa siendo la sonda explícita existente, no una acción jugable. |
| J6: humo/llama y ascenso 6–8 s / 3–5 s | Los dos tests de ascenso conservan sus comprobaciones; se añade observación de frames 0/1/2 para ambos efectos con Phaser real | `npm run test:e2e -- --grep P6 && npm test`: código 0, 4 e2e passed; éxito 6918.8 ms, fallo 3901.5 ms. Humo/llama activos y posiciones de ascenso, apagado de llama en fallo y reinicios pasan. |
| Regresión unitaria | Mismo comando compuesto | Código 0, 221 passed / 4 archivos: reglas 136, juego 24, assets 60, dependencias 1. |
| Consola/red/reinicio | Listeners existentes de `pageerror`, `console.error`, `requestfailed` y HTTP >=400, lista vacía en afterEach | Sin errores observados en las cuatro pruebas P6, incluidas preparación/lanzamiento/reinicio. No es una garantía para todos los navegadores. |

- **TDD honesto:** las nuevas comprobaciones pasan contra la implementación existente desde su primera ejecución; cobertura ya verde, no ciclo rojo/verde de corrección. No se fabrica rojo. La discrepancia visual sigue abierta aunque los tests automatizados pasen.
- Preparación de sesión: Node v22.23.5, npm 10.9.9; `npm ci` instaló 48 paquetes desde el lockfile; `npx playwright install chromium` instaló Chromium 158.0.8127.18, v1254. No se actualizaron dependencias. El primer comando compuesto terminó con código 1 porque `--grep '^P6'` no encontró tests (el título completo incluye archivo); no fue un rojo funcional. Se corrigió el filtro a `P6`.
- Se intentó además `npm run test:e2e` sin filtro: la herramienta devolvió `Error: Function failed` sin resultado final, aunque el proceso seguía ejecutándose al consultarlo. No se inventa código de salida ni se declara verde la suite completa a partir de ese intento.

#### Inspección VISUAL REAL: herramienta `ver_captura`

- Se abrió realmente cada imagen citada abajo, no solo se generó. Las imágenes son screenshots completos de Chromium por HTTP; no se usaron geometría ni hashes como sustituto de estética.
- De las capturas previas a la regeneración se abrieron `p6-base-idle-1600-a.png` y `p6-success-launch-b.png`: nueve salas con nueve personajes visibles; paleta azul marino/gris con cian/naranja/amarillo/verde, cohete blanco/naranja, torre roja, montañas y reflectores pequeños. El panel inferior obstruye terreno/escape y el aviso superior obstruye encabezados.
- De las capturas regeneradas se abrieron las nueve `p6-room-{design,control,weather,engineering,fuel,systems,storage,airlock,observation}.png`: paneles completos y textos legibles, cohete/plataforma a la derecha. Los paneles de detalle ocultan temporalmente la cuadrícula/personajes; son cerrables y el recorrido no consume minutos. No se confunde esa ocultación temporal con un asset ausente.
- `p6-base-idle-1280.png`: nueve salas y un personaje distinguible por sala; no se aprecian recortes de viewport, pixel art coherente. El panel de mensajes cubre la zona inferior de la plataforma. A2 tiene evidencia visual de contenido/paleta; A4 integral no queda aceptado.
- `p6-repair-work-a.png`, `p6-repair-work-b.png`: aviso/barra de progreso visibles pero tapan parte de la fila inferior y personajes; texto de riesgos cortado por abajo. Los frames de técnico pasan en navegador, pero no se afirma que todas las posturas sean visualmente distinguibles detrás del aviso.
- `p6-astronaut-work-probe-a.png`, `p6-astronaut-work-probe-b.png`: personajes visibles y distinguibles sobre interiores oscuros, sin recortes importantes; es sonda de animación de los astronautas del pasillo/observación, no astronautas dentro del cohete.
- `p6-success-launch-a.png`, `p6-success-launch-b.png`, `p6-success-ascent.png`, `p6-failure-launch-a.png`: solo franja de llama distinguible, humo no claramente visible; panel inferior tapa escape/base de torre/terreno. «DESPEGUE EN CURSO» tapa parte del encabezado y «Cohete Equilibrada». También se lee «La partida terminó» durante despegue, observación ya registrada, no una nueva modificación autorizada.
- **Límite real del visor:** tras 20 aperturas, Core rechazó las solicitudes de `p6-failure-launch-b.png`, `p6-failure-ascent.png` y `p6-failure-anomaly.png` con «ya se miraron 20 capturas en esta ejecución». No se reintenta ni se rodea el límite. Esas tres imágenes y `p6-success-result.png`, `p6-failure-result.png`, `p6-success-restart.png`, `p6-failure-restart.png` **no fueron inspeccionadas visualmente en esta ejecución**, aunque se generaron y sus estados se comprobaron por tests. Tampoco se abrieron las dos capturas idle 1600 regeneradas. La evidencia visual anterior se conserva, no se atribuye a esta ejecución.
- No hay vídeo ni inspección continua de movimiento: se observaron fotogramas estáticos, frames activos y posición con Phaser real. Suavidad temporal y parte visual de resultado/reinicio quedan pendientes; no se sustituye por geometría ni aserciones.

#### Contraste de código sin modificaciones

- `src/main.ts:5`: `pixelArt:true`, `roundPixels:true`, resolución 1600×900 y `Phaser.Scale.FIT`; el nuevo test comprueba resolución/pixelArt/modo FIT en Chromium.
- `src/game/scenes.ts:20`: registros de `this.anims` a partir de frames del manifiesto, repeat −1; `:34,40` sprites idle/work. `:171–172`: tween de progreso y `this.time.delayedCall(2000,finish)`. `:183–189`: sprites smoke/flame con animaciones, tweens de ascenso y humo, temporizadores de anomalía/resultado 7000/4000 ms. Shutdown elimina tweens y eventos (`:38,101,190,199`).
- `grep -R -n 'setInterval' src/`: ninguna coincidencia. No se introduce reloj paralelo ni lógica de reglas en el renderer.
- Causa de layout contrastada: `.launch-reasons` en `src/styles/game.css` ocupa top 550, left 1130, ancho 450 y altura 105 sobre la zona de escape; `.progress` ocupa top 606 sobre la fila inferior; `.animation-label` ocupa top 180 sobre el encabezado. Hace falta una corrección productiva fuera de los tres destinos de P6, seguida de nuevas pruebas e inspección visual. **P6 permanece parcial/bloqueado; no se solicita transición ni entrega ni se ejecutan P7–P9.**

- Seguimiento del intento e2e completo: el proceso terminó posteriormente; `test-results/.last-run.json` contiene `{"status":"passed","failedTests":[]}`. Es evidencia del artefacto Playwright, **no un código de salida recuperado**: la invocación original de la herramienta sigue sin salida final disponible. La suite completa volvió a generar capturas P6; las observaciones visuales anteriores corresponden a las versiones abiertas después de la ejecución dirigida, no se afirma haber abierto las versiones finales regeneradas por la suite completa (límite del visor). La verificación independiente y la nueva inspección posterior a una eventual corrección siguen pendientes.
