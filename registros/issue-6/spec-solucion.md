---
id: "issue-6/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec completa revisada: separar la verificación pendiente del lanzamiento"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "f2920fe9fff7e63c067532258c72c8317f63762e", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 158368, "tokens_salida": 9849, "monto_ia": 0.200065, "minutos_computo": 0, "monto_computo": 0.0}
---
# Spec: issue-6 — Nivel 1: Despegue

## Cerebro consultado
Consultadas las decisiones vigentes C-2, C-3, C-4, C-5, C-7 y C-8 suministradas por Core. Se leyeron la spec aprobada-original, aprobada-2 y aprobada-3; las dos últimas son adendas y esta revisión las integra en un documento completo. Se consultaron el inventario actual, package.json, src/game/scenes.ts, tests/e2e/p10b-report.md y el PR #7, commit d4ce82e583dc7729fd061536adf2b8ef7fef6e6e. Las reglas siguen siendo puras; las cinco escenas, ejecución HTTP local, arte original y versiones aprobadas se mantienen. C-8 no se modifica: esta revisión no incorpora ni altera entrenamiento neuronal o políticas. El repositorio fue greenfield confirmado al iniciar; ahora existe el juego y se conserva su implementación, sin migración.

## Solución
Preparación de una misión espacial para jugadores casuales de 13 años en adelante. Toda la base es visible, las decisiones muestran consecuencias y el despegue recompensa una buena preparación. Se puede fallar al omitir reparaciones, elegir mal el ángulo, lanzar con clima desfavorable o perder la ventana. Nunca hay azar.

Un único nivel completo, nueve salas, cuatro fases orientativas, ocho objetivos, seis recursos, diseño y trayectoria, dos reparaciones, carga, ángulo, pronóstico y espera, verificaciones, lanzamiento con animación, resultado con causas y puntaje, reinicio, gráficos originales, tests y documentación. La verificación pendiente del lanzamiento se entrega como componente separado, sin cambiar el juego ni dar por aprobadas imágenes pendientes.

## Cambios respecto de la spec aprobada
- La persona autorizó el 15 de noviembre, comentarios #193 y #198 del issue #6, separar las comprobaciones y crear una línea adicional. El comentario #201 pide retomar, no constituye aprobación de esta versión.
- Se agrega la línea verificacion-lanzamiento para completar J5/J6: primero humo, llama y ascenso exitoso; después resultado y reinicio exitosos; después intento fallido y su resultado/reinicio, subdivididos en su propio plan si hace falta. Los requisitos y duraciones existentes no cambian.
- La línea nueva es dueña exclusiva de tests/e2e/launch-verification/. Esa carpeta está dentro del alcance ya aprobado tests/e2e/; no se amplía la superficie autorizada. Juego conserva sus archivos y evidencias anteriores y no escribe en esa subcarpeta. No se mueven ni borran los archivos existentes.
- Se conservan las diez comprobaciones completadas y su evidencia registrada por Core. Lo pendiente se asigna a la línea nueva; no se declara completado ni se elimina. La ejecución parcial de despegue exitoso del commit vigente es antecedente, no verificación independiente aprobada.
- Se integran aquí íntegramente las reglas, contratos, criterios y revisiones de dependencias que antes estaban en adendas. No se cambian balance, versiones, exigencia de auditoría, exclusiones ni requisitos de evidencia. No hay decisiones nuevas para el cerebro.
- Core calcula el presupuesto de la revisión. No se presume que crear una línea adicional sea gratuito ni que aumente por sí solo el presupuesto autorizado. La persona aprueba los cambios y el presupuesto que presente Core; la construcción continúa en foundry/issue-6 y se conserva el PR #7.

## Decisiones para el cerebro
Ninguna.

## Riesgo declarado
Nivel: medium
Motivo: juego web local y estático sin backend, cuentas, datos personales ni despliegue; la revisión reorganiza pruebas y evidencia dentro del alcance aprobado. No afecta producción ni configuración del repositorio.

## Presupuesto
Línea reglas: 0 criterios · USD 0.00
Línea graficos: 0 criterios · USD 0.00
Línea juego: 0 criterios · USD 0.00
Línea verificacion-lanzamiento: 0 criterios · USD 0.00
Auditoría: 4 auditores · USD 2.00
Estimado: USD 2.00 (±30%: entre USD 1.40 y USD 2.60)
Total de construcción: USD 2.60

## Exclusiones comunes
Niveles posteriores, física orbital realista, reprogramación, probabilidad de fallo, backend, cuentas, multijugador, despliegue, configuración de repositorio y cambios en .github/ o Foundry. No se incluye guardado, soporte móvil garantizado ni audio. No se usarán recursos gráficos de terceros ni se presentará la imagen adjunta como inspeccionada: la referencia aprobada es su descripción textual. Esta revisión no solicita funcionalidades neuronales ni modifica C-8.

