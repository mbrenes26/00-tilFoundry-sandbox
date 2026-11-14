# Corrección de bloqueantes de interfaz — issue-6 / PR #7

## P1 — Revalidación de UI-1 / J2 sobre d51665b

- Paso exclusivo: objetivos sin solapamiento. Spec base leída mediante `leer_registro('spec-solucion', version='aprobada-original')`, con J2 completo; revisiones aprobadas y C-2 a C-5/C-7 conservadas. No se modificó CSS, juego, versiones, reglas, assets ni contratos. Los diálogos corresponden a P2, no a esta revalidación.
- Entorno propio: Node.js `v22.23.5`, npm `10.9.9`, Chromium Playwright v1254 (Chrome Headless Shell 158.0.8127.18).
- Primer intento del comando focalizado: salida 127, `playwright: not found`. Es un fallo de preparación de sesión, NO rojo funcional de J2. La sesión no contiene `.git`; `git status`/`git rev-parse HEAD` tampoco pudieron comprobar el commit. La base d51665b es la indicada por Core.
- Preparación: `npm ci && npx playwright install chromium`, salida 0. Sin sustitución de versiones ni regeneración del lockfile.
- Antes de editar: `npm run test:e2e -- tests/e2e/rework.spec.ts --grep 'objetivos completos sin solapamiento'`, salida 0, `2 passed (15.8s)`; pruebas existentes ejecutadas en ambos tamaños, inicialmente y tras preparar misión mediante controles reales.
- Cambio de evidencia en la prueba parametrizada: conservar las comprobaciones de cada rectángulo Range, hit test central y `scrollHeight <= clientHeight`; añadir conteo de rectángulos para evitar comprobación vacía, imprimir geometría y guardar capturas de ambos estados en rutas permanentes. No se redujeron comprobaciones ni se modificaron las pruebas de diálogos.
- Después de editar: mismo comando, salida 0, `2 passed (15.5s)`. Las cuatro mediciones devuelven `client=471`, `scroll=471`, `textRects=18`, `problems=[]`:
  - 1600×900 inicial y preparada.
  - 1280×720 inicial y preparada.
- Los valores client/scroll corresponden a píxeles de disposición CSS del panel lógico; los rectángulos y hit tests se evalúan en coordenadas reales del viewport escalado por FIT.

### Capturas nuevas e inspección real

Todas obtenidas por Playwright contra HTTP local y revisadas mediante `ver_captura` en esta ejecución:

- `tests/e2e/rework-captures/p1-objectives-1600x900-initial.png`: ocho objetivos y notas Ventana/Clima/Fase completos dentro del panel, sin solapamientos.
- `tests/e2e/rework-captures/p1-objectives-1600x900-prepared.png`: checklist con reparación 1/2 y notas completos, sin cobertura por estado o parámetros.
- `tests/e2e/rework-captures/p1-objectives-1280x720-initial.png`: ocho objetivos legibles sin recorte; notas completas pero pequeñas (visor estima 10–11 px), punto débil de legibilidad, sin impedir lectura en la revisión.
- `tests/e2e/rework-captures/p1-objectives-1280x720-prepared.png`: ocho objetivos y notas legibles completos, sin solapamientos.

### Contraste del rojo histórico

- El Manager transmite el hallazgo del auditor UI sobre `dea64d9`: `clientHeight=471`, `scrollHeight=630`; texto en y=691–812 tapado por Parámetros desde y=715.
- El reporte anterior de la rama registraba rojo de las pruebas de objetivos en ambas resoluciones (`Fuera del panel` y `Texto tapado` en Ventana y notas), y después verde con scroll/client=471/471.
- Las mediciones propias nuevas 471/471 y cero problemas son consistentes con la corrección ya existente; no se revirtió CSS para fabricar rojo.
- Límite de trazabilidad histórica: `leer_conversacion` omite 86 mensajes intermedios; `leer_registro('eventos')` y `leer_registro('auditoria-ui')` devuelven `No existe`, y este rol no dispone de `leer_informes_de_auditoria`. No se pudo leer directamente la salida histórica de Core ni el informe completo del auditor. El hallazgo histórico anterior se atribuye al Manager y al reporte de rama, NO a comandos propios de esta ejecución. Core registra las ejecuciones nuevas.

