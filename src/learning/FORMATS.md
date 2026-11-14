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

No se garantiza recuperación ante corte eléctrico, escrituras simultáneas al mismo destino ni todos los sistemas de archivos. Un bloqueo de reemplazo en Windows se informa sin borrar el anterior. El runtime, JSON, lectura, serialización y parseo consumen memoria adicional al almacenamiento de arrays/replay. Estas pruebas Node no certifican rendimiento ni memoria total en Windows con 4 GB. No implementan CLI, presupuesto, evaluación ni presentación.
