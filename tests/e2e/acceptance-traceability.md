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