## Balance y reglas comunes
### Estado inicial
Día 1, 08:30, presupuesto $1.000.000, combustible disponible 120.000 L, oxígeno 30.000 L, agua 10.000 L, alimentos 2.000 kg, repuestos 50 u. Nave no diseñada, trayectoria no calculada, clima no consultado, carga no realizada, ángulo inicial 72° sin confirmar, verificaciones no realizadas; bomba al 76 % y antena al 68 %. Sin tareas en curso y sin resultado.

### Reloj y acciones
Los minutos se guardan como enteros desde medianoche, inicio 510. Explorar, abrir/cerrar paneles, leer pronóstico, seleccionar un perfil o modificar un ángulo provisional no avanza el reloj. Cada acción muestra duración, costo y cambios previstos antes de confirmarse. Solo una acción puede estar en curso. Una confirmación válida produce exactamente una transición al terminar su animación; dobles clics no duplican costos ni minutos. Una acción rechazada no cambia nada y explica su causa. Los recursos nunca quedan negativos. No se permite cancelar una tarea ya confirmada. Esperar ofrece 5, 10 o 20 minutos, sin costo material.

La ventana incluye 10:00 y 11:00. Antes de 10:00 el lanzamiento se bloquea por horario; después de 11:00 la siguiente transición de tiempo produce inmediatamente fallo por tiempo. El reloj se evalúa al completar acciones; su animación no consume minutos extra. Las tareas que sobrepasarán las 11:00 muestran esa advertencia, pero pueden confirmarse y perder la partida. Una partida terminada no admite más acciones, salvo reiniciar.

### Acciones y costos
- Confirmar diseño: 10 min; tres perfiles cerrados descritos abajo. Se puede rediseñar antes de cargar, pagando de nuevo; invalida trayectoria. No se cambia el diseño después de la carga.
- Calcular trayectoria: 10 min, $20.000; requiere diseño. Recalcular una trayectoria ya válida no cobra ni consume tiempo: informa que ya está calculada.
- Consultar clima por primera vez: 5 min, $0; marca el objetivo. El pronóstico se puede releer sin costo. No es un bloqueo del lanzamiento.
- Reparar bomba: 20 min, $60.000 y 10 repuestos; pasa de 76 a 100 %.
- Reparar antena: 20 min, $40.000 y 5 repuestos; pasa de 68 a 100 %.
- Cargar: $30.000 y transferencia de 100.000 L del almacén a la nave, más 6.000 L O₂, 2.000 L agua y 400 kg alimentos. Estos consumibles quedan registrados a bordo, no desaparecen. Duración 30 min con bomba reparada o 40 min sin reparar. Requiere diseño y trayectoria válida. Se puede cargar con bomba averiada para permitir ese fallo. No se repite la carga.
- Confirmar ángulo: 5 min, $0; entero entre 45 y 90 inclusive; confirma también el 72 inicial. Puede repetirse con otro valor, pagando tiempo; reconfirmar el mismo valor ya confirmado es una operación sin cambios. Los botones −/+ solo editan un borrador hasta confirmar.
- Verificar Sistemas Críticos: 10 min, $10.000; requiere diseño, trayectoria y carga, pero no reparaciones, clima ni ángulo confirmado. Registra verificaciones realizadas y muestra riesgos actuales. Puede repetirse pagando otra vez.
- Lanzar: 0 min de reloj de preparación, $0; solo dentro de ventana y sin bloqueos físicos. Consume de la carga el combustible estimado hasta un máximo de lo disponible; congela las métricas de preparación para el puntaje. El tiempo a órbita es estimativo, no reduce el tiempo sobrante usado en el puntaje.

Acciones únicas ya realizadas (reparación y consulta inicial) se muestran completadas, sin volver a cobrarse. Las acciones de planificación y reparación pueden intercalarse; las fases no son barreras que impidan lanzar sin verificaciones.

### Perfiles y fórmulas
Perfiles seleccionables, sin sliders físicos no especificados:
| Perfil | Costo diseño | Masa | Potencia | Resistencia | Estado Nave | Base combustible | Base órbita |
|---|---|---|---|---|---|---|---|
| Equilibrada | $200.000 | 86 % | 80 % | 85 % | 86 % | 92.000 L | 8 min |
| Potente | $260.000 | 92 % | 90 % | 85 % | 88 % | 98.000 L | 7 min |
| Reforzada | $240.000 | 90 % | 80 % | 95 % | 92 % | 96.000 L | 9 min |

Para d = abs(ángulo confirmado − 72), consumo = base combustible + 1.000 × d L y tiempo a órbita = base órbita + 0,1 × d min, mostrado con un decimal. Antes de confirmar se presenta la previsualización con el borrador, claramente identificada; las reglas de lanzamiento usan el valor confirmado (72 inicial si nunca se confirmó). La comparación muestra correcto para 70–74 inclusive. Si la estimación supera los 100.000 L a bordo, se añade riesgo de combustible insuficiente, no un nuevo bloqueo: existe carga, pero no basta para esa trayectoria. Estos valores son mecánica de juego, no simulación física.

