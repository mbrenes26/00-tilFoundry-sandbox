# Lúmina: guardianes del laberinto

Juego original de laberinto para observar una red neuronal pequeña que decide cómo mover una luciérnaga frente a cuatro guardianes. El motor es determinista y está separado del dibujo y del entrenamiento. Hay un mapa, tres vidas y un máximo de 3000 pasos por partida. Los objetos dan puntos y los poderes permiten capturas en cadena. No hay juego manual, backend, GPU ni servicios de entrenamiento.

El entrenador usa una DQN en CPU local; no sustituye la red por rutas programadas. Este experimento **no garantiza mejora**, convergencia ni maniobras concretas. Una partida vistosa o contadores de entrenamiento altos no demuestran que haya aprendido una estrategia mejor.

## Preparar el proyecto en Windows

Instala **Node.js 22** (incluye npm). Abre **PowerShell** en la carpeta del proyecto y comprueba las versiones:

```powershell
node --version
npm --version
npm ci
```

`node --version` debe mostrar `v22.x`. `npm ci` instala las versiones fijadas por `package-lock.json`; requiere acceso a Internet para descargar dependencias. TypeScript 5, Phaser 3, Vite 6.4.6, Vitest 4.1.12 y Playwright 1.65.0 forman el stack del proyecto. Si PowerShell bloquea el archivo `npm.ps1`, utiliza `npm.cmd` en lugar de `npm` (y `npx.cmd` en lugar de `npx`); no hace falta cambiar la política de ejecución del equipo.

Para las pruebas de navegador, instala Chromium de Playwright si aún no está instalado:

```powershell
npx playwright install chromium
```

Esta descarga no es necesaria para entrenar. Entrenamiento y evaluación se ejecutan con Node, sin Phaser ni navegador, y no necesitan secretos ni red después de instalar las dependencias.

## Abrir el juego y comprobar el proyecto

```powershell
npm run dev
```

Abre **http://localhost:5173** en el navegador (si Vite anuncia otro puerto, utiliza el que muestra). Mantén esa terminal abierta; Ctrl+C detiene el servidor. Usa HTTP, **no `file://`**: abrir `index.html` con doble clic no es una forma compatible de ejecutar el juego. El servidor de desarrollo escucha en todas las interfaces; úsalo en una red de confianza, no como publicación pública.

En otra terminal, desde la misma carpeta:

```powershell
npm test -- --maxWorkers=2
npm run build
npm run test:e2e
```

- `build` comprueba TypeScript y genera los archivos estáticos en `dist/`. Elegir hosting y publicar son trabajos separados; no es necesario hacerlo para experimentar localmente.
- `test` ejecuta las pruebas de configuración y de motor/aprendizaje. `--maxWorkers=2` es un argumento soportado por Vitest: limita a dos procesos de pruebas para evitar competencia de recursos. Ejecuta los tres comandos de este bloque uno después de otro, no en paralelo.
- `test:e2e` ejecuta Chromium y arranca su propio servidor HTTP en el puerto 5173. Antes de ejecutarlo, detén el servidor de desarrollo que use ese puerto; no reutiliza un servidor abierto.

El comando integrado recomendado arriba es aplicable en PowerShell, pero **no valida Windows** ni cambia las reglas del juego o las comprobaciones de los tests. En la sesión Linux con recursos limitados, el probador reprodujo dos fallos de `npm test` sin límite de procesos: la prueba en `tests/learning/persistence.test.ts:97` agotó su tiempo de espera de **5000 ms**. Con `npm test -- --maxWorkers=2` pasaron las 199 pruebas de Vitest y las 2 de Node. El límite reduce la competencia de recursos; no aumenta el tiempo de espera ni oculta esos fallos de la ejecución sin límite. Si el comando limitado también falla en tu equipo, conserva y comunica la salida del error; no des por comprobado el proyecto.

La presentación usa BootScene, BaseScene, UIScene, LaunchScene y ResultScene, resolución lógica 1600×900, ajuste FIT y pixel art. El inventario de arte original está en [`public/assets/inventory.json`](public/assets/inventory.json).

## Entrenar hasta seis horas activas

Usa una carpeta nueva para cada experimento. Iniciar una ejecución nueva en una carpeta ya usada puede reemplazar sus resultados: para continuar, utiliza `--resume`, no el comando de inicio.