### Archivos de P1 y pendientes

- Modificados: `tests/e2e/rework.spec.ts`, `tests/e2e/rework-report.md`.
- Añadidos: las cuatro capturas `p1-objectives-...` enumeradas arriba.
- `src/styles/game.css`: verificado sin cambios; no hizo falta corregir la implementación.
- No se ejecutaron pruebas de P2 ni regresión integral en este paso. J2 se acredita aquí solo para el subcriterio UI-1; salas y demás criterios quedan para los pasos previstos. La verificación independiente integral y la entrega siguen pendientes.
- El impedimento documental de acceso a la spec base indicado en el reporte histórico siguiente ya no aplica: fue recuperada y leída. Su trazabilidad integral corresponde a P3–P8.

## Registro de la corrección anterior (histórico; no son ejecuciones de P1)

- Base indicada por Core: `dea64d9c1a95dbb7af735fb9e60c6946fb062891`; rama `foundry/issue-6`.
- Cambios anteriores limitados a `src/game/`, `src/styles/`, `tests/e2e/`. Sin cambios de reglas, contratos, assets del juego, versiones ni configuración.

### Evidencia TDD anterior por bloqueante

- Objetivos: `tests/e2e/rework.spec.ts`, prueba parametrizada «REWORK objetivos completos sin solapamiento», 1600×900 y 1280×720.
  - Rojo antes de implementar: `npm run test:e2e -- tests/e2e/rework.spec.ts`, salida 1, `4 failed`. En ambas resoluciones: `Fuera del panel: Ventana: 10:00–11:00`, `Texto tapado: Ventana: 10:00–11:00`, notas de Clima/Fase fuera del panel.
  - Verde: mismo comando, salida 0, `4 passed (31.4s)`.
  - Se comprobó cada rectángulo mediante Range, hit test central y scrollHeight <= clientHeight, antes y después de preparar misión; captura HTTP adicional 471/471 en ambas resoluciones.
  - Implementación: compactar márgenes, interlineado y distribución sin ocultar contenido ni añadir desplazamiento.
- Confirmación: prueba «REWORK confirmación: semántica, teclado, cancelar, confirmar y foco tras render».
  - Rojo: comando anterior, role esperado dialog, recibido vacío. Segunda ejecución previa: `npm run test:e2e -- tests/e2e/rework.spec.ts --grep 'confirmación|riesgo'`, salida 1, `2 failed`; controles inactivos frente al foco esperado, Tab incorrecto y pérdida de foco tras render.
  - Verde: comando completo de cuatro pruebas, salida 0. Nombre accesible, aria-modal, foco en Cancelar, 20 Tab/20 Shift+Tab, render, cancelación, confirmación de reparación y espera por teclado.
- Riesgos: prueba «REWORK riesgo: semántica, teclado, cancelar, confirmar y foco tras render».
  - Rojo: mismas dos ejecuciones; risk-warning sin role, controles sin foco esperado, Tab incorrecto y pérdida de foco tras render.
  - Verde: cuatro pruebas, salida 0. Semántica, 20 Tab/20 Shift+Tab, cancelar restaura Lanzar; confirmar enfoca Despegue y después Reiniciar.
- Implementación anterior de foco: identidad estable antes de innerHTML, origen registrado, restauración tras render, Tab limitado al diálogo y manejador eliminado al cerrar escena.
- Botones deshabilitados no admiten foco: tras reparar, Progreso y después panel Reparaciones; tras lanzar, Despegue y después Reiniciar. No se habilitaron acciones completadas para forzar foco.

### Regresión y entorno anteriores

