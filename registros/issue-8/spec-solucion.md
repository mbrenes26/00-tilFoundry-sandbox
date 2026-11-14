---
id: "issue-8/spec-solucion"
tipo: "spec-solucion"
titulo: "Lúmina: juego original y aprendizaje neuronal local"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "074c9d458891fd83dd08af5bd95f94c15eeb76c3", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 48993, "tokens_salida": 7806, "monto_ia": 0.114465, "minutos_computo": 0, "monto_computo": 0.0}
---
# Solución
issue-8: «Lúmina: guardianes del laberinto». Juego original desde cero para observar una red neuronal que aprenda jugando, sin prometer mejora ni comportamientos emergentes. Personaje: luciérnaga; cuatro guardianes y pixel art originales. Discovery confirmado: un laberinto, tres vidas, puntuación por objetos y capturas en cadena; entrenamiento sin dibujo, pausa/guardado/reanudación y visualización posterior. Repositorio nuevo: solo README.md.

## Riesgo declarado
medium, según el contexto vigente de Core. Sin producción, datos personales, login, pagos ni servicios externos. Archivos locales se validan antes de usarse; nunca se ejecuta su contenido.

## Presupuesto
Entrenamiento local en Windows, 4 GB RAM, sin GPU. Máximo acumulado de seis horas activas (21600 segundos), excluyendo pausas, carga y evaluación. Comprobación antes de cada lote; un lote iniciado puede causar un breve exceso registrado. No se garantiza rendimiento ni aprendizaje en ese equipo. Replay/arrays de entrenamiento tienen límite algorítmico de 128 MiB; JSON, runtime y sistema requieren memoria adicional. No se fija presupuesto monetario ni se contratan servicios. El experimento de seis horas en el equipo de la persona queda pendiente de ejecutar allí; la entrega no exige ese cómputo en la sesión.

## Cerebro consultado
C-2: reglas puras independientes de Phaser. C-3: BootScene, BaseScene, UIScene, LaunchScene y ResultScene, pixelArt, FIT y 1600×900; this.anims, tweens y this.time, sin setInterval. C-4: Node.js 22, npm run dev por HTTP, npm run build estático, publicación aparte. C-5: arte original con inventario e interfaz española. C-7: TypeScript 5, Phaser 3, Vite exactamente 6.4.6, Vitest exactamente 4.1.12 y @playwright/test exactamente 1.65.0. Se mantienen todas.

## Decisiones para el cerebro
- El entrenamiento neuronal de este juego se ejecuta en CPU local con Node.js 22 y TypeScript, separado del renderizado, sin backend ni GPU. Usa una DQN pequeña con operaciones numéricas propias y política JSON versionada compartida entre entrenador y navegador.

## Reglas propuestas
- Mapa original de 19×15, caminos conectados sin túneles envolventes, cuatro poderes y píldoras en el resto de casillas transitables salvo posiciones iniciales. Todas las píldoras deben ser alcanzables. Un solo nivel.
- Acciones 0 arriba, 1 derecha, 2 abajo, 3 izquierda. Paso de 100 ms simulados; como máximo una casilla por actor. Acción ilegal deja al jugador inmóvil. Interpolación visual sin efecto sobre reglas.
- Tres vidas. Píldoras 10 puntos, poderes 50; capturas durante un poder 200/400/800/1600. Poder dura 60 pasos; otro poder reinicia duración y cadena.
- Ciclo enemigo repetido: dispersión 70 pasos y persecución 200. Dispersión apunta a una esquina distinta por guardián. Persecución: 1 al jugador; 2 dos casillas por delante; 3 al reflejo del guardián 1 respecto de esa casilla adelantada; 4 al jugador si distancia Manhattan >6, a su esquina en otro caso. Objetivo fuera del mapa se permite solo como coordenada para comparar distancias.
- Movimiento enemigo minimiza distancia Manhattan desde candidatos al objetivo; desempate arriba/izquierda/abajo/derecha. Sin inversión salvo callejón sin salida o cambio persecución/dispersión. Vulnerable elige movimiento legal mediante PRNG sembrado. Capturado queda inactivo 20 pasos y reaparece en su inicio sin colisionar ese paso.
- Orden: mover jugador, recoger/aplicar poder, mover enemigos, colisiones, final, temporizadores. Colisión por casilla compartida o cruce de casillas. Mortalidad prevalece sobre capturas simultáneas; capturas por id; máximo una vida perdida por paso.
- Muerte conserva puntos/objetos y reinicia posiciones, direcciones, poder y fase. No hay vidas adicionales. Final: perder tres vidas, limpiar todos los objetos o límite 3000 pasos, con esa prioridad si coinciden. No se pasa a otro nivel.