Estado General: Nave empieza en 86 % y luego toma el valor del perfil; Sistemas = 90 + 5 por cada reparación completada; Recursos = redondeo del promedio de las cinco fracciones de inventario restante frente al inicial (combustible, oxígeno, agua, alimentos y repuestos), por 100. El presupuesto se muestra por separado. La barra Recursos representa inventario restante, no aptitud de lanzamiento. Sistemas Críticos: Propulsión depende de bomba reparada; Comunicación de antena reparada; Energía está OK; Soporte vital de carga realizada; Navegación de trayectoria válida. Estos indicadores se actualizan con el estado; las verificaciones añaden la revisión formal y el aviso, no ocultan datos ya visibles.

### Pronóstico determinista
Desde 08:30 hasta antes de 10:00: viento 12 km/h, lluvia 0 %, nubosidad 18 %. Desde 10:00 hasta antes de 10:40: 20 km/h, 0 %, 25 %. Desde 10:40 hasta las 11:00 inclusive: 45 km/h, 0 %, 40 %. Desfavorable si viento >40 o lluvia >30; nubosidad es informativa. Meteorología muestra toda la tabla con horarios y condiciones actuales. Esperar no genera clima aleatorio. Hay 40 minutos de ventana meteorológica favorable.

### Bloqueos, riesgos, aviso y resultado
Bloqueos físicos: diseño ausente, trayectoria ausente o invalidada, carga ausente. Se añaden restricciones de disponibilidad de la acción: antes de 10:00, tarea en curso o partida terminada. El control de lanzamiento refleja todas las razones y no tiene un manejador capaz de saltárselas; su panel de motivos sigue siendo accesible aunque el botón esté deshabilitado.

Riesgos que no deshabilitan lanzar: ángulo fuera de 70–74, bomba sin reparar, antena sin reparar, clima desfavorable y combustible estimado mayor al embarcado. No consultar clima, no confirmar el ángulo inicial correcto o no verificar NO son riesgos por sí solos. Con riesgos el resultado es siempre fallo, con todas sus causas, no solo la primera. Sin riesgos y dentro de ventana es siempre éxito.

Si se realizaron verificaciones y hay riesgos actuales, el primer clic abre en la misma pantalla un aviso con la lista calculada en ese momento y botones Cancelar / Lanzar de todos modos. Cancelar no modifica estado. Confirmar revalida estado y lanza; el aviso y su confirmación se invalidan si cambia el estado. Con verificaciones omitidas no existe esta confirmación adicional: se lanza directamente aunque haya riesgos. Si no hay riesgos, lanzar es directo en ambos casos. La pantalla de resultados siempre explica el diagnóstico.

Causas: desvío indicando ángulo y recomendado; eficiencia de bomba 76 %; pérdida de comunicación con señal 68 %; clima con viento/lluvia y hora; combustible requerido y disponible; ventana perdida con hora final. Éxito muestra misión completada. No hay excepción aleatoria.

### Objetivos y fases
Checklist: diseño confirmado; trayectoria válida; clima consultado; reparaciones con 0/2, 1/2 o 2/2; carga; ángulo confirmado; verificaciones realizadas; despegue ejecutado. El último se marca cuando empieza cualquier lanzamiento, incluso fallido, distinguiendo ejecución de éxito. Las fases son una guía basada en objetivos: Planificación mientras falte cualquiera de sus tres objetivos; Preparación una vez completos y mientras falten reparaciones/carga/ángulo; Verificaciones una vez completos los anteriores y mientras falte revisión; Lanzamiento tras revisión completa o al iniciar cualquier despegue. El stepper marca completada una fase solo si sus objetivos realmente se cumplieron. Puede haber éxito con checklist incompleto, porque los bloqueos y riesgos, y no la fase, determinan el resultado; esto implementa la precisión final de la persona.

### Puntaje
Conservar una instantánea antes del lanzamiento o al fallo por tiempo. Mostrar siempre resultado, hora, presupuesto/repuestos restantes, cuatro componentes y total entero 0–1.000:
- Presupuesto: floor(400 × presupuesto restante / 1.000.000).
- Repuestos: floor(200 × repuestos restantes / 50).
- Tiempo: floor(250 × clamp((660 − hora de preparación) / 60, 0, 1)).
- Precisión: round(150 × clamp(1 − abs(ángulo − 72) / 18, 0, 1)).
En éxito, sumar los cuatro componentes. En cualquier fallo mostrar los mismos componentes como diagnóstico y total final 0, con explicación de que una misión fallida no obtiene puntaje. El resultado y los componentes permiten distinguir preparaciones; no se presenta un fallo ahorrando reparaciones como una victoria de alto puntaje. Reiniciar restaura exactamente el estado inicial y elimina avisos, tareas y animaciones pendientes.