- Node.js v22.23.5, npm 10.9.9.
- `npm ci && npx playwright install chromium`: salida 0.
- `npm test`: salida 0, `35 passed`.
- `npm run build`: salida 0, TypeScript y Vite 6.4.6; aviso no bloqueante de paquete >500 kB sin ocultarlo.
- `npm run test:e2e`: salida 0, `18 passed (3.9m)`; 14 existentes + 4 nuevas, incluida invalidación/revalidación J4 por espera real.
- `PREVIEW=1 npm run test:e2e`: salida 0, `18 passed (3.8m)`.
- `npm audit --json`: salida 0; todas las severidades y total 0, sin exclusiones, overrides ni audit fix.
- Logs anteriores: `tests/e2e/rework-unit.log`, `rework-build.log`, `rework-dev.log`, `rework-preview.log`, `rework-audit.json` y sus `.exit`.
- Incidencias anteriores: ejecución agrupada larga devolvió `Function failed` con proceso aún activo; se esperó y repitió con logs/códigos. Captura recibió `ERR_CONNECTION_REFUSED` durante relevo del servidor y se repitió correctamente.

### Revisión visual anterior

- `tests/e2e/rework-captures/objectives-1600.png` y `objectives-1280.png`: ocho objetivos y notas completos; notas pequeñas pero legibles a 1280.
- `tests/e2e/rework-captures/confirmation-keyboard-1280.png`: diálogo completo y foco amarillo en Cancelar; evaluación focused=true, focusVisible=true.
- `tests/e2e/rework-captures/risk-keyboard-1280.png`: diálogo completo y foco en Cancelar; role=dialog, modal=true, focused=true, focusVisible=true.

### Pendientes documentales reportados anteriormente — B1

- En aquella ejecución solo se recuperó la adenda D1–D4 sin base; eventos/rework no existían y conversación omitía 69 mensajes. No se reconstruyeron criterios a partir del código ni se inventó aprobación. La base está recuperada en P1, sin declarar por ello cumplimiento integral.
- Sin cambio de interfaz pública documentada: no correspondía modificar contratos.
- No se acreditó duración humana de 10–15 minutos, revisión independiente de otra familia de modelos ni checks alojados en GitHub.

### Archivos de la corrección anterior

- `src/game/scenes.ts`, `src/styles/game.css`, `tests/e2e/rework.spec.ts`, `tests/e2e/rework-report.md`.
- Logs y `.exit` anteriores enumerados arriba.
- Las cuatro capturas anteriores enumeradas en Revisión visual anterior.

Core devuelve el hash al confirmar; este documento no afirma una transición ni aprobación.

## P2 — UI-2 / J3, J4 sobre c50bdbc

- Spec base aprobada-original y adenda vigente leídas; C-2–C-5/C-7 respetadas. Paso exclusivo de teclado, foco y aislamiento de confirmación y aviso de riesgos. No se cambió balance, API, dependencias, estilos, reglas ni `tests/e2e/game.spec.ts`.
- Entorno: Node.js v22.23.5, npm 10.9.9, Chromium Playwright v1254 / Chrome 158.0.8127.18. Primer intento `npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts`: salida 127, playwright ausente; no es rojo funcional. Preparación `npm ci && npx playwright install chromium`, salida 0, sin modificar versiones ni regenerar lockfile.
- Antes de editar, mismo comando HTTP tras preparar: salida 0, **8 passed (1.1m)**. Cobertura existente de ambos diálogos: role=dialog, nombre accesible, aria-modal, foco inicial Cancelar, 20 Tab y 20 Shift+Tab contenidos, foco estable tras render; cancelar restaura origen, confirmar reparación enfoca Progreso y luego Reparaciones, confirmar espera restaura Esperar; riesgo confirmado enfoca Despegue y resultado Reiniciar. El puntero ya aislaba acciones y reloj, pero no comprobaba el foco después de hacer clic en el fondo.

### Rojo real nuevo y corrección mínima