## Aprendizaje propuesto
DQN con 36 entradas, capa de 64 ReLU y cuatro salidas lineales. Observación ordenada: posición jugador (2), posición/actividad/vulnerabilidad de cuatro enemigos (16), dirección one-hot (4), legalidad de acciones (4), desplazamiento al objeto normal más cercano (2), al poder más cercano (2), vidas, tiempo de poder, fase, tiempo de fase, fracción de objetos pendientes y pasos restantes (6). Cercanía por camino, desempate fila/columna; inexistente produce desplazamiento cero. Coordenadas normalizadas por dimensiones, desplazamientos a [-1,1], contadores por máximos; fase 0 dispersión/1 persecución. Inactivo conserva posición inicial y actividad cero.
Recompensa: incremento de puntuación/100, -0,01 por paso, -5 por vida perdida, +10 por ganar; ninguna bonificación por límite. Descuento 0,99. Epsilon 1 a 0,1 lineal en 100000 pasos, después 0,1. Acciones ilegales excluidas cuando hay alternativas legales. Replay circular 10000 transiciones en arrays tipados, lote 32, actualización cada cuatro pasos tras 1000 transiciones, red objetivo cada 1000 actualizaciones, SGD 0,001, pérdida Huber y gradiente limitado a norma 10. Terminales sin valor futuro. No se sustituye la red por rutas programadas.
Checkpoint guarda redes, replay, partida, configuración, PRNG, contadores y tiempo activo. Guardado entre lotes cada cinco minutos y al pausar/finalizar, mediante archivo temporal y reemplazo. Reanudar conserva progreso. Política exportada solo contiene inferencia/metadatos. Validar versiones, dimensiones, números finitos y compatibilidad mapa/reglas. Política máximo 2 MiB; checkpoint máximo 128 MiB antes de parsear. Error conserva último archivo válido cuando sea posible y se explica; no se promete caber en 4 GB totales.
Evaluación: política inicial guardada antes de entrenar, política posterior y jugador aleatorio uniforme legal; 30 semillas comunes 1001–1030, límite idéntico, sin entrenamiento ni exploración. Exportar por episodio puntos/victorias/vidas perdidas/pasos y agregados media, mediana y desviación poblacional. Mejora no es criterio obligatorio.

## Contrato entre líneas
Motor posee src/game/contracts.ts: Action, GameState y eventos. GameState serializable incluye versiones, PRNG/semilla, tick, posiciones/direcciones/actividad, objetos, puntos, vidas, fase/temporizadores, poder/cadena y final running/won/lost/timeout. createGame(seed), legalActions(state), step(state,action) y observe(state) son puros; step devuelve estado nuevo/eventos y nunca muta la entrada. observe devuelve las 36 entradas anteriores.
Aprendizaje posee PolicyV1 e inferencia compartida Node/navegador: schemaVersion=1, rulesVersion, mapVersion, arquitectura 36/64/4, arrays de pesos/sesgos con orden documentado, metadatos. chooseAction(policy,observation,legalActions) no modifica pesos y desempata por id menor. Sin imports Node en inferencia.
Motor posee configuración raíz; aprendizaje entrenador/inferencia; interfaz web/documentación. Las líneas se construyen con fixtures del contrato; cambios compartidos se coordinan con su propietaria antes de implementar. No se duplican reglas.
Scripts: npm run dev, npm run build, npm test, npm run test:e2e. Entrenar: npm run train -- --seed 42 --budget-seconds 21600 --output runs/experimento. Pausar: Ctrl+C con guardado. Reanudar: npm run train -- --resume runs/experimento/checkpoint.json. Evaluar: npm run evaluate -- --initial runs/experimento/initial-policy.json --policy runs/experimento/policy.json --output runs/experimento/evaluation.json. Reanudación aplica presupuesto activo acumulado, no otras seis horas.
Salidas locales initial-policy.json, policy.json, checkpoint.json, evaluation.json; carpeta runs ignorada por Git. Interfaz importa únicamente PolicyV1. Motor controla tiempo simulado, entrenador tiempo activo, Phaser presentación. No se requieren secretos, red ni backend para entrenar.