### Secuencias de referencia que deberán pasar tests
Son cálculos de la spec, no nueva evidencia ejecutada:
1. Ganadora: Equilibrada (08:40), trayectoria (08:50), clima (08:55), bomba (09:15), antena (09:35), carga (10:05), confirmar 72° (10:10), verificar (10:20), lanzar. Quedan $640.000 y 35 repuestos; combustible en almacén 20.000 y a bordo 100.000 antes del lanzamiento, 8.000 después. Puntaje: 256 presupuesto + 140 repuestos + 166 tiempo + 150 precisión = 712. Margen 20 min hasta el clima desfavorable y 40 hasta fin de ventana.
2. Ángulo: misma secuencia con 80°; termina 10:20, consumo 100.000, único riesgo ángulo. Con verificaciones muestra aviso; tras confirmar falla y explica 80° frente a 72°.
3. Bomba: diseño, trayectoria, clima, antena, carga sin reparar (40 min), 72°, verificar; termina 10:10. Confirmar aviso y fallar por bomba al 76 %; sin riesgo de antena ni combustible.
4. Antena: diseño, trayectoria, clima, bomba, carga, 72°, verificar; termina 10:00. Confirmar aviso y fallar por antena al 68 %.
5. Clima: secuencia ganadora y Esperar 20; a 10:40 confirmar aviso y fallar por viento 45, con reparaciones y ángulo correctos.
6. Tiempo: secuencia ganadora y tres esperas de 20; a 11:20 termina automáticamente por ventana, sin iniciar despegue.
7. Verificaciones omitidas: repetir secuencia de antena omitiendo verificación (09:50), esperar 10; lanzar a 10:00 directamente, sin aviso, y fallar por antena. También comprobar éxito sin revisión cuando no hay riesgos, con la ganadora omitiendo revisión (10:10).
8. Más de un riesgo: ángulo 90° con antena sin reparar; resultado enumera desvío, comunicación y combustible insuficiente, sin elegir una causa aleatoria.
9. Orden: cargar antes de reparar bomba añade 10 minutos; reparar después permite ganar pero reduce el margen. No hay ejecución paralela que elimine ese costo.

## Contrato entre líneas
Contrato completo incluido en esta spec, identificado como issue-6/contrato. Reglas y gráficos pueden construirse y auditarse en paralelo; juego integra ambos una vez disponibles. Juego es propietario del manifiesto de dependencias, lockfile e infraestructura de navegador. La línea verificacion-lanzamiento consume la integración existente y no modifica reglas, gráficos ni código productivo. Su carpeta exclusiva es tests/e2e/launch-verification/, reservada dentro del alcance previo de juego; juego no escribe allí aunque su alcance general incluya el directorio padre. Los demás archivos de tests/e2e/ siguen siendo de juego. No hay dos propietarios de un archivo.

### API reglas v1
Entrada pública src/rules/index.ts; todos los tipos exportados allí. GameState serializable contiene reloj entero, inventario y carga a bordo, perfil, trayectoria vigente, consulta climática, reparaciones, ángulo confirmado, bandera de ángulo confirmado, verificaciones, objetivos/fase derivados y resultado opcional. Identificadores cerrados: perfiles balanced/power/reinforced; acciones design(profile), trajectory, weather, repair(pump|antenna), load, angle(integer), verify, wait(5|10|20), launch.

Exportaciones contractuales:
- createInitialState(): GameState.
- previewAction(state, action): ActionPreview, con allowed, durationMinutes, budgetCost, inventoryCosts, effects y reasons (lista de códigos y textos españoles); no modifica estado.
- applyAction(state, action): ActionResult discriminado: {ok:true,state} o {ok:false,state,reasons}; estado original inalterado y sin cambios en rechazo. Aplicación representa el final de una acción ya animada por el juego.
- getView(state, draftAngle?): GameView: recursos y carga, objetivos/fase, estado general, sistemas, pronóstico actual/completo, estimaciones, bloqueos y riesgos; no muta estado.
- evaluateLaunch(state): LaunchEvaluation con blockedReasons, risks y outcome (blocked|success|failure); no inicia despegue.
- getScore(state): ScoreBreakdown con cuatro componentes, total y métricas; para resultado usa la instantánea congelada.
Códigos de riesgos estables: angle, pump, antenna, weather, fuel. Razones de bloqueo separadas de riesgos. Las firmas y semántica son el contrato; detalles internos adicionales no lo alteran. Las reglas no conocen temporizadores, DOM, Phaser, animaciones ni diálogos. El control de tarea en curso y confirmación del aviso pertenece al juego.

### Assets v1
public/assets/manifest.json versión 1 enumera claves, rutas relativas, tamaño y metadatos de frames. Claves mínimas: base-rooms (nueve fondos diferenciados con mapa de recortes), rocket, tower, terrain, technician, astronaut, smoke, flame, resource-icons. technician/astronaut tienen al menos dos frames idle y dos work; smoke/flame al menos tres frames. Atlas o spritesheets PNG sin suavizado. docs/assets.md documenta dimensiones, recortes, autoría original y herramienta/procedimiento. El juego carga el manifiesto en BootScene; no adivina coordenadas de sprites ni modifica los assets. Títulos y textos los dibuja la UI, no se incrustan como texto ilegible en imágenes.