- Se amplió `modal-pointer.spec.ts`: por cada uno de seis controles de fondo, clic físico, dispatchEvent(click) y HTMLElement.click(); invariancia de acción pendiente, borrador, perfil, sala, reloj y textos del fondo/diálogo. Se añadió comprobar que Cancelar sigue enfocado tras esos intentos.
- **Rojo previo a implementación:** `npm run test:e2e -- tests/e2e/modal-pointer.spec.ts`, salida **1**, **4 failed**, ambos diálogos y ambas resoluciones. `toBeFocused`: Expected focused, Received inactive para cancel-action/cancel-warning. La invariancia del fondo sí pasaba. No se revirtió código para fabricar rojo.
- Defecto: `inert` evita activar controles, pero el clic físico en el fondo puede quitar foco del diálogo antes de `click`; el blanco del evento puede estar fuera del root DOM de Phaser. Si el foco sale del root, su manejador local de teclado no puede contener Tab.
- `src/game/scenes.ts`: capturar `pointerdown` en document solamente cuando existe un diálogo y el blanco está fuera de él; preventDefault conserva el foco. No se impiden clics internos; se elimina el listener en shutdown. No se añadieron reglas de negocio ni temporizadores.
- **Verde inmediato:** `npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts`, salida **0**, **8 passed (1.0m)**.
- Refuerzo final sin reducir comprobaciones: aserción de foco después de cada clic/activación DOM, Tab a Confirmar y Shift+Tab a Cancelar tras intentos de fondo; parametrizar las dos pruebas existentes de teclado en 1600 y 1280. No hizo falta otra implementación.

### Regresiones reales y evidencia final

Salidas completas y códigos en `tests/e2e/modal-pointer-evidence/p2-{unit,build,http,preview}.log` y `.exit`:

- `npm test`: salida **0**, **35 passed**, incluidos reglas reales y Session.
- `npm run build`: salida **0**, TypeScript y Vite 6.4.6; advertencia de chunk >500 kB conservada, sin cambios de infraestructura.
- `npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts tests/e2e/game.spec.ts`: salida **0**, **24 passed (4.6m)** por HTTP local. Incluye J3 progreso exclusivo/doble confirmación/lectura sin tiempo; J4 ganadora, riesgos primarios y simultáneos, cancelación y revalidación del aviso tras esperas reales. Se ejecutó game.spec.ts completo, sin editarlo y sin sustituir reglas.
- `PREVIEW=1 npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts`: salida **0**, **10 passed (1.3m)** contra build servido por HTTP.
- Dos llamadas largas devolvieron `Function failed` con proceso todavía activo; se esperó y consultó `.last-run.json` (passed). Para no atribuirles salidas inexistentes se repitió la verificación con logs y códigos propios enumerados arriba; todos los procesos terminaron.

### Capturas revisadas

`tests/e2e/modal-pointer-evidence/p2-confirmation-{1600,1280}.png` y `p2-risk-warning-{1600,1280}.png`: revisión con ver_captura confirma contenido y botones completos, costo/duración o causa señal 68 %, sin recortes internos y contorno amarillo visible en Cancelar. La permanencia del foco tras interacción la prueban las aserciones, no la imagen estática.

### Archivos y límites

- Código: `src/game/scenes.ts`.
- Pruebas: `tests/e2e/rework.spec.ts`, `tests/e2e/modal-pointer.spec.ts`.
- Reporte: `tests/e2e/rework-report.md`.
- Evidencia nueva: cuatro PNG y ocho archivos de logs/códigos dentro de `tests/e2e/modal-pointer-evidence/`.
- No hay cambio de interfaz pública documentada; no corresponde actualizar contratos ni README en P2.
- El informe histórico UI completo sigue sin acceso directo para este rol: no existe herramienta leer_informes_de_auditoria; leer_registro(auditoria-ui) devuelve No existe. El hallazgo anterior sobre foco en body/Tab detrás se atribuye al Manager; el rojo nuevo sí fue ejecutado y registrado por Core en este paso.
- Esto no acredita P3–P9 ni auditoría/entrega independiente. No se pidió transición ni aprobación.


## P2 — Reejecución de comprobaciones sobre aa337677

