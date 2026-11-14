# Persistencia de aprendizaje, versión 1

## Política compartida con el navegador

`policy.ts` define `PolicyV1`, `toPolicy` y `chooseAction`. Antes de usar un archivo externo, llamar a `parsePolicy(text)` de `policy-format.ts`. Este módulo no importa Node, Phaser ni el entrenador. `serializePolicy` valida también antes de exportar. `validatePolicy` acepta `unknown` y comprueba el formato, sin ejecutar contenido.

Campos exactos: `schemaVersion: 1`, versiones `rulesVersion`/`mapVersion` del motor, `architecture`, `parameters`, `metadata`. Arquitectura: entrada 36, oculta 64/ReLU, salida 4/lineal, `weightOrder: output-major`. Pesos JSON normales: `w1[h*36+i]` (2304), `b1[h]` (64), `w2[a*64+h]` (256), `b2[a]` (4). Solo números finitos. Metadatos: semilla uint32, pasos y actualizaciones enteros no negativos, actualizaciones no superiores a pasos. Un contador cero identifica una política inicial; los contadores no certifican calidad.

Límite: 2 MiB (2097152 bytes UTF-8), comprobado antes de `JSON.parse`. Los campos desconocidos, versiones/arquitectura incompatibles, dimensiones incorrectas y valores inválidos se rechazan. La política no contiene replay, estado del motor, PRNG ni tiempo de entrenamiento.

## Checkpoint para reanudar

`checkpoint.ts` define `CheckpointV1` y el estado CPU `TrainingState`:

- Redes online y objetivo, ambas con todos los pesos y sesgos Float64 convertidos a números JSON, sin redondeo deliberado.
- Configuración DQN fija de `DQN_CONFIG` y programa epsilon (1 a 0,1 en 100000 pasos). La versión 1 no permite cambiar estos parámetros al cargar.
- Replay completo de capacidad 10000: arrays de observaciones siguientes/actuales (36 por slot), acciones, recompensas, terminales y máscaras legales. Se guardan los slots **físicos**, incluidos los ceros de slots no usados, tamaño y cursor del próximo slot a escribir. La máscara debe coincidir exactamente con las entradas 22–25 de la observación siguiente, también en terminales (el motor conserva su legalidad geométrica). Máscara cero solo se acepta si esas entradas son cero; significa fallback a todas las acciones, conforme al contrato existente. La acción actual debe estar permitida por las entradas 22–25 actuales si hay alternativas legales.
- Partida completa `GameState`, incluyendo versiones, semilla, PRNG, objetos en orden, direcciones y temporizadores. Los campos de partida, jugador, guardianes y posiciones (incluidos objetos) son exactos: se rechazan campos desconocidos o ausentes. La validación consulta mapa/inicialización/constantes del motor; no implementa otro motor.
- Semilla del entrenamiento; PRNG de acciones y PRNG de muestreo de lotes independientes; pasos globales, actualizaciones, episodios completados antes de la partida actual y segundos activos acumulados.

`createTrainingState(seed, gameSeed)` crea el estado inicial. `advanceTraining` ejecuta exactamente un paso del motor y la actualización DQN correspondiente, sin reloj ni E/S. Al comenzar el siguiente paso de una partida terminal, incrementa episodios y crea una partida con semilla sucesiva uint32. No acumula historiales. El controlador temporal debe actualizar `activeSeconds` y comprobar presupuesto; esto corresponde al paso 7.

`toCheckpoint` devuelve una copia validada. `serializeCheckpoint`/`parseCheckpoint` validan y controlan el límite de 128 MiB (134217728 bytes UTF-8) antes de parsear. `restoreCheckpoint` valida antes de devolver un nuevo estado con arrays Float64 y partida independientes. Valida además rangos de observaciones, valores binarios, dirección one-hot, cursor/tamaño/pasos, calendario de actualizaciones, actividad/reaparición y prioridad de finales. No certifica que un archivo editado haya sido producido por un entrenamiento real: no hay firma criptográfica.