### Contrato de verificación del lanzamiento
Entrada: el juego real integrado servido por HTTP con la infraestructura aprobada y la evidencia histórica del PR #7, sin alterar el commit que se está comprobando. Salida: tests de navegador, mediciones, capturas y reporte independiente en tests/e2e/launch-verification/. El reporte identifica commit, viewport, criterio J5/J6, comando, salida real, imágenes efectivamente inspeccionadas y límites de lo no comprobado. Una medición de frames o un test verde no sustituye inspección visual. La carpeta nueva no necesita cambiar configuración ni dependencias: se usa la infraestructura Playwright existente. Si no descubre automáticamente los tests, coordina con juego; no modifica su configuración.

### Consolidación
Cada línea entrega su PR hacia foundry/issue-6 con pruebas y evidencia por criterio, según la organización que haga Core para la continuación del PR #7. No se toca .github/. La integración final ejecuta todas las pruebas con las piezas y no usa mocks como evidencia de comportamiento real. Un cambio a este contrato, tecnología o alcance se detiene para decisión humana; no se reinterpreta silenciosamente. Las diez comprobaciones ya completas no se repiten como construcción ni se borran del historial. La nueva línea tiene su propio plan de hasta 12 pasos; el plan anterior debe dejar de asignar las verificaciones transferidas como trabajo pendiente, sin borrar pasos completos. La verificación final y las auditorías siguen siendo obligatorias.

# Línea: reglas

## Resultado
Implementar las reglas y API v1 puras, tipadas y deterministas. No crear escenas ni dependencias de Phaser. Pruebas Vitest consumidas por la infraestructura de la línea juego.

## Criterios de aceptación
R1. Estado inicial y reinicio exactos; transiciones inmutables, sin negativos ni doble consumo de acciones únicas. Tests de cada inventario, costos, insuficiencia de presupuesto/repuestos/consumibles con estados de prueba y rechazos sin mutación.
R2. Costos, duraciones, perfiles, invalidación por rediseño, carga antes/después de bomba y fórmulas coinciden con tablas. Tests de todos los perfiles y límites 45, 70, 72, 74 y 90; rechazo de no enteros y fuera de rango. Trayectoria/carga no pueden omitir sus prerrequisitos.
R3. Tiempo/ventana/pronóstico deterministas. Tests 09:59, 10:00, 10:39, 10:40, 11:00 y 11:01; apertura/consulta de vista no cambia reloj; fallo terminal por sobrepasar ventana; lluvia >30 y viento >40 para la función de condición climática.
R4. Checklist, fases, barras y sistemas derivan del estado, sin bloquear decisiones arriesgadas por fase. Tests de reparaciones 0/2 a 2/2, invalidación de trayectoria y éxito con verificaciones omitidas.
R5. Bloqueos/riesgos/resultados y puntaje implementan todas las secuencias de referencia, incluyendo cada riesgo por separado, riesgos simultáneos, avisos sustentados en evaluación actual y total 0 en fallos. Tests completos de secuencias y puntaje ganador 712, redondeos y reinicio tras cada terminación.

## Pruebas
TDD: aplica
TDD por criterio: evidencia real de pruebas en rojo antes de implementación y verde después. El probador vuelve a ejecutar de forma independiente. No se afirma haber ejecutado pruebas en esta revisión. La línea no escribe package.json ni configura Vitest; si necesita infraestructura adicional fuera de su alcance, coordina mediante el contrato con juego, no la modifica. Se conserva toda la evidencia previa calculada por Core.

## Alcance
Alcance: `src/rules/`, `tests/rules/`

## Exclusiones
- Escenas, DOM, temporizadores, dependencias e infraestructura de juego.

## Dependencias
- Infraestructura Vitest de juego y API reglas v1 de esta spec.

# Línea: graficos

## Resultado
Crear arte original y recursos listos para Phaser. Generador opcional reproducible en Node.js, sin descargas de terceros ni dependencia ajena al manifiesto aprobado. No generar archivos fuera del alcance.

## Criterios de aceptación
A1. Manifiesto v1 y todas las claves contractuales existen, archivos PNG decodificables, tamaños/frames válidos y sin rutas externas. Pruebas automatizadas validan manifiesto, archivos y límites de recortes.
A2. Nueve salas identificables: Diseño, Control, Meteorología, Ingeniería, Combustible, Sistemas, Almacén, Pasillo/esclusa y Observación; cohete blanco/naranja, torre roja, reflectores y montañas. Pixel art con paleta azul marino/gris y acentos cian/naranja/amarillo/verde, bordes sin suavizado.
A3. Spritesheets animables de técnico, astronauta, humo y llama con frames exigidos. Inventario de autoría y procedimiento, sin assets con copyright de terceros. La documentación no afirma haber visto el mockup.
A4. Inspección visual en navegador a escala de juego confirma que no hay recursos ausentes, recortes rotos ni personajes invisibles. Validación automatizada de archivos no sustituye esa inspección, que se hace con integración de juego.

## Pruebas
TDD: aplica
TDD para contrato del manifiesto y geometría de frames; inspección visual con evidencia real de integración para estética y legibilidad. No se exige fingir prueba en rojo de un juicio estético. Los ajustes visuales quedan dentro de este alcance; cambios del contrato requieren decisión. La inspección integrada utiliza 1600×900 y 1280×720, sin recursos ausentes, recortes rotos ni personajes invisibles.