- Constructor: revisión exclusiva de J3/J4 y UI-2. Consultadas la base aprobada-original, aprobada-2 y adenda vigente; respetadas C-2–C-5/C-7. No se modificaron código, balance, API, versiones ni `tests/e2e/game.spec.ts`.
- Entorno leído: Node.js v22.23.5, npm 10.9.9; Chromium headless shell de Playwright build 1254. Sesión inicialmente sin node_modules; se ejecutó `npm ci && npx playwright install chromium && npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts tests/e2e/game.spec.ts`. La herramienta devolvió `Function failed` mientras el proceso seguía activo; no se atribuye código de salida a esa llamada.
- Se esperó al proceso y se repitió la suite con captura explícita de salida y código: `npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts tests/e2e/game.spec.ts`. Resultado **0**, **24 passed (4.6m)**. Evidencia nueva: `tests/e2e/modal-pointer-evidence/p2-recheck-http.log` y `p2-recheck-http.exit`; `.last-run.json` también indica passed y failedTests vacío. Una consulta intermedia dio salida 1 porque aún no existían los archivos finales; no fue fallo de tests.
- UI-2: `rework.spec.ts:69,87` comprueba ambos diálogos a 1600×900 y 1280×720: role/nombre/aria-modal, foco inicial, Tab/Shift+Tab contenidos, permanencia tras render, restauración al cancelar y destino durante reparación y despegue. `modal-pointer.spec.ts:40,49` prueba por cada diálogo/tamaño seis clics físicos y doce activaciones DOM sin cambios de acción/ángulo/sala/reloj/aviso e indicadores; foco retenido, cancelación libera controles y confirmación conserva la acción.
- J3: regresión real `game.spec.ts:12` (progreso exclusivo, doble confirmación y lectura sin tiempo). J4: `game.spec.ts:13–15,36` (ganadora, riesgos separados/simultáneos, cancelación sin tiempo, omisión de revisión y revalidación tras esperas reales). Suite completa sin mocks ni edición de ese archivo. Revisión de `scenes.ts:137–152`: semántica modal, fondo inert, defensa ante eventos DOM y guardas de tarea/resultado; no se duplican reglas en este paso.
- Sin fallo reproducido ni cobertura faltante en P2: no se añadió código ni se fabricó otro rojo. Rojo histórico real de cuatro tests de puntero y verde posterior ya registrados por Core en la conversación del issue #6 y en la sección P2 precedente; no se presentan como pruebas ejecutadas de nuevo en rojo.
- Las cuatro capturas `p2-confirmation-{1600,1280}.png` y `p2-risk-warning-{1600,1280}.png` fueron regeneradas por la suite y revisadas con ver_captura: bordes/textos/botones completos, costos 20 min/$60.000/10 repuestos o riesgo de comunicación 68 %, Cancelar con contorno amarillo. La imagen no acredita por sí sola el aislamiento/foco dinámico; lo acreditan las aserciones.
- Archivos escritos: este reporte, dos archivos p2-recheck-http de log/código y capturas regeneradas dentro de `tests/e2e/modal-pointer-evidence/`. No se actualizó contrato/documentación pública porque no cambió interfaz. No se ejecutaron build/preview/unidades de nuevo: sus resultados anteriores quedan como históricos.
- Límite: este rol no dispone de leer_informes_de_auditoria; los intentos de leer registros eventos/informes-auditoria devolvieron No existe. Se usa el alcance UI-2 comunicado por el Manager, sin atribuir revisión del informe completo. Esta reejecución es del constructor, no reemplaza probador ni auditores independientes; no cierra P2, P3–P9 ni solicita transición.


## P2 — Verificación actual del constructor sobre 7310258

