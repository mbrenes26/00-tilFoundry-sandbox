# Guía de TIL Foundry

Esta guía explica cómo trabajar con TIL Foundry en `mbrenes26/00-tilFoundry-sandbox`. La mantiene TIL Foundry: si se borra o se
cambia, la vuelve a escribir. Si algo de lo que hace TIL Foundry no coincide con esta guía, es un error:
avísale a TIL Costa Rica.

## Cómo hacer un pedido

1. Abre un issue que describa lo que necesitas, con tus palabras.
2. Escribe `/factory` en un comentario de ese issue.
3. El Manager de producto de TIL Foundry te va a escribir en el mismo issue: te hace preguntas hasta
   entender la necesidad y te propone una spec, que dice qué se construye y cómo se sabe que está bien.
4. Si estás de acuerdo con la spec, apruébala con el comando que te indica el mensaje. Nada se construye sin
   tu aprobación.
5. TIL Foundry construye con pruebas, abre un PR y lo auditan los agentes de seguridad y de código, y los de
   UX y UI si cambia la interfaz.
6. Cuando la auditoría pasa, decides la entrega. Al aprobarla, TIL Foundry fusiona el PR y cierra el issue.

Todo lo que escribe un agente aparece como `til-foundry[bot]`; lo que decides tú queda firmado con tu
cuenta.

## Quién hace qué

TIL Foundry es una fábrica con una jerarquía fija, y la hace cumplir Core, no la buena voluntad de un
agente. Cada agente tiene solo las herramientas de su rol y decide un paso por vez; lo que no le toca,
Core lo rechaza. Solo el Manager de producto y el Manager de Auditoría te hablan para pedirte una decisión.

| Quién | Qué hace | Qué no puede hacer |
|---|---|---|
| Persona (tú) | Decides siempre tú: Aprobar la spec. Aprobar o rechazar la entrega. Desbloquear un pedido. Aceptar o no un cambio de alcance. | Nada se construye ni se fusiona sin tu decisión, y tu silencio nunca cuenta como aprobación. |
| Manager de producto (`manager-producto`) | Conversa contigo en el issue, escribe la spec y dirige la construcción con el constructor y el probador. Abre el PR. | No decide la entrega ni cambia el alcance sin ti. |
| Constructor (`constructor`) | Escribe el código con pruebas (TDD), dentro del alcance de la spec, en una sesión aislada. | No habla contigo ni pide cambios de estado. |
| Probador (`probador`) | Intenta romper lo construido y escribe pruebas que demuestran las fallas. | No escribe código de producción. |
| Auditores de seguridad y de código (`seguridad`, `codigo`) | Revisan cada PR, cada uno por su lado y con un modelo distinto del que construyó. | No comentan, no cambian archivos ni deciden la entrega. |
| Auditores de UX y UI (`ux`, `ui`) | Revisan la experiencia y la interfaz cuando el cambio la toca, según lo que fija la spec. | No comentan, no cambian archivos ni deciden la entrega. |
| Manager de Auditoría (`manager-auditoria`) | Junta los informes y decide, solo entre lo que Core permite: pedirte la entrega, retrabajo o escalarte. | No construye ni puede saltarse a los auditores. |

Lo que deciden las reglas lo calcula Core con código, no un agente: qué auditores corren, el riesgo, si
se puede entregar y qué archivos entran en el alcance.

## Comandos

| Comando | Dónde | Quién | Qué hace |
|---|---|---|---|
| `/factory` | En el issue de tu pedido | Una persona con permiso de escritura | Empieza el pedido: el Manager de producto te escribe en ese issue |
| `/foundry approve issue-<n> <ESTADO>` | En el issue del pedido | Una persona con permiso de escritura | Aprueba lo que TIL Foundry te pidió; el mensaje te dice exactamente qué escribir |
| `/foundry reject issue-<n> <ESTADO>` | En el issue del pedido | Una persona con permiso de escritura | Lo rechaza; si es la entrega, TIL Foundry corrige lo que expliques en el comentario |
| `/foundry recheck` | En el issue "Instalación de TIL Foundry" | Una persona con permiso de escritura | Vuelve a revisar la configuración del repositorio; si no falta nada, cierra ese issue |

Cada comando va solo en su propia línea del comentario.

## Los estados de un pedido

| Estado | Qué significa | ¿Te toca hacer algo? |
|---|---|---|
| `REQUESTED` | Recibimos el pedido. | No |
| `DISCOVERING` | El Manager de producto conversa contigo en el issue para entender lo que necesitas y escribe la spec. | Sí: responde sus preguntas y, cuando la spec esté lista, apruébala o recházala |
| `ESCALATED` | Tal vez no hace falta software para lo que necesitas. | Sí: decide si seguimos |
| `SPECIFIED` | Aprobaste la spec; empieza la construcción. | No |
| `BUILDING` | El constructor escribe el código y sus pruebas en la rama `foundry/issue-<n>` y abre el PR. | No |
| `VERIFYING` | Los auditores revisan el PR: seguridad y código siempre, y UX y UI si cambia la interfaz. | No |
| `REWORK` | Los auditores pidieron cambios; el constructor los hace y se vuelve a auditar. | No |
| `AWAITING_APPROVAL` | La auditoría pasó y la entrega espera tu decisión. | Sí: aprueba o rechaza la entrega |
| `DELIVERED` | Entregado: TIL Foundry fusionó el PR y cerró el issue. | No |
| `BLOCKED` | No se puede seguir sin una decisión tuya; el issue explica cuál. | Sí: lo que diga el issue |
| `FAILED` | El pedido terminó sin éxito; el issue explica por qué y queda cerrado. | No |
| `CANCELLED` | El pedido se canceló y el issue quedó cerrado. | No |

## Aprobar y rechazar

- TIL Foundry te pide tu decisión en el issue del pedido, con el comando exacto que tienes que escribir.
- Tu aprobación vale para la versión exacta que se te mostró: si la spec o el código cambian después,
  TIL Foundry te la vuelve a pedir.
- Tu silencio nunca cuenta como aprobación.
- Si rechazas la entrega, explica en el mismo comentario qué hay que corregir.

## La memoria

La rama `foundry/memoria` guarda todo lo que la fábrica hace en este repositorio: la spec de cada pedido, tus
aprobaciones, los informes de auditoría y la bitácora de cada pedido. Solo la escribe TIL Foundry, no se borra
nada y nunca guarda un secreto. No la modifiques a mano: TIL Foundry reconstruye el estado de cada pedido
desde ahí.

## Configuración

- El issue "Instalación de TIL Foundry" dice qué hay que configurar en este repositorio. Cuando hagas un
  cambio, escribe `/foundry recheck` en ese issue para que TIL Foundry lo revise de nuevo.
- Para desinstalar TIL Foundry: en GitHub, **Settings** > **GitHub Apps** > **TIL Foundry** > **Configure** >
  **Uninstall**. La rama `foundry/memoria` y los issues se conservan.