## Alcance
Alcance: `public/assets/`, `docs/assets.md`, `scripts/assets/`, `tests/assets/`

## Exclusiones
- Código del juego, reglas e infraestructura de dependencias.

## Dependencias
- Contrato Assets v1; juego integrado para A4.

# Línea: juego

## Resultado
Integrar reglas y assets en un juego completo. Versiones exactas para package.json sin rangos: phaser 3.90.0, vite 6.4.6, vitest 4.1.12, typescript 5.7.3, @playwright/test 1.65.0. Node.js 22. Generar package-lock.json mediante instalación real; se permite npx npm@11 install solo en la sesión aislada, y el lockfile resultante debe pasar una instalación limpia mediante npm ci con el npm incluido con Node.js 22. Verificar disponibilidad y compatibilidad; si una versión no está disponible o no es compatible, detenerse sin sustituirla silenciosamente. No se cambian dependencias en esta revisión.

Scripts: npm run dev, npm run build (comprobación TypeScript y Vite), npm run preview, npm test (Vitest en modo run, incluyendo reglas/assets/juego), npm run test:e2e (Playwright Chromium). Configurar base relativa para assets en build estático. Ningún workflow de GitHub ni hosting.

### Pantalla e interacción
HUD completo con título/subtítulo, fases, reloj, seis recursos con unidades y formato español, ocho objetivos y contador de reparaciones. Base 3×3 con nueve salas clicables y personal idle/trabajo; plataforma derecha; paneles inferiores de parámetros, reparaciones y Estado General. Tipografía monoespaciada del sistema, sin descargas externas. Ningún panel modal oculta permanentemente la información principal; puede cerrarse sin consumo de tiempo.

Diseño: elegir uno de tres perfiles y previsualizar estadísticas/costo. Control: trayectoria terrestre punteada y cálculo. Meteorología: condiciones y tabla de pronóstico. Ingeniería: ambas reparaciones con progreso. Combustible: inventario/carga y progreso. Sistemas: cinco checks y acción verificar. Almacén: inventario y carga a bordo. Pasillo y Observación: panel descriptivo sin acciones ni tiempo ficticio. Parámetros: −/+, rango, borrador/confirmación, tolerancia, consumo y tiempo estimado, ventana y Esperar. Motivos de bloqueos y errores concretos visibles.

Las acciones breves muestran confirmación con costo/duración. Reparación/carga reproducen progreso de 2 segundos reales, otras acciones pueden resolverse inmediatamente tras confirmación; estos segundos no equivalen a minutos de juego. Mientras hay progreso se deshabilitan acciones mutantes y se mantiene lectura de paneles. Usar tweens y this.time, nunca setInterval. Se puede explorar indefinidamente sin avance de reloj.

Lanzamiento exitoso: spritesheets de humo/llama y tween de ascenso, 6–8 segundos reales y resultado. Fallido: secuencia breve de intento/ascenso interrumpido de 3–5 segundos, señal visual de anomalía y resultado con todas las causas; no requiere explosiones ni animaciones violentas. Fallo por tiempo va directamente a resultado. ResultScene muestra éxito/fallo, causa, desglose y Reiniciar. Al reiniciar eliminar tareas/tweens y reconstruir estado; ninguna llamada tardía altera la nueva partida.

## Criterios de aceptación
J1. npm ci, npm test y npm run build terminan correctamente; npm run dev sirve por HTTP; npm run preview sirve el build y carga sus assets sin errores. Cinco escenas reales y reglas independientes de Phaser. Prueba del build en Chromium y revisión de manifiesto/versiones exactas.
J2. Pantalla completa y legible en escritorio 1600×900 y 1280×720, FIT sin recortar botones esenciales ni superponer paneles. Interacciones de las nueve salas con sus contenidos. Pruebas de navegador y capturas para revisión visual; móvil no obligatorio.
J3. Toda acción muestra costos/minutos, errores no mutan estado, explorar no avanza reloj, progreso no admite dobles confirmaciones y termina una sola vez. Pruebas de navegador de reparación/carga, actualización de recursos/checklist/sistemas y reloj estable durante lectura.
J4. Ángulo, perfiles, trayectoria y pronóstico usan getView, sin fórmulas duplicadas. Botón bloqueado solo por razones contractuales, riesgos no lo deshabilitan. Aviso de riesgos aparece solo con verificaciones realizadas, Cancelar no lanza ni gasta tiempo y confirmar revalida estado. Tests de todos estos caminos con el motor real.
J5. Pruebas de navegador ejecutan por controles reales la ganadora, cada riesgo primario (ángulo, bomba, antena, clima), combustible insuficiente, omisión de verificaciones, aviso cancelado y pérdida por tiempo. Verifican animación, causas, desglose y reinicio limpio. No reemplazar reglas por un stub para estas pruebas.
J6. Personajes, humo y llama usan this.anims; progreso/ascenso usa tweens; timers this.time; pixelArt/FIT correctos. Inspección real de animación y revisión de código. Consola del navegador sin errores no tratados ni recursos 404 durante partida y reinicio.
J7. README explica requisitos Node/npm, instalación con npm ci, dev/build/preview/tests, juego por HTTP, controles, bloqueos frente a riesgos, cuatro fases orientativas, pronóstico, fórmula de puntaje, inventario de arte y exclusiones. No promete despliegue ni duración real ya verificada.
D1. package.json fija las cinco versiones exactas indicadas; el lockfile coincide con las dependencias directas y se genera mediante instalación real. No hay Vitest 5 ni nuevas dependencias directas. Una prueba automatizada comprueba estas condiciones, con evidencia roja antes de actualizar y verde después.
D2. La resolución temporal con npm 11, si se usa, queda documentada con versión real, comando y resultado. Una instalación limpia del lockfile final pasa npm ci con el npm incluido con Node.js 22, registrando ambas versiones y salida real.
D3. Pasan npm test, npm run build y npm run test:e2e con Chromium compatible con @playwright/test 1.65.0, sin omitir ni debilitar pruebas. Se conservan las comprobaciones HTTP, visuales y funcionales de J1–J7 y la verificación independiente de la spec aprobada.
D4. Tras npm ci, npm audit --json devuelve código 0 y metadata.vulnerabilities total 0, con cero en cada severidad. Se conserva la salida real y se contrasta con la evidencia disponible la corrección de GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8; si no se pueden verificar esas afirmaciones se informa y no se afirma su corrección.

