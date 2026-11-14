# REWORK segunda vuelta: bloqueo del fondo modal

- Implementación: `src/game/scenes.ts` vuelve inertes los hermanos del diálogo durante cada render. El manejador delegado rechaza eventos cuyo origen esté fuera del diálogo antes de procesar cualquier control. Al cerrar, el nuevo render elimina la condición inerte. No se modifican reglas, Session, contratos ni invalidación de riesgos.
- Regresión: `tests/e2e/modal-pointer.spec.ts`, cuatro casos en 1600×900 y 1280×720, con clics físicos en Esperar 5, Esperar 20, Reparar antena, ángulo, Meteorología y Lanzar fuera de ambos diálogos, más activación DOM de Esperar 5. Comparan pendiente, sala, perfil, ángulo, contenido de fondo y diálogo antes/después de cada clic.

## Evidencia por criterio

- Confirmación no reemplaza pendiente ni altera estado: rojo `npm run test:e2e -- tests/e2e/modal-pointer.spec.ts` (salida Core 48, código 1): ambos casos de confirmación fallan al primer clic en Esperar 5; pendiente cambia de `{type:'repair',system:'pump'}` a `{type:'wait',minutes:5}`. Verde, mismo comando después del fix (salida Core 49, código 0): cuatro casos pasan. Confirmar completa bomba, queda deshabilitada y reloj 08:50; cancelar otra confirmación no cambia hora; volver a Esperar 5 lleva a 08:55.
- Aviso no permite interacción de fondo: mismo rojo 48, ambos casos de aviso fallan: desaparece el aviso y se crea pendiente Esperar 5. Mismo verde 49: aviso, pendiente nulo y fondo permanecen idénticos; al cancelar se puede esperar, reabrir aviso y confirmar lanzamiento con la causa antena 68 % conservada en resultado.
- Foco/restauración y geometría: `tests/e2e/rework.spec.ts` sin modificaciones; sus cuatro casos pasan en ambas ejecuciones completas. Incluyen Tab/Shift+Tab, cancelación, confirmación, foco tras render, progreso, lanzamiento y resultado; límites completos de objetivos a ambas resoluciones.
- Invalidación/revalidación: `tests/e2e/game.spec.ts` conserva todas las aserciones del caso J4; ahora cancela explícitamente el aviso antes de Esperar, porque los clics de fondo quedan prohibidos. Sigue verificando desaparición de la autorización anterior y nuevo aviso con antena y clima desfavorable a 10:40. Las pruebas unitarias de Session para invalidación permanecen intactas.

## Verificación completa

- Entorno: Node v22.23.5, npm 10.9.9. `npm ci && npx playwright install chromium`: código 0.
- `npm test`: código 0, 35 pruebas en cuatro archivos.
- `npm run build`: código 0; permanece aviso no bloqueante de tamaño del paquete Vite (>500 kB).
- `npm audit --json`: código 0, cero vulnerabilidades en todas las severidades, incluidas dependencias de desarrollo.
- `npm run test:e2e`: código 0, 22 pruebas, 4.4 min; salida íntegra en `tests/e2e/modal-pointer-evidence/dev.log`.
- `PREVIEW=1 npm run test:e2e`: código 0, 22 pruebas, 4.3 min; salida íntegra en `tests/e2e/modal-pointer-evidence/preview.log`.
- Una ejecución completa inicial perdió respuesta de herramienta; después se comprobó `.last-run.json` satisfactorio y se repitieron ambas ejecuciones con salida y códigos conservados. Un comando de inspección tuvo error de sintaxis antes de ejecutar pruebas; se corrigió sin cambios de código.
- Captura real `tests/e2e/modal-pointer-confirmation.png`, revisada con ver_captura: bomba 100 %, 20 min, costo y botones completos después de clic exterior; objetivos dentro del panel. El clic lo acredita el comando y la regresión, no la imagen por sí sola.

## Archivos de esta vuelta

- `src/game/scenes.ts`
- `tests/e2e/game.spec.ts`
- `tests/e2e/modal-pointer.spec.ts`
- `tests/e2e/modal-pointer-confirmation.png`
- `tests/e2e/modal-pointer-evidence/dev.log`
- `tests/e2e/modal-pointer-evidence/preview.log`
- `tests/e2e/modal-pointer-evidence/report.md`

## Pendientes

- B1 documental permanece pendiente del manager: no se reconstruyó la spec base.
- No cambia interfaz pública documentada; no procede cambiar README ni contratos para este bloqueo de entrada modal.
- No se acredita entrega, checks alojados en GitHub ni duración con jugadores. La revisión independiente corresponde al probador y auditores.