## Archivos Node

Solo `files.ts` importa Node. `savePolicy(path, policy)` y `saveCheckpoint(path, checkpoint)` serializan y validan **antes** de escribir. Crean un temporal exclusivo junto al destino, escriben, sincronizan el archivo, cierran y reemplazan mediante `rename`. Nunca eliminan primero el último destino válido. Los errores de escritura/sincronización/cierre/reemplazo conservan el destino cuando la operación del sistema lo permite; se intenta limpiar el temporal y se informa si falla la limpieza.

`loadPolicy(path)` y `loadCheckpoint(path)` comprueban tamaño con `stat`, leen bytes, vuelven a comprobar el tamaño y decodifican UTF-8 estricto antes de parsear. `loadCheckpoint` devuelve un `TrainingState` restaurado. Una carga fallida no escribe ni modifica el estado previo del llamador; el controlador solo debe sustituirlo después de que la promesa termine correctamente.

No se garantiza recuperación ante corte eléctrico, escrituras simultáneas al mismo destino ni todos los sistemas de archivos. Un bloqueo de reemplazo en Windows se informa sin borrar el anterior. El runtime, JSON, lectura, serialización y parseo consumen memoria adicional al almacenamiento de arrays/replay. Estas pruebas Node no certifican rendimiento ni memoria total en Windows con 4 GB. La persistencia por sí sola no implementa CLI, presupuesto, evaluación ni presentación.


## Controlador y CLI Node (A-2)

`npm run train -- --seed 42 --budget-seconds 21600 --output runs/experimento` crea un entrenamiento sin Phaser ni navegador. `--budget-seconds` admite un valor positivo de hasta 21600 (por defecto 21600); `--seed` es uint32. `npm run train -- --resume runs/experimento/checkpoint.json` acepta solo resume: nunca reemplaza semilla ni renueva presupuesto; la salida es la carpeta del checkpoint. Los errores y Ctrl+C se explican en español. SIGINT/Ctrl+C pausa y guarda antes de salir con código 0; argumentos, carga o guardado fallidos salen con código 1.

El checkpoint interno v1 admite el campo opcional `budgetSeconds`, finito, positivo y ≤21600, conservado por `toCheckpoint`/`restoreCheckpoint`. Los archivos anteriores sin ese campo toman el límite de 21600 conservando `activeSeconds`, no otras seis horas. No cambia PolicyV1 ni el contrato de inferencia. Un lector anterior que exige claves exactas puede rechazar este campo nuevo; debe usar el lector actualizado. `activeSeconds` puede exceder el presupuesto por el último lote iniciado y se registra explícitamente en `excessSeconds`.

`runTraining` usa un reloj monotónico inyectable y mide exclusivamente los lotes síncronos (32 pasos del motor por lote en producción). Comprueba tiempo y parada antes de cada lote. La espera del event loop, carga, creación, guardado, pausas y evaluación externa no suman tiempo activo. La pausa termina la invocación; la siguiente restaura el mismo contador. Guarda entre lotes cada 300 segundos activos desde el último guardado y en el cierre, incluida una excepción del lote. SIGINT se entrega entre lotes; no corta una actualización a medias. El CLI guarda checkpoint y luego política mediante las operaciones atómicas existentes, sin prometer una transacción entre ambos archivos.

Una ejecución nueva exporta `initial-policy.json` antes del primer lote; resume no la sobrescribe. Cada guardado exporta `policy.json` con los contadores reales. El CLI emite registros JSON `inicio`/`fin`: semilla, presupuesto, tiempo activo acumulado y de sesión, pasos acumulados y de sesión, motivo (`budget`/`SIGINT`), exceso, duración de pared de la sesión de entrenamiento (incluye guardados/esperas, excluye carga inicial) y pasos por segundo activo. Los contadores identifican entrenamiento, no garantizan calidad. La medición Windows sigue pendiente.