## Pruebas
TDD: aplica
Constructor con TDD y probador independiente, máximo tres vueltas de corrección antes de bloquear si no queda en verde. Evidencia por criterio con comando, resultado real y, cuando corresponda, rojo/verde, capturas y revisión visual. Los tests e2e no sustituyen comprobar legibilidad ni comprobar la meta de 10–15 minutos jugando. Registrar duración observada de una partida humana de prueba si puede realizarse; si no, dejar la meta explícitamente pendiente de validación con la persona, sin inventar medición.

Verificación de dependencias conservada:
1. Comprobar disponibilidad y compatibilidad del conjunto exacto aprobado con Node.js 22 antes de cualquier actualización; no se actualiza nuevamente por esta reorganización.
2. Se permite resolver e instalar mediante npx npm@11 install únicamente en la sesión aislada de pruebas, para diagnosticar Cannot read properties of null (reading 'edgesOut') reproducido con npm 10.9.9. No se instala npm globalmente ni se cambia configuración del repositorio o del equipo de la persona. Registrar versión exacta de npm 11 y compatibilidad con Node.js 22 real.
3. El lockfile se regenera mediante instalación real y debe permitir npm ci con el npm incluido con Node.js 22, no npm 11 invocado por npx. Registrar Node/npm en cada fase y cambios transitivos reales.
4. Solo adaptaciones de configuración y pruebas necesarias para compatibilidad dentro del alcance existente, sin eliminar ni reducir comprobaciones. No se agregan dependencias directas, overrides ni exclusiones de auditoría para forzar el resultado.
5. Ejecutar npm ci, npm test, npm run build, npm run test:e2e y comprobaciones HTTP/visuales de J1–J7 con evidencia y verificación independiente.
6. npm audit --json debe terminar con código 0 y cero vulnerabilidades en todas las severidades, incluyendo desarrollo, sobre el árbol final instalado desde el lockfile. No basta producción ni omitir dependencias; no garantiza ausencia universal de vulnerabilidades.
7. Si npm 11 no puede usarse con Node.js 22, la instalación falla, una versión no existe o no es compatible, npm ci rechaza el lockfile, las pruebas fallan o persisten hallazgos que requieren otros cambios, detenerse para decisión humana. No se cambian versiones adicionales, alcance, presupuesto ni criterios silenciosamente; no se usa npm audit fix --force.

J5/J6 siguen siendo requisitos de la integración; las comprobaciones de lanzamiento pendientes se satisfacen con V1–V4 de la línea adicional, no por duplicar su construcción. No se recrea evidencia histórica: Core conserva rojo/verde y resultados por paso. Se corren todas las pruebas en el cierre.