- Consultadas base aprobada-original y revisiones aprobada-2/aprobada-3; respetadas C-2–C-5/C-7. Paso exclusivo UI-2, J3/J4. No se modificaron código, pruebas, reglas, balance, API ni versiones: la corrección existente satisface la cobertura solicitada.
- Entorno: Node.js v22.23.5, npm 10.9.9. `npm ci`: código 0, 48 paquetes instalados, cero vulnerabilidades informadas. No se regeneró el lockfile. `npx playwright install chromium`: código 0, Chromium/headless shell build 1254 (158.0.8127.18).
- Primer `npm run test:e2e -- tests/e2e/rework.spec.ts tests/e2e/modal-pointer.spec.ts tests/e2e/game.spec.ts`: código 1, 24 fallos de arranque por ejecutable Chromium ausente. Evidencia: `tests/e2e/modal-pointer-evidence/p2-current-browser-missing.log` y `.exit`. Es un fallo de preparación, NO un rojo funcional de UI-2.
- Mismo comando tras instalar Chromium: código final 0, **24 passed (4.6m)**; log/código completos en `tests/e2e/modal-pointer-evidence/p2-current-http.log` y `.exit`. La herramienta devolvió un error de transporte mientras el proceso continuaba; se esperó su terminación real. Al terminar: `.last-run.json` mostró `status: passed`, sin pruebas fallidas, y el archivo de código final mostró 0. No se usó el código obsoleto del primer intento ni un proceso iniciado como evidencia de éxito.
- J3/UI-2: `rework.spec.ts:69` (ambos tamaños) verifica role=dialog, nombre accesible, aria-modal, foco inicial Cancelar, 20 Tab y 20 Shift+Tab contenidos, foco estable tras render, restauración al cancelar, foco en progreso, destino disponible al completar reparación y restauración tras acción inmediata. `game.spec.ts:12` verifica progreso exclusivo, doble confirmación y lectura sin tiempo con reglas reales.
- J4/UI-2: `rework.spec.ts:87` verifica la misma semántica/teclado/render en aviso de riesgos, restauración a Lanzar al cancelar, foco disponible durante despegue y en Reiniciar al resultado. `modal-pointer.spec.ts:40,49` verifica ambos diálogos/tamaños: seis clics físicos y doce activaciones DOM por caso sin cambiar acción pendiente, ángulo, sala, reloj, aviso ni indicadores; retiene foco, libera controles al cancelar y conserva la acción al confirmar. `game.spec.ts:13–15,36` verifica ganadora, riesgos individuales/simultáneos, omisión de revisión y revalidación tras cancelar y esperar hasta 10:40 (antena 68 % y viento 45 km/h). Archivo de regresiones sin editar y sin mocks.
- Rojo funcional histórico: `tests/e2e/modal-pointer-evidence/report.md`, sección Evidencia por criterio, remite a salida Core 48 (código 1; pendiente reparación sustituida por espera) y verde Core 49 (código 0). `tests/e2e/rework-report.md` conserva también la evidencia histórica de teclado. Se atribuye a registros anteriores, no a ejecución roja nueva ni a lectura del informe completo del auditor. Sin defecto ni cobertura faltante actual, no se repitió implementación ni se fabricó rojo.
- Cuatro capturas actuales revisadas con ver_captura: `tests/e2e/modal-pointer-evidence/p2-confirmation-{1600,1280}.png` y `p2-risk-warning-{1600,1280}.png`. Diálogos y botones completos, costos 20 min/$60.000/10 repuestos o causa señal 68 %, contorno amarillo visible en Cancelar, sin recortes internos. Las aserciones, no las imágenes, acreditan aislamiento y foco dinámico.
- Archivos escritos en este paso: `tests/e2e/rework-report.md`; cuatro logs/códigos `p2-current-http` y `p2-current-browser-missing`, y las cuatro capturas citadas dentro de `tests/e2e/modal-pointer-evidence/`. No cambia interfaz pública documentada; no corresponde modificar contrato ni README.
- Límites: comprobación del constructor, no sustituye al probador ni auditores independientes. No se declara completada la verificación independiente previa, ni P3–P9 ni entrega. No se solicitaron transiciones. El informe completo histórico UI no está disponible mediante las herramientas de este rol; se comprobó el hallazgo comunicado por el Manager contra código y controles actuales. Build/preview y unidades no se reejecutaron en este paso.
