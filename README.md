# Nivel 1: Despegue

Juego web de preparación de una misión espacial, en español, sin backend ni azar. Implementa un solo nivel, nueve salas y resultados deterministas. Phaser 3 dibuja la base y las animaciones; las reglas TypeScript son puras e independientes del navegador.

## Requisitos y ejecución local

Node.js 22 y npm 10. Ejecuta desde la raíz:

```bash
npm ci
npm run dev
```

Abre la dirección HTTP que muestra Vite (normalmente `http://127.0.0.1:5173`). Dev y preview escuchan solo en `127.0.0.1` (loopback); no se exponen a la red local. Esto reduce exposición, pero no corrige las vulnerabilidades conocidas de las dependencias. No se puede jugar mediante `file://`.

```bash
npm test                  # Vitest: reglas, contrato de arte, control de tareas
npm run build             # TypeScript y salida estática en dist/
npm run preview           # HTTP local para revisar dist/
npx playwright install chromium
npm run test:e2e           # Chromium real, controles de interfaz
PREVIEW=1 npm run test:e2e # Mismas pruebas contra build por HTTP
npm run assets            # Regenerar arte original, no descarga imágenes
```

Dependencias fijadas: phaser 3.90.0, vite 6.1.0, vitest 3.0.5, typescript 5.7.3, @playwright/test 1.51.1. La instalación usa el lockfile. La publicación y elección de hosting son trabajos separados; el build no supone un despliegue. Estas versiones aprobadas tienen avisos de seguridad en npm audit; no se han sustituido ni aplicado actualizaciones automáticas.

## Controles y preparación

Haz clic en cualquiera de las nueve salas para leer o actuar. Cierra el panel para volver al corte de la base. Explorar no avanza el reloj. Diseño ofrece Equilibrada, Potente y Reforzada; cada perfil muestra estadísticas y costo. Calcular trayectoria requiere diseño. Rediseñar antes de cargar vuelve a pagar e invalida la trayectoria. Meteorología muestra toda la tabla fija del pronóstico. Ingeniería y el panel inferior permiten reparar bomba y antena. Combustible transfiere inventario a la nave; Almacén muestra lo que queda y lo que está a bordo. Sistemas muestra cinco checks y permite revisión formal. Pasillo y Observación son descriptivos, sin consumo ficticio.

Los botones −/+ editan el borrador de ángulo entre 45 y 90°. Confirmar ángulo tarda 5 minutos de juego; recomendado 72° ±2°. Los estimados muestran claramente el borrador; el despegue usa el ángulo confirmado (72 inicial cuando aún no se confirmó). Seleccionar, leer y editar borradores no cuesta tiempo.

Todas las acciones muestran costo, duración y efectos antes de confirmar. Las reparaciones y carga tardan 2 segundos reales y solo al terminar aplican sus minutos de juego. No admiten cancelación ni tareas paralelas. La carga tarda 30 minutos con bomba reparada o 40 sin reparar. Esperar ofrece 5, 10 o 20 minutos sin costo material. Una acción que supera las 11:00 avisa antes de confirmarla y termina en fallo por tiempo.

### Bloqueos frente a riesgos

Los bloqueos impiden lanzar: falta de diseño, trayectoria o carga, hora antes de 10:00, después de 11:00, tarea en curso o partida terminada. Los motivos son accesibles aunque el botón esté deshabilitado.

Los riesgos permiten lanzar, pero causan fallo: ángulo fuera de 70–74°, bomba sin reparar (76 %), antena sin reparar (68 %), clima desfavorable y combustible estimado mayor al embarcado. El resultado enumera todas las causas, no una al azar. No consultar clima, no confirmar el ángulo inicial o no verificar no son riesgos por sí solos.

Si hiciste verificaciones y hay riesgos, Lanzar abre un aviso con Cancelar y Lanzar de todos modos. Cancelar no cambia el estado. Confirmar revalida el estado actual. Sin verificaciones no aparece esa segunda confirmación, y el resultado igualmente explica los riesgos. Sin riesgos, lanzar produce éxito dentro de la ventana inclusive 10:00–11:00.

Las cuatro fases son orientativas: Planificación (diseño/trayectoria/clima), Preparación (reparaciones/carga/ángulo), Verificaciones y Lanzamiento. El checklist distingue objetivos cumplidos de condiciones de éxito. Puedes ganar con objetivos no realizados si no hay bloqueos ni riesgos. Estado General Recursos mide inventario restante, no aptitud para lanzar.

### Pronóstico y fórmulas

| Horario | Viento | Lluvia | Nubes |
|---|---|---|---|
| 08:30–09:59 | 12 km/h | 0 % | 18 % |
| 10:00–10:39 | 20 km/h | 0 % | 25 % |
| 10:40–11:00 | 45 km/h | 0 % | 40 % |

Desfavorable si viento >40 o lluvia >30; nubes informativas. Esperar no genera azar. Consumo = base del perfil + 1.000 × abs(ángulo −72) L; tiempo a órbita = base + 0,1 × diferencia. No es física orbital real.

El puntaje congela las métricas de preparación antes del lanzamiento o al perder la ventana:

- Presupuesto: `floor(400 × presupuesto / 1.000.000)`.
- Repuestos: `floor(200 × repuestos / 50)`.
- Tiempo: `floor(250 × clamp((660 − minuto) / 60, 0, 1))`.
- Precisión: `round(150 × clamp(1 − abs(ángulo −72) / 18, 0, 1))`.

En éxito se suman los cuatro componentes (0–1.000). En fallo se muestran como diagnóstico, pero el total final es 0. El tiempo de animación a órbita no altera el puntaje.

Referencia ganadora: Equilibrada, trayectoria, clima, bomba, antena, carga, 72°, verificar y lanzar a 10:20. Quedan $640.000 y 35 repuestos. Puntaje 256 + 140 + 166 + 150 = 712. Lanzamiento exitoso de 7 segundos; fallo de 4 segundos. Reiniciar reconstruye el estado inicial y elimina tareas, avisos, animaciones y callbacks de la partida anterior.

## Organización, arte y pruebas

- API reglas v1: `src/rules/index.ts`, tipos y funciones públicas `createInitialState`, `previewAction`, `applyAction`, `getView`, `evaluateLaunch`, `getScore`.
- Cinco escenas reales: `src/game/scenes.ts` (BootScene, BaseScene, UIScene, LaunchScene, ResultScene).
- Propietario exclusivo de tareas/avisos: `src/game/Session.ts`.
- Assets v1 y procedencia: [docs/assets.md](docs/assets.md). PNG originales, generador reproducible, sin material de terceros. No se afirma haber visto la imagen adjunta.
- Tests: `tests/rules/`, `tests/assets/`, `tests/game/`, `tests/e2e/`. Chromium usa el motor real y los controles; no sustituye reglas con mocks. Capturas en `test-results/` (base 1600×900/1280×720, ascenso y resultado).

La meta de duración humana de 10–15 minutos queda pendiente: no hay medición real con una persona. Las pruebas automatizadas no validan esa meta ni sustituyen la revisión visual humana de las capturas.

Exclusiones: otros niveles, guardado, audio, soporte móvil garantizado, cuentas, multijugador, backend, publicación y simulación física realista. Escritorio 16:9 con escala FIT de 1600×900; se comprueban 1600×900 y 1280×720.