## Alcance
Alcance: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/main.ts`, `src/game/`, `src/styles/`, `tests/game/`, `tests/e2e/`, `README.md`

## Exclusiones
- No modifica src/rules/, tests/rules/, gráficos ni Foundry.
- tests/e2e/launch-verification/ queda reservado exclusivamente a verificacion-lanzamiento; el alcance padre no autoriza a juego a escribir en esa carpeta.
- No hay nuevos requisitos funcionales ni cambio de balance, versiones o presupuesto decidido por el agente.

## Dependencias
- Reglas con API v1 y gráficos con Assets v1.
- Evidencia de verificacion-lanzamiento para cerrar las partes pendientes J5/J6.

# Línea: verificacion-lanzamiento

## Resultado
Completar la comprobación independiente pendiente de lanzamiento exitoso y fallido, resultado y reinicio del juego real existente. Entregar evidencia separada dentro del alcance ya autorizado, sin reabrir las diez comprobaciones terminadas ni modificar el juego.

## Criterios de aceptación
V1. Para J6, en 1600×900 y 1280×720, la secuencia ganadora por controles reales muestra humo y llama animados y ascenso visible, sin recursos ausentes ni superposición con textos o controles esenciales. Medir los 6–8 segundos reales hasta el resultado. Inspección visual independiente de una secuencia temporal identifica las imágenes efectivamente abiertas y confirma los cambios visibles; comprobar frames en código no sustituye esa inspección. El primer paso se limita a humo, llama y ascenso exitosos.
V2. Para J5/J6, en ambos tamaños, el resultado exitoso muestra misión completada, hora 10:20, presupuesto $640.000, 35 repuestos, 8.000 L a bordo y desglose 256+140+166+150=712. Texto, componentes y Reiniciar quedan completos, legibles y sin superposiciones. Reiniciar por el botón restaura exactamente el estado inicial y elimina tareas, avisos, efectos, timers y tweens de la partida anterior; se prueba que callbacks del lanzamiento anterior no alteran la partida nueva. La segunda comprobación se limita a resultado y reinicio exitosos.
V3. Para J5/J6, en ambos tamaños, una secuencia arriesgada contractual por controles reales ejecuta intento/ascenso interrumpido de 3–5 segundos, humo/llama y anomalía visible no violenta; el resultado presenta todas las causas de esa secuencia y total 0 con sus componentes diagnósticos. Inspeccionar secuencia temporal y resultado legibles sin recortes o superposiciones. Se mantienen las pruebas existentes de cada riesgo y riesgos múltiples: esta comprobación focal no las sustituye ni las elimina.
V4. Para J5/J6, en ambos tamaños, Reiniciar tras fallo restaura exactamente el estado inicial, sin efectos, tareas, avisos ni resultados tardíos del intento anterior. Durante éxito, fallo, resultados y reinicios no hay errores no tratados de navegador ni recursos 404. El probador reproduce e inspecciona de forma independiente V1–V4; el reporte permite trazar cada comprobación a J5/J6 y al commit real. Ninguna comprobación incompleta se declara verde por existir una captura o un informe del constructor.

## Pruebas
TDD: aplica
Pruebas Playwright con Chromium e integración real por HTTP, sin sustituir reglas, inyectar estados de victoria o acelerar timers para demostrar duraciones. Las regresiones del juego ya construido pueden empezar verdes; no se fabrica rojo. Si se encuentra un defecto se escribe primero la prueba que falla y se registra la evidencia real antes de cualquier corrección autorizada. El probador verifica independientemente con comandos, salidas, mediciones y capturas. La inspección estética no necesita un rojo ficticio.

Plan previsto: cuatro comprobaciones focales, una por V1–V4, de 1 a 3 criterios cada una. Se separan generación/medición e inspección si el límite de ejecución lo exige al planificar; el plan no supera 12 pasos. Antes de repetir todo un flujo se evalúa reutilizar capturas existentes trazables al commit vigente, sin confundirlas con reproducción independiente. El cierre corre todas las pruebas y conserva la evidencia previa de Core. No se reconstruyen resultados rojos/verdes históricos.

## Alcance
Alcance: `tests/e2e/launch-verification/`

## Exclusiones
- No modifica ni mueve los tests, capturas o informes existentes fuera de su carpeta.
- No modifica código productivo, recursos gráficos, reglas, dependencias, configuración de pruebas ni README.
- No incluye funciones nuevas, entrenamiento neuronal, hosting, móvil, audio ni cambios de balance.
- Un defecto que necesite otros archivos se reporta con prueba y evidencia; esta línea no autoriza su propia salida del alcance. Se detiene la comprobación afectada y se coordina la corrección con la línea propietaria y la decisión humana que corresponda.
- No aprueba la entrega ni sustituye las auditorías seguridad, código, UX y UI exigidas por Core.

## Dependencias
- Juego real integrado en foundry/issue-6, actualmente PR #7.
- Infraestructura Playwright y versiones aprobadas mantenidas por juego.
- API reglas v1 y Assets v1, solo lectura.
- Historial de las diez comprobaciones completas y evidencia parcial de P10b; la reproducción e inspección independientes siguen pendientes.

## Riesgos y pendientes comunes
Principal riesgo funcional: orientar mediante fases sin impedir fallos intencionales; se conserva la solución con reglas explícitas y tests de omisión. Principal riesgo visual: densidad de 1600×900; se comprueba a dos tamaños de escritorio. La meta de duración real de 10–15 minutos y la referencia de imagen no inspeccionada se mantienen identificadas. En esta ejecución no se corrieron pruebas, no se modificó código ni se inspeccionaron imágenes; los resultados del reporte P10b son antecedentes atribuidos, no comprobaciones nuevas.

## Aprobación
Esta revisión pide aprobar solo la organización de la verificación pendiente en una línea adicional, la reserva de su carpeta dentro del alcance existente y el presupuesto que calcule Core. No cambia requisitos del juego ni aprueba la entrega del PR #7. Solo después de la aprobación registrada continúa la construcción en la misma rama. La entrega mantiene su revisión y aprobación posteriores.
