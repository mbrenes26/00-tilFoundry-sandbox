---
id: "issue-11/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec de Atrapa la estrella"
version: 1
estado: "borrador"
solucion: "issue-11"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "c6bcdf3eb0bb03c2ba847832c0193f279d767b54", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 60650, "tokens_salida": 2494, "monto_ia": 0.038805, "minutos_computo": 0, "monto_computo": 0.0}
---
# Spec: issue-11

## Cerebro consultado
Consultadas C-2 (reglas puras), C-3 (escenas, resolución y temporizadores Phaser), C-4 (Node.js 22, HTTP local y build estático), C-5 (pixel art original y español), C-7 (stack y versiones exactas) y C-8 (entrenamiento separado, no aplicable a este juego). Inventario completo y README.md leídos: proyecto greenfield, confirmado por la persona, sin código existente. No se migra ni reemplaza ninguna decisión.

## Solución
Minijuego «Atrapa la estrella» para un jugador con pantalla inicial, partida de reacción y resultado con reinicio. Una estrella aparece completamente visible en una posición aleatoria; atraparla suma un punto y acorta el tiempo disponible. Solo dejarla desaparecer cuenta como fallo; el tercero termina la partida. Se entrega código para ejecución HTTP local, no publicación.

## Decisiones para el cerebro
Ninguna. El stack, arquitectura, idioma y ejecución ya están fijados por las decisiones vigentes.

## Riesgo declarado
Nivel: medium
Motivo: código nuevo de navegador, interacción táctil y temporización que deben comprobarse; sin backend, datos personales, cuentas, pagos, cambios de configuración del repositorio ni despliegue en producción.

## Presupuesto
Línea juego: 7 criterios · USD 5.25
Auditoría: 4 auditores · USD 2.00
Estimado: USD 7.25 (±30%: entre USD 5.07 y USD 9.43)
Total de construcción: USD 9.43

## Contrato entre líneas
No aplica: una sola línea entrega reglas, interfaz y pruebas del minijuego.

# Línea: juego

## Resultado
Juego completo ejecutable localmente, con reglas puras probadas y representación Phaser, gráficos originales e instrucciones de uso.

## Criterios de aceptación
1. La pantalla inicial muestra «Atrapa la estrella» y un botón «Jugar». Clic o toque inicia una partida con cero puntos, cero fallos y una única estrella activa. Las reglas de estado, puntaje, fallos y duración son módulos TypeScript puros, independientes de Phaser; el renderizado consume su estado sin duplicarlas.
2. Cada estrella aparece en una posición aleatoria dentro del área de juego, completamente visible y sin invadir el puntaje, los fallos ni los controles. El azar puede inyectarse en las pruebas. Clic o toque dentro de su zona visible la captura exactamente una vez y suma un punto; tocar fuera no altera puntos, fallos ni el plazo de la estrella. Una entrada repetida del mismo evento no captura la estrella siguiente.
3. La primera estrella dura 2000 ms. Tras cada acierto, la siguiente dura max(500, 2000 - 100 × puntaje) ms. El vencimiento sin captura suma un fallo y genera otra estrella con la misma duración vigente, salvo al tercer fallo. El plazo vence cuando el tiempo transcurrido es mayor o igual a la duración; en esa frontera, el vencimiento prevalece sobre la captura. Una estrella no puede producir captura y fallo a la vez. El navegador aplica los cambios en la primera actualización disponible después del plazo, sin exigir precisión de tiempo real.
4. El tercer fallo detiene la partida, elimina la estrella y muestra el puntaje final y «Jugar otra vez». Reiniciar borra puntos, fallos, entradas pendientes y temporizadores anteriores, y vuelve a 2000 ms. El puntaje y los fallos actuales son visibles durante la partida. Si la pestaña se oculta, la partida pausa su reloj y reanuda con el tiempo restante al volver, sin fallos acumulados por estar oculta.
5. La interfaz se comprueba en ventanas de escritorio 1280×720 y 1600×900 y teléfono vertical 360×800 y 390×844, medidas en píxeles CSS. En todas, título, puntaje, fallos y botones se ven completos, sin superposiciones ni desplazamiento horizontal; el texto informativo tiene tamaño efectivo de al menos 16 píxeles CSS y estrella y botones tienen zonas de toque de al menos 44×44 píxeles CSS. El lienzo mantiene resolución lógica 1600×900 y Phaser.Scale.FIT, sin estirar; se admite espacio libre alrededor. La disposición deja espacio suficiente para la estrella aun en el teléfono más pequeño. Se verifica clic en escritorio y toque con emulación táctil en Chromium.
6. Se usan BootScene para recursos, BaseScene para inicio, UIScene para indicadores, LaunchScene para la partida y ResultScene para resultado, conforme a C-3. Phaser tiene pixelArt: true; animaciones de sprites usan this.anims, transiciones o progreso usan tweens y temporizadores usan this.time, nunca setInterval para el juego. Los gráficos son pixel art originales almacenados en el repositorio con inventario de procedencia; todos los textos visibles están en español.
7. Con Node.js 22, npm ci instala desde package-lock.json; npm run dev sirve el juego por HTTP, npm run build produce una versión estática y npm test ejecuta las pruebas unitarias. npm run test:e2e ejecuta las pruebas Chromium tras instalar el navegador de Playwright. package.json fija TypeScript mayor 5, Phaser mayor 3, Vite 6.4.6, Vitest 4.1.12 y @playwright/test 1.65.0, sin sustituir las versiones exactas fijadas por C-7. README.md explica instalación, comandos, controles, reglas y que file:// no está soportado. Si las versiones fijadas no se pueden instalar, se comunica el bloqueo, no se cambian unilateralmente.

## Pruebas
TDD: aplica
- Vitest para criterios 1 a 4: inicio, captura única, entrada fuera, posiciones con azar inyectado, duración inicial y mínimo, fallo, tercer fallo, frontera de vencimiento, reinicio y pausa/reanudación con reloj controlado. Comprobar secuencias largas para que duración y puntaje no pierdan coherencia.
- Playwright con Chromium para criterios 1 a 5: inicio, captura con ratón y toque, vencimiento, resultado y reinicio; validar las cuatro ventanas declaradas, medidas de texto y zonas táctiles y ausencia de recortes y superposiciones. Usar control de tiempo y azar determinista en pruebas sin introducir controles de trampa visibles en el juego.
- Criterio 6: comprobación de configuración y uso de escenas, recursos y APIs, con prueba de carga sin errores y capturas de las pantallas inicial, partida y resultado para revisar pixel art y legibilidad.
- Criterio 7: instalación limpia, ejecución de pruebas, build y carga por HTTP del resultado estático sin errores de consola ni recursos faltantes. Documentar comandos reales y resultados; no considerar la emulación táctil como prueba de un teléfono físico.

## Alcance
Alcance: `src/`, `public/assets/`, `tests/`, `README.md`, `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`

## Exclusiones
- Backend, cuentas, multijugador, clasificación, almacenamiento de puntajes y entrenamiento neuronal.
- Sonido, anuncios, pagos, analítica y servicios externos en tiempo de ejecución.
- Publicación, hosting y cambios en .github/ o en configuración de TIL Foundry.
- Otras ventanas como requisitos de aceptación y certificación en teléfonos físicos o navegadores distintos de Chromium.

## Dependencias
- Node.js 22 y npm; acceso al registro de paquetes para instalación y al navegador Chromium de Playwright.
- Decisiones C-2, C-3, C-4, C-5 y C-7. No depende de otras líneas, cuentas, secretos ni sistemas externos.