# Línea: motor
## Objetivo
Motor puro determinista y configuración técnica.
Alcance: `src/game/`, `tests/game/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `.gitignore`
## Criterios de aceptación
- M-1: mapa original conectado, objetos/inicios válidos y movimiento legal/ilegal conforme a reglas. Pruebas de conectividad, bordes, inicialización, no mutación y repetibilidad de semillas.
- M-2: objetivos, ciclos, desempates, inversión, vulnerabilidad y reaparición cumplen reglas. Tests de estados controlados y fronteras exactas de temporizadores.
- M-3: puntuación/cadena, colisiones compartidas/cruzadas, mortalidad simultánea, muerte/reinicio y finales cumplen orden/prioridad. Tests de última vida, limpieza y paso 3000.
- M-4: observación de 36 entradas respeta orden/rangos/distancias y ausencia de objetos; serializar/restaurar conserva evolución exacta. Tests de fixtures y continuidad.
- M-5: dependencias respetan C-7 y scripts del contrato funcionan al integrar. .gitignore excluye dependencias, build, runs y resultados, no arte original. Evidencia real de instalación, pruebas y build; sin editar .github/.
## Verificación
Vitest, TDD rojo/verde por criterio; build con líneas integradas.
## Exclusiones
Red, entrenamiento, renderizado, README.md, publicación y configuración del repositorio.

# Línea: aprendizaje
## Objetivo
Entrenamiento CPU, conservación y evaluación reproducible de una red real.
Alcance: `src/learning/`, `scripts/`, `tests/learning/`
## Criterios de aceptación
- A-1: red, selección legal, recompensa, replay y actualización DQN cumplen propuesta. Tests numéricos de forward/gradientes/pérdida, terminales y descarte circular; entrenamiento fixture demuestra cambio real de pesos, sin exigir mejora en el juego.
- A-2: CLI sin Phaser/navegador acepta semilla/presupuesto/salida, registra tiempo/pasos/parada, respeta presupuesto acumulado y Ctrl+C guarda. Tests con reloj inyectado y ejecución real breve.
- A-3: guardado/restauración/versiones y validación funcionan. Test de ejecución continua frente a interrumpida con misma secuencia/pesos; archivos corruptos/incompatibles/no finitos se rechazan y no reemplazan último válido.
- A-4: tres referencias sobre las 30 semillas exportan resultados/estadísticas recalculables sin cambiar pesos ni explorar. Tests de agregación y evidencia de evaluación completa, aunque no haya mejora.
- A-5: cálculo explícito probado de arrays/replay ≤128 MiB, sin acumular episodios. Entrenamiento de humo real de 60 segundos registra duración, pasos/segundo y máximo RSS observado. Reporta que serialización/parseo tienen consumo adicional y que la sesión no certifica Windows 4 GB.
## Verificación
Vitest de operaciones/continuidad y CLI real con comandos, salida y código de retorno. Política exportada compatible con fixture del navegador.
## Exclusiones
GPU, Python, backend, entrenamiento remoto, seis horas en la sesión, estrategias sustitutas y garantía de mejora.

# Línea: interfaz
## Objetivo
Ver jugar a una política importada y documentar el experimento en Windows.
Alcance: `src/main.ts`, `src/scenes/`, `src/ui/`, `src/style.css`, `index.html`, `public/assets/`, `tests/browser/`, `playwright.config.ts`, `README.md`
## Criterios de aceptación
- I-1: HTTP, cinco escenas de C-3, 1600×900/FIT/pixelArt. Boot carga; Base dibuja; UI muestra; Launch importa/inicia; Result resume final. this.anims para sprites, tweens para movimiento/progreso y this.time para ritmo. Arte propio con inventario archivo/autor/procedencia/uso. Prueba Chromium, captura y revisión de inventario.
- I-2: PolicyV1 válida juega mediante inferencia/motor compartidos, sin aprender ni explorar. Muestra puntos, vidas, fase, poder y pasos; semilla, reinicio, pausa/reanudación y velocidades 1×/4×. Tests de fixture comparan trayectoria con motor puro; velocidad/pausa no alteran la evolución simulada.
- I-3: archivos inválidos dan mensaje español sin iniciar ni bloquear; iniciar deshabilitado sin política válida. Tests válida/corrupta/incompatible y final. No presentar jugador programado como red entrenada.
- I-4: README con Node 22 y comandos aplicables a Windows para instalar, dev HTTP, build/tests, entrenar seis horas, Ctrl+C/reanudar, evaluar e importar. Explica archivos, métricas, límites y falta de garantía; describe medición local de tiempo, pasos/segundo y memoria del proceso. Marca ejecución/rendimiento Windows como pendiente, no verificado por Chromium de la sesión.
## Verificación
Playwright Chromium, capturas y build; fixtures claramente identificados, sin inventar entrenamiento.
## Exclusiones
Juego manual, audio, niveles extra, hosting, telemetría, modificación de pesos en UI y configuración del repositorio.

## Integración, evidencia y entrega
Ejecutar npm test, npm run build, npm run test:e2e, entrenamiento de humo, pausa/reanudación y evaluación de 30 semillas. PR con enlace al issue y evidencia real rojo/verde por criterio y comandos. No inventar entrenamiento de seis horas, mediciones Windows ni aprobación. Si requiere salir del alcance, parar y consultar; nunca modificar .github/, Foundry ni configuración de GitHub.

## Supuestos y pendientes
CPU y navegador Windows desconocidos; velocidad y memoria total no medidas. Solo se verifica Node 22/Chromium disponibles en la sesión. Presupuesto temporal no garantiza convergencia, pastoreo, maniobras al píxel ni sacrificios aprendidos. Nivel 256, fallo original, múltiples laberintos/niveles, publicación y servicios fuera de alcance. Identidad/mapa/arte no copian Pac-Man.

## Qué aprueba la persona
Reglas y propuesta DQN, tres líneas con sus alcances, contrato, presupuesto acumulado de seis horas, evaluación aunque no mejore y limitaciones de verificación en Windows. Confirmar discovery no equivale a aprobar esta spec.