```powershell
npm run train -- --seed 42 --budget-seconds 21600 --output runs/experimento
```

21600 segundos son seis horas **activas de lotes de entrenamiento**, no seis horas de reloj desde abrir la terminal. El presupuesto máximo permitido es 21600; para un primer ensayo local corto puedes usar, por ejemplo, `--budget-seconds 60` y otra carpeta. El tiempo de carga, creación, guardado, espera, pausas y evaluación no suma tiempo activo. El presupuesto se comprueba antes de cada lote de 32 pasos: el último lote iniciado puede provocar un pequeño exceso, registrado en la salida.

### Pausar y reanudar sin reiniciar el presupuesto

En la terminal de entrenamiento pulsa **Ctrl+C una vez** y espera el mensaje **«Guardado completo»** antes de cerrar la ventana. La señal se atiende entre lotes; guarda el checkpoint y después la política, y termina esa ejecución. Cerrar la terminal a la fuerza o cortar la alimentación no es una pausa segura. Hay además guardados cada 300 segundos activos y al finalizar.

Para continuar:

```powershell
npm run train -- --resume runs/experimento/checkpoint.json
```

La reanudación conserva la semilla, los pesos, el replay, la partida, los generadores aleatorios, los contadores y el presupuesto activo acumulado: **no otras seis horas**. No combines `--resume` con `--seed`, `--budget-seconds` ni `--output`; la carpeta de salida es la del checkpoint. Si ya se agotó el presupuesto, reanudar guarda y termina sin entrenar pasos nuevos. Los checkpoints antiguos sin `budgetSeconds` usan el máximo 21600 pero conservan su tiempo activo anterior.

Un error de argumentos, carga o guardado se informa en español y devuelve código 1. Un cierre normal por presupuesto o Ctrl+C devuelve código 0. Si falla el guardado, no supongas que el último progreso está disponible. No ejecutes dos entrenadores en la misma carpeta.

## Archivos y compatibilidad

Todos los resultados del experimento son locales en `runs/experimento/`, ignorado por Git:

| Archivo | Contenido y uso |
| --- | --- |
| `initial-policy.json` | Red inicial exportada antes del primer lote, para comparar. Reanudar no la reemplaza. No es una red entrenada. |
| `policy.json` | Red online en el último guardado; se importa en el juego. No basta para reanudar el entrenamiento. |
| `checkpoint.json` | Redes online/objetivo, replay circular, configuración, partida, PRNG, episodios, pasos, actualizaciones, `activeSeconds` y `budgetSeconds`. Permite continuar exactamente desde lo guardado. |
| `evaluation.json` | Episodios y estadísticas de las tres referencias; se genera al evaluar. |

La política **PolicyV1** tiene `schemaVersion: 1`, `rulesVersion`, `mapVersion` y arquitectura de **36 entradas, 64 neuronas ReLU y 4 salidas lineales**. Incluye pesos y sesgos en orden `output-major`, y metadatos `seed`, `trainingSteps` y `updates`. Estos contadores declarados **no certifican** calidad ni autenticidad: no hay firma criptográfica. La política no contiene replay ni tiempo activo. Checkpoint y evaluación también tienen formato versión 1; las versiones, dimensiones y valores se validan antes de usarlos. Consulta el contrato exacto en [`src/learning/FORMATS.md`](src/learning/FORMATS.md).

Se rechazan JSON corruptos, números no finitos, campos desconocidos y versiones incompatibles. La política admite hasta 2 MiB; el checkpoint hasta 128 MiB de JSON UTF-8 antes de parsear. Un fallo de carga no inicia entrenamiento ni ejecuta contenido del archivo. Los guardados validan, escriben un temporal y reemplazan el destino sin borrar primero el anterior; se intenta conservar el último válido si hay un error. No se garantiza recuperación ante corte eléctrico o todos los sistemas de archivos. Checkpoint y política se guardan por separado: no forman una transacción conjunta. Haz copias de seguridad de los archivos con el entrenador detenido.

## Evaluar antes y después

Con el entrenamiento detenido y ambos archivos disponibles:

```powershell
npm run evaluate -- --initial runs/experimento/initial-policy.json --policy runs/experimento/policy.json --output runs/experimento/evaluation.json
```

Se comparan la red inicial (`initial`), la red guardada (`policy`) y un jugador aleatorio uniforme entre acciones legales (`random`). Cada referencia juega las mismas 30 semillas, **1001–1030**, con tres vidas y límite de 3000 pasos: 90 episodios en total. Las redes se evalúan sin actualizar pesos y sin exploración epsilon; la aleatoriedad es únicamente la referencia aleatoria y la del motor sembrado.

Por episodio se exportan `points` (puntos), `wins` (0/1), `livesLost` (vidas perdidas) y `steps` (pasos). Para cada métrica se incluyen **media**, **mediana** y **desviación poblacional** (`mean`, `median`, `populationStdDev`). La media divide la suma entre N; la mediana ordena y promedia los dos centrales cuando corresponde; la desviación es la raíz de la media de las desviaciones cuadradas, con divisor N, no N−1. Puedes recalcularlas desde los episodios del JSON. Menos vidas perdidas o más puntos no garantizan victoria; registra resultados aunque no haya mejora.

## Importar una política y observar la partida

1. Abre el juego por HTTP y pulsa **«Seleccionar archivo JSON»**.
2. Selecciona `runs/experimento/policy.json`, no `checkpoint.json` ni `evaluation.json`.
3. Espera «Política válida», elige una semilla entera entre 0 y 4294967295 y pulsa **«Iniciar partida»**.
4. Observa puntos, vidas, fase, poder y pasos. Usa **Pausar/Reanudar**, velocidades **1×/4×** y **Reiniciar**. Reiniciar conserva la política y la semilla; tras un final comienza pausado. Puedes importar otra política con el botón correspondiente.

El juego realiza **inferencia sin aprendizaje ni exploración** con la misma red y motor compartidos. No modifica los pesos. Velocidad y pausa solo cambian el ritmo de presentación, no la evolución simulada para la misma política y semilla. La semilla del entrenamiento y la semilla elegida para visualizar una partida tienen usos distintos. Un archivo inválido muestra un error en español; «Iniciar partida» permanece deshabilitado hasta validar política y semilla. Importar una política inicial o de prueba no la convierte en una red entrenada.

## Medir el experimento en tu equipo

El entrenador imprime un registro JSON `inicio` y otro `fin`. Conserva el registro final completo de **cada invocación**, también cuando pauses:

- `activeSeconds`: segundos activos acumulados entre reanudaciones; `sessionActiveSeconds`: solo los lotes de esta invocación. `budgetSeconds`, `excessSeconds` y `reason` (`budget` o `SIGINT`) explican por qué terminó.
- `steps` y `sessionSteps`: pasos acumulados y de sesión. `stepsPerSecond` = `sessionSteps / sessionActiveSeconds`; `wallStepsPerSecond` = `sessionSteps / durationSeconds`. El segundo incluye esperas/guardados y suele ser menor.
- `durationSeconds`: tiempo de pared del controlador desde después de cargar/crear/exportar la política inicial hasta el guardado final. No es el tiempo total desde lanzar npm. Para medir además ese tiempo total, anota `Get-Date` inmediatamente antes y después del comando en PowerShell; la diferencia incluye arranque y carga. No confundas tiempo de pared con el presupuesto activo.
- `maxRSSBytes`: máximo residente informado por Node (`process.resourceUsage().maxRSS`, KiB convertidos a bytes) desde el inicio del proceso, incluyendo carga y guardados. `sampledMaxRSSBytes`: máximo observado de `process.memoryUsage().rss` entre lotes y después de guardados; puede perder **picos**. RSS no equivale a memoria reservada ni al límite de arrays.

Para revisar fácilmente un registro final, copia **solo la línea JSON `fin`**, sin mensajes de npm, a `runs/experimento/fin.json` y ejecuta:

```powershell
$fin = Get-Content runs/experimento/fin.json -Raw | ConvertFrom-Json
$fin | Select-Object reason, activeSeconds, sessionActiveSeconds, sessionSteps, durationSeconds, stepsPerSecond, wallStepsPerSecond, maxRSSBytes, sampledMaxRSSBytes
```

### Memoria del proceso en Windows

Mientras entrenas, abre **otra PowerShell** en la carpeta del proyecto. Este muestreo identifica procesos Node cuya línea de comando contiene el entrenador y registra cada PID por separado, incluidos posibles lanzadores de tsx:

```powershell
New-Item -ItemType Directory -Force runs/experimento | Out-Null
while ($true) {
    $trainers = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
        Where-Object { $_.CommandLine -match 'scripts[\\/]train\.ts' }
    foreach ($trainer in $trainers) {
        $process = Get-Process -Id $trainer.ProcessId -ErrorAction SilentlyContinue
        if ($null -ne $process) {
            $process.Refresh()
            [pscustomobject]@{
                Timestamp = (Get-Date).ToString('o')
                PID = $process.Id
                WorkingSetBytes = $process.WorkingSet64
                PeakWorkingSetBytes = $process.PeakWorkingSet64
            } | Export-Csv runs/experimento/memory.csv -Append -NoTypeInformation
        }
    }
    Start-Sleep -Seconds 1
}
```

Ctrl+C en **esta segunda terminal** detiene solo el muestreo, no guarda el entrenamiento. `WorkingSet64` es el conjunto de trabajo residente actual de Windows; `PeakWorkingSet64` es el pico que el sistema informa para ese proceso hasta la lectura. RSS y working set describen memoria residente según sus plataformas, pero no deben tratarse como métricas idénticas ni como toda la memoria del equipo. Separa el PID del entrenador de lanzadores y otras ejecuciones; no sumes todos los Node como si fueran una sola red. El máximo de las muestras de `WorkingSetBytes` es un **máximo observado**, no un pico continuo garantizado. El pico informado en una lectura puede recoger picos anteriores, pero la última lectura puede ocurrir antes del guardado final y perder su consumo. Conserva también la salida final de Node. Anota CPU, versión Node/Windows, RAM disponible y periodo de muestreo al comparar experimentos.

### Límites de memoria y de las mediciones

El límite algorítmico de arrays/replay de entrenamiento es **128 MiB**, no un límite de todo el proceso. La cuenta conservadora actual es 6040674 bytes (aproximadamente 5,761 MiB); el replay tiene 10000 transiciones y no se acumulan historiales de episodios. **JSON**, lectura, serialización/parseo, copias, objetos, recolección de basura y **runtime** requieren memoria adicional; pueden coexistir varias copias durante guardado/reanudación. El límite de tamaño del checkpoint no garantiza un parseo barato ni que el equipo no use memoria virtual.

La ejecución y el rendimiento en **Windows con 4 GB están pendientes de verificar** en el equipo real; Chromium de la sesión no certifica ese sistema. El experimento local de **seis horas también queda pendiente** de ejecutar y medir allí. Empieza con un humo corto, observa tiempo/ritmo/memoria y guarda si aparecen problemas; no extrapoles una medición de un minuto a seis horas. No se promete que el proceso completo quepa en 4 GB junto con Windows y el navegador. Para reducir carga, puedes cerrar el navegador mientras entrenas; no es necesario para el entrenador.

## Evidencia disponible y alcance de lo comprobado

La evidencia real del humo está en [`tests/learning/evidence/step-8-smoke.json`](tests/learning/evidence/step-8-smoke.json) y la evaluación completa en [`tests/learning/evidence/step-8-evaluation.json`](tests/learning/evidence/step-8-evaluation.json). Entorno: Linux x64, Node v22.23.5, **no Windows**. En ese único humo se midieron 60,006532090 segundos activos, 232864 pasos, aproximadamente 3880,64 pasos/s activos y máximo RSS informado de 132341760 bytes. Los pesos iniciales y posteriores fueron distintos. Las tres referencias tuvieron cero victorias: la diferencia de puntuación de ese humo no prueba mejora general.

Las pruebas de CLI en `tests/learning/train-cli.test.ts` ejercitan SIGINT real, guardado y reanudación con un presupuesto breve, incluida reanudación ya agotada, sin renovar la política inicial. Las pruebas de navegador usan también fixtures: un fixture no es evidencia de entrenamiento. La semilla hace repetible la evolución con la misma secuencia de acciones; un presupuesto basado en reloj puede producir distinto número de pasos y pesos en otro equipo.

Dependencias, `dist/`, `runs/` y resultados de pruebas están excluidos de Git; el arte original y su inventario sí pertenecen al repositorio. La instalación de dependencias en la sesión informó una vulnerabilidad de severidad baja; no se actualizaron versiones fuera de la spec. No se han medido aquí seis horas locales ni Windows, ni se garantiza recuperación frente a todos los fallos de sistema o calidad de aprendizaje.
