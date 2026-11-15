---
id: "issue-11/auditoria/codigo-2cf4578"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre 2cf4578: cambios"
version: 1
estado: "aprobado"
solucion: "issue-11"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "2cf45784251c8a70c5d0a806939c8eb3e5631f9b", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 291006, "tokens_salida": 2513, "monto_ia": 1.017901, "minutos_computo": 1.046, "monto_computo": 0.001883}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "2cf45784251c8a70c5d0a806939c8eb3e5631f9b"}
---
## Auditoría de código: cambios

### Bloqueantes
- `src/game/geometry.ts:22-24`, `public/assets/star.svg:4-7` — La captura acepta todo el cuadrado de la textura, incluidas sus esquinas transparentes. Esto incumple juego-2: tocar fuera de la zona visible no debe sumar puntos. Evidencia por lectura: con la estrella centrada en (800, 440), tamaño 224 y antes del plazo, (695, 335) satisface `containsPoint`, aunque corresponde al píxel (1, 1) del fotograma SVG, donde no hay dibujo. `captureStar` suma el punto en `src/game/rules.ts:64-70`. `tests/unit/rules.test.ts`, caso «captura en el borde visible», incluso exige capturar una esquina del cuadrado, no de la silueta. Corregir haciendo visible toda la zona cuadrada aceptada, o haciendo coincidir la geometría pura de captura con el objetivo visible sin perder el requisito táctil. Añadir regresión con clic y toque en una zona transparente y en una zona visible; verificar puntos, fallos y plazo.
- `tests/e2e/ventanas.spec.ts:68-79` — La comprobación del tamaño y separación de la estrella construye un rectángulo con constantes (224, 112, 200, 1376, 480); no obtiene el tamaño ni los límites del objeto realmente mostrado o de su zona de captura. Por tanto, no verifica en Chromium esa parte de juego-5: un cambio incorrecto en `LaunchScene.setDisplaySize` mantendría verdes estas aserciones y las capturas de prueba en el centro. Medir los límites reales del objetivo y su zona interactiva en las cuatro ventanas, proyectarlos a píxeles CSS y comprobar al menos 44×44, contención y separación de indicadores. Conservar las pruebas unitarias de geometría como complemento, no como sustituto de esta comprobación de integración.

### Sugerencias
- `src/game/rules.ts:61-62` — Cada entrada busca y copia todo el historial de identificadores, incluso al tocar fuera. El coste acumulado crece cuadráticamente con las entradas de una partida larga. Considerar una estructura de deduplicación más eficiente, conservando pureza y la garantía de no reutilizar eventos antiguos.

### Qué revisé
- Spec aprobada original y vigente, discovery y decisiones C-2, C-3, C-4, C-5, C-7 y C-8. No hay contrato separado; la spec declara una sola línea.
- PR #12, commit `2cf45784251c8a70c5d0a806939c8eb3e5631f9b`, sus seis commits, cuerpo y sección «Evidencia por paso». El PR no tiene checks registrados. No detecté archivos fuera del alcance ni cambios en Foundry en el inventario del cambio.
- Reglas, reloj, geometría, cinco escenas, configuración Phaser, disposición, estilos, recursos SVG, procedencia, README, configuración de instalación/build y los seis archivos unitarios y cuatro archivos de navegador.
- Juego-1 a juego-4: hay pruebas de inicio, captura, deduplicación, azar inyectado, frontera temporal, duración mínima, secuencias largas, tercer fallo, reinicio y pausa. La separación entre reglas puras y Phaser está implementada; la discrepancia de zona visible queda indicada arriba.
- Juego-5: pruebas de las cuatro ventanas, ratón y emulación táctil, medición real de textos, botones y lienzo; falta la medición real del objetivo indicada arriba.
- Juego-6 y juego-7: escenas y APIs requeridas, recursos locales con inventario, versiones exactas, documentación HTTP y pruebas de carga. C-8 está excluida por la spec.
- Evidencia de Core en conversación #25 y #29: rojo y verde de configuración/carga y reglas; #47: rojo y verde del ajuste documental. La sección del PR registra la evidencia por paso.
- Evidencia final de Core, conversación #51: Node.js 22, `npm ci`, 57 pruebas unitarias aprobadas, build correcto y 18 pruebas Chromium aprobadas tanto en desarrollo como en versión estática. Advertencia de tamaño de bundle, no fallo de build.
- Limitación: intenté inspección y ejecución en la sesión aislada; ambas llamadas devolvieron `Function failed`, sin salida de comandos. No atribuyo ejecuciones propias ni una reproducción de navegador a esta auditoría; los hallazgos se basan en lectura del código y de las pruebas, y los resultados ejecutados citados pertenecen a la evidencia registrada por Core.