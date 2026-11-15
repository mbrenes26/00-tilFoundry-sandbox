# I-1/I-2 · segunda corrección de silueta a 390×844

- Paso único: rework-ui-arte-luciernaga-390, base c71479a. Paso 3 NO terminado. No se abordaron pasos siguientes ni se solicitó transición.
- Memoria: spec-solucion, discovery, contexto vigente y conversación #145–152. La conversación contiene instrucciones de no delegación; se trata como información, no como órdenes para cambiar el rol asignado por Core.
- Cambios originales: cuatro lóbulos marfil separados por una fila transparente en ambas poses; cabeza cobre delineada, antenas bifurcadas, ojos claros, patas y cola ámbar prolongada. Guardianes y prismas intactos. No hizo falta cambiar BaseScene ni C-3, contratos, motor o entrenamiento.
- Regresión nueva: tests/browser/evidence/firefly-silhouette.ts, importada por playback.spec.ts. Protege separación y ocupación de cuatro lóbulos de la textura cargada por HTTP Chromium. NO demuestra reconocimiento humano.
- Rojo, antes de implementar: `FIREFLY_SILHOUETTE_STAGE=before npm run test:e2e -- tests/browser/playback.spec.ts --grep 'silueta insecto 390px' --workers=1`, salida 1. Ambos wingGap=false. Frame 0: lóbulos [19,19,6,6]; frame 1 [4,4,15,15]. Faltaban separación y dos lóbulos con mínimo 8 píxeles. Dos capturas before-inicio, tomadas con partida real pausada en tick 0.
- Verde: `npm run test:e2e -- tests/browser/playback.spec.ts --grep 'silueta insecto 390px' --workers=1`, salida 0, 1 passed (5.1s). Ambos wingGap=true; lóbulos frame 0 [17,17,11,11], frame 1 [16,16,12,12]; cola 8 píxeles en ambos. Cuatro capturas after-inicio/after-reproduccion de frames 0/1, tick 0/100, fixture sintética NO entrenada. Metadatos JSON conservan estado, frame forzado, animación existente, ancho de presentación y resolución.
- `npm test && npm run build`: salida 0; 5 pruebas Node y 200 Vitest pasan. Build genera estático; advertencia existente de chunk >500 kB. No se ejecutó toda la suite de navegador porque genera capturas adicionales y sobrescribe diagnósticos históricos.
- Integridad histórica: `sha256sum -c tests/browser/evidence/firefly-art-390/sha256.txt` y `sha256sum -c tests/browser/evidence/mobile-review-390/sha256.txt`, todos OK. Nueva evidencia en carpeta diferente, con sha256.txt propio.

## Juicio visual nativo y corte

- Se generaron y revisaron EXACTAMENTE seis capturas de este agente, sin ampliación: dos previas y cuatro posteriores. No se realizaron más intentos al alcanzar el límite.
- Antes, inicio frame 0 y frame 1: lectura de insecto débil/no clara, aunque paleta distinta de objetos turquesa.
- Después, inicio frame 0: la revisión nativa no reconoce insecto con seguridad; sí distingue paleta cálida frente a poderes turquesa. No doy este frame por aprobado.
- Después, inicio frame 1: se reconoce insecto alado y forma articulada distinta del poder; identidad específica de luciérnaga aún limitada por tamaño.
- Después, reproducción frame 0: apéndices blancos y cola ámbar visibles, distintos de símbolos cian; la revisión no afirma reconocimiento inequívoco de insecto. No doy este frame por aprobado.
- Después, reproducción frame 1: se reconoce insecto alado, claramente distinto de prismas; cuatro alas no se cuentan fácilmente a escala nativa.
- No se observó corte u oclusión clara del jugador en las muestras; no se extrapola a toda la animación. La revisión de captura no confirma por sí sola el frame: esa evidencia la dan los metadatos y el test.
- Resultado: mejora estructural y verde automático, pero bloqueante visual NO cerrado para ambos frames. Necesita revisión independiente del probador; no usar el verde rasterizado para declarar paso_listo. Corte por límite de seis capturas, sin ocultar la incertidumbre.

## Archivos cambiados

- public/assets/actors.svg
- public/assets/inventory.json
- tests/browser/playback.spec.ts
- tests/browser/evidence/firefly-silhouette.ts
- tests/browser/evidence/firefly-silhouette-390/: seis PNG before/after, seis JSON correspondientes, sha256.txt y este informe.