## Evaluación CLI (A-4)

`npm run evaluate -- --initial runs/experimento/initial-policy.json --policy runs/experimento/policy.json --output runs/experimento/evaluation.json` carga y valida ambas PolicyV1 antes de evaluar o escribir. `evaluate` usa exclusivamente `chooseAction`, `observe`, `legalActions` y `step`: no importa DQN ni actualiza pesos, no consume PRNG de exploración. La referencia aleatoria usa una tirada de Mulberry32 por acción, intervalos de igual anchura entre acciones legales y PRNG separado del motor, inicializado con la semilla del episodio. El mapa conectado siempre ofrece acciones legales; una lista vacía para esta referencia se rechaza, no se inventa una acción.

Las tres referencias `initial`, `policy` y `random` recorren las mismas semillas 1001–1030, desde tres vidas y con límite 3000 del motor. La política inicial es la guardada antes del entrenamiento, no un jugador programado. El JSON `EvaluationReport` v1 contiene `schemaVersion`, `stepLimit`, `seeds` y `references`. Cada referencia contiene 30 `episodes` con `seed`, `points`, `wins` (0/1), `livesLost` y `steps`, además de `statistics` por cada una de esas cuatro métricas. Cada agregado contiene `mean`, `median` y `populationStdDev`: media aritmética; mediana de datos ordenados (promedio de los dos centrales cuando corresponde); raíz de la media de desviaciones cuadradas, divisor N, no N−1. Se pueden recalcular desde los episodios sin necesitar el entrenador. No se conservan trayectorias completas.

Los argumentos duplicados, desconocidos o incompletos se rechazan en español con código 1. La salida se escribe mediante `atomicSave` (ahora exportada con operaciones reales por defecto); validaciones y evaluación preceden al reemplazo. Conserva las mismas garantías y límites del guardado de políticas/checkpoints. No cambia PolicyV1 ni el contrato entre líneas.

## Medición y memoria (A-5)

`trainingMemoryBudget()` documenta la cota del payload de buffers, arrays numéricos y referencias de trabajo simultáneos. Los buffers tipados se cuentan con su ancho real; los slots de arrays JS numéricos/referencias, a 8 bytes. No es una garantía de heap ni RSS: cabeceras de objetos/arrays, capacidad interna del runtime, strings, GC y copias retenidas hasta recolección requieren memoria adicional. El límite algorítmico no equivale a memoria total de proceso. Se contabilizan incluso temporales que se usan secuencialmente como si coexistieran:

| Componente | Fórmula en bytes | Valor |
| --- | --- | ---: |
| Replay | 10000 × (2 × 36 × 8 + 8 + 3 uint8) | 5870000 |
| Redes online y objetivo | 2 × (36 × 64 + 64 + 64 × 4 + 4) × 8 | 42048 |
| Gradiente | una red | 21024 |
| Reemplazo de red objetivo, sin descontar la anterior | una red | 21024 |
| Lote copiado: observaciones, legales, acción/recompensa/terminal | 32 × (72 + 4 + 3) × 8 | 20224 |
| Referencias del lote y ejemplos | 32 × (1 + 1 + 3) × 8 | 1280 |
| Activaciones Bellman/gradiente | 2 × (64 + 4) × 8 | 1088 |
| Observación del paso anterior y siguiente | 2 × 36 × 8 | 576 |
| Arrays cortos de acciones/candidatos | 8 × 4 × 8 | 256 |
| Distancias BFS | 19 × 15 × 2 | 570 |
| Cola BFS: referencias y coordenadas, una entrada por celda | 19 × 15 × 3 × 8 | 6840 |
| Trabajo del motor: ocho listas/posiciones por celda, actores/eventos | 8 × 285 × 3 × 8 + 4 × 32 × 8 | 55744 |
| **Total conservador de payload** | suma | **6040674** |

El total es aproximadamente 5,761 MiB, menor que 128 MiB (134217728 bytes). `trainingArrayBytes` mide buffers persistentes reales (5912048 bytes); los tests lo contrastan con `byteLength`, incluyen gradiente/red transitoria y verifican un replay circular lleno sin ampliar buffers después de 10032 reinicios de episodio forzados. El entrenador mantiene únicamente el estado actual, un contador de episodios y el replay fijo: no hay un historial de episodios. Ni estas cuentas ni las pruebas acotan el GC o toda la memoria del proceso.

El CLI rechaza una configuración cuyos arrays excedan el límite y añade al registro `fin`: `arrayPayloadBytes`, `maxRSSBytes`, `sampledMaxRSSBytes`, `memoryMethod`, `memoryLimitations` y `wallStepsPerSecond`. `maxRSSBytes` es `process.resourceUsage().maxRSS × 1024` (Node expresa el máximo en KiB): máximo residente del proceso desde inicio hasta la medición, incluyendo carga y guardado, no solo los lotes. Como contraste, `process.memoryUsage().rss` se muestrea entre lotes y tras guardados; ese máximo muestreado puede perder picos. No hay temporizador de juego. `stepsPerSecond` divide pasos de sesión por tiempo activo; `wallStepsPerSecond` usa la duración de pared del controlador, incluidos guardados y esperas, excluida carga/creación/exportación inicial. El muestreo entre lotes no suma tiempo activo.

La serialización/parseo materializa arrays JS, texto JSON y buffers adicionales (no incluidos en la cota de entrenamiento); pueden coexistir durante guardado/restauración. Runtime, objetos y GC también son adicionales. La sesión Linux con Node 22 no certifica ejecución/rendimiento ni memoria en Windows con 4 GB.

## Evidencia del paso 8

Datos reales en `tests/learning/evidence/step-8-evaluation.json` (90 episodios y todos los agregados) y `tests/learning/evidence/step-8-smoke.json` (entorno, comandos, métricas, fórmulas y hashes). Checkpoint/políticas/logs experimentales están en `runs/paso-8`, ignorado por Git. Los hashes identifican los archivos de esta ejecución; un presupuesto de reloj en otra máquina no reproduce necesariamente el mismo número de pasos.

- Node v22.23.5, Linux x64. Humo: 60,006532090 segundos activos; exceso de último lote 0,006532090; pared del controlador 62,606444034 segundos; 232864 pasos, 57967 actualizaciones, 1541 episodios anteriores al actual; replay 10000, cursor 2864. Pesos iniciales y posteriores distintos, no una estrategia sustituta.
- Ritmo activo: 3880,644188 pasos/s; pared: 3719,489321 pasos/s. Máximo RSS del proceso: 132341760 bytes (126,211 MiB); máximo muestreado: 127725568 bytes. No extrapolar esta medición a seis horas o Windows.
- Evaluación completa: 90 episodios, mismos límites/semillas. Puntos media/mediana/desviación poblacional: inicial 10/10/0; posterior 1466,333333/1220/880,778002; aleatoria 730,333333/605/583,309428. Las tres referencias tuvieron cero victorias y tres vidas perdidas por episodio. Son resultados de un único humo, no prueba ni garantía de mejora general.
- TDD rojo: módulos evaluation/memory ausentes; CLI sin métricas y sin exportación `atomicSave`. Verde: ocho tests nuevos; suite completa `npm test -- --maxWorkers=2`, 199 tests Vitest y dos tests Node; `tsc --noEmit`, código 0.
- Una ejecución completa con concurrencia por defecto agotó el timeout existente de 5 segundos de `tests/learning/persistence.test.ts`; no se cambió ese test ni configuración raíz. La suite completa con dos workers pasó. El primer intento de tests antes de instalar dependencias falló por ausencia de Vitest local; la evidencia roja válida se obtuvo después de `npm ci`, con Vitest 4.1.12. La instalación informó una vulnerabilidad baja; no se actualizaron dependencias fuera del paso.
