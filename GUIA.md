# Guía de TIL Foundry

Esta guía explica cómo trabajar con TIL Foundry en `mbrenes26/00-tilFoundry-sandbox`. La mantiene TIL Foundry: si se borra o se
cambia, la vuelve a escribir. Si algo de lo que hace TIL Foundry no coincide con esta guía, es un error:
avísale a TIL Costa Rica.

## Cómo hacer un pedido

1. Presiona [Abrir un pedido](https://github.com/mbrenes26/00-tilFoundry-sandbox/issues/new?template=pedido.yml), llena el formulario corto (qué necesitas, para quién
   es y cómo sabrás que quedó bien) y publícalo: el pedido empieza solo.
2. Si el formulario no aparece, tu repositorio todavía no tiene la plantilla de pedido: se aprueba con
   `/foundry approve template` en el issue "Instalación de TIL Foundry". Mientras tanto, abre un issue que
   describa lo que necesitas, con tus palabras, y escribe `/foundry start` en un comentario de ese issue.
3. TIL Foundry te va a escribir en el mismo issue: te hace preguntas hasta entender la necesidad y te
   propone un plan, que dice qué se construye y cómo se sabe que está bien.
4. Si estás de acuerdo con el plan, apruébalo con el comando que te indica el mensaje. Nada se construye sin
   tu aprobación.
5. TIL Foundry construye con pruebas y prepara la entrega, que en GitHub se llama *pull request*. Una revisión
   independiente revisa la seguridad y el código, y la experiencia de uso y la interfaz si cambia lo que ves.
6. Cuando la revisión independiente pasa, decides la entrega. Al aceptarla, TIL Foundry la incorpora a tu
   repositorio y cierra el issue.

Todo lo que escribe un agente aparece como `til-foundry[bot]`; lo que decides tú queda firmado con tu
cuenta.

### Mientras conversas

- **Fuentes:** si quieres que TIL Foundry use esta guía, la memoria (`LEEME.md`) o un issue de este
  repositorio, dilo en tu pedido y menciona el issue con su número, por ejemplo «usa el #1 como fuente».
  TIL Foundry lo lee; no hace falta que lo pegues. Solo lee los issues que tú mencionas.
- **Imágenes y documentos:** adjúntalos en el issue de tu pedido (arrastrándolos al comentario), también si
  el repositorio es privado. TIL Foundry los descarga y los usa; no hace falta subirlos a otro lado.
- **Decisiones:** si algo se traba, TIL Foundry no te pide investigar: te trae opciones numeradas (la
  solución que recomienda, ya verificada, una provisional si hace falta, o detener), cada una con lo que
  cambia en el presupuesto y en el plazo. Respondes con el número de la opción.

## Quién hace qué

TIL Foundry es una fábrica con una jerarquía fija, y la hace cumplir Core, no la buena voluntad de un
agente. Cada agente tiene solo las herramientas de su rol y decide un paso por vez; lo que no le toca,
Core lo rechaza. Solo el Manager de producto y el Manager de Auditoría te hablan para pedirte una decisión.

| Quién | Qué hace | Qué no puede hacer |
|---|---|---|
| Persona (tú) | Decides siempre tú: Aprobar el plan. Aprobar o rechazar la entrega. Desbloquear un pedido. Aceptar o no un cambio de alcance. | Nada se construye ni se fusiona sin tu decisión, y tu silencio nunca cuenta como aprobación. |
| Manager de producto (`manager-producto`) | Conversa contigo en el issue, escribe el plan y dirige la construcción con el constructor y el probador. Abre el PR. | No decide la entrega ni cambia el alcance sin ti. |
| Constructor (`constructor`) | Escribe el código con pruebas (TDD), dentro del alcance del plan, en una sesión aislada. | No habla contigo ni pide cambios de estado. |
| Probador (`probador`) | Intenta romper lo construido y escribe pruebas que demuestran las fallas. | No escribe código de producción. |
| Auditores de seguridad y de código (`seguridad`, `codigo`) | Revisan cada PR, cada uno por su lado y con un modelo distinto del que construyó. | No comentan, no cambian archivos ni deciden la entrega. |
| Auditores de UX y UI (`ux`, `ui`) | Revisan la experiencia y la interfaz cuando el cambio la toca, según lo que fija el plan. | No comentan, no cambian archivos ni deciden la entrega. |
| Manager de Auditoría (`manager-auditoria`) | Junta los informes y decide, solo entre lo que Core permite: pedirte la entrega, retrabajo o escalarte. | No construye ni puede saltarse a los auditores. |
| Feedback Loop (`feedback-loop`) | Al terminar el pedido, o si Core detecta que se trabó, escribe una retrospectiva y te deja en el issue lo que convendría fijar en tu próximo pedido. | No decide nada del pedido: ni cambia archivos ni pide cambios de estado. Lo que propone a TIL va sin datos tuyos. |

Lo que deciden las reglas lo calcula Core con código, no un agente: qué auditores corren, el riesgo, si
se puede entregar y qué archivos entran en el alcance.

## Comandos

| Comando | Dónde | Quién | Qué hace |
|---|---|---|---|
| `/foundry start` | En el issue de tu pedido | Una persona con permiso de escritura | Empieza el pedido: TIL Foundry te escribe en ese issue |
| `/foundry approve issue-<n> <ESTADO>` | En el issue del pedido | Una persona con permiso de escritura | Aprueba lo que TIL Foundry te pidió; el mensaje te dice exactamente qué escribir (por ejemplo, `/foundry approve issue-7 SPECIFIED` aprueba el plan y `/foundry approve issue-7 DELIVERED` acepta la entrega) |
| `/foundry reject issue-<n> <ESTADO>` | En el issue del pedido | Una persona con permiso de escritura | Lo rechaza; si es la entrega, TIL Foundry corrige lo que expliques en el comentario |
| `/foundry budget issue-<n> <monto>` | En el issue del pedido | Una persona con permiso de escritura | Aprueba más presupuesto de construcción, en USD (por ejemplo `/foundry budget issue-7 5`); si el pedido estaba detenido por presupuesto, sigue. Con `=` reajusta el total aprobado, mayor o menor (por ejemplo `/foundry budget issue-7 = 16`) |
| `/foundry rate <puntaje> [comentario]` | En el issue del pedido | Una persona con permiso de escritura | Responde a la pregunta de satisfacción que te hace TIL Foundry al aprobar el plan (del 1 al 5) y al entregar (del 0 al 10). Es opcional |
| `/foundry rate price <1-3>` y `/foundry rate value <1-3>` | En el issue del pedido | Una persona con permiso de escritura | Responden las dos preguntas opcionales que te hace TIL Foundry al entregar: cómo te pareció el precio (1 barato, 2 justo, 3 caro) y qué fue para tu negocio (1 algo pequeño, 2 algo importante, 3 algo muy importante) |
| `/foundry recheck` | En el issue "Instalación de TIL Foundry" | Una persona con permiso de escritura | Vuelve a revisar la configuración del repositorio; si no falta nada, cierra ese issue |
| `/foundry approve template` | En el issue "Instalación de TIL Foundry" | Una persona con permiso de escritura | Agrega la plantilla de pedido a tu repositorio: desde ahí abres un pedido llenando un formulario corto, y empieza solo |
| `/foundry support <mensaje>` | En cualquier issue de tu repositorio | Una persona con permiso de escritura | Le escribe al equipo de TIL Foundry (por ejemplo, si algo no avanza o quieres hablar con una persona); te responde en ese mismo issue. No cambia tu pedido ni gasta su presupuesto |

Cada comando va solo en su propia línea del comentario.

## Los estados de un pedido

| Etapa | Qué significa | ¿Te toca hacer algo? |
|---|---|---|
| Recibimos tu pedido | TIL Foundry recibió tu pedido. | No |
| Entendiendo lo que necesitas | TIL Foundry conversa contigo en el issue para entender lo que necesitas y te propone un plan. | Sí: responde sus preguntas y, cuando el plan esté listo, apruébalo o recházalo |
| Tal vez no hace falta software: te toca decidir | Tal vez no hace falta software para lo que necesitas. | Sí: decide si seguimos |
| Plan aprobado: preparando la construcción | Aprobaste el plan; empieza la construcción. | No |
| Construyendo | TIL Foundry escribe el código y sus pruebas, paso a paso, en la rama `foundry/issue-<n>` y prepara la entrega. | No |
| Revisión independiente | La revisión independiente revisa la entrega: la seguridad y el código siempre, y la experiencia de uso y la interfaz si cambia lo que ves. | No |
| Corrigiendo lo que encontró la revisión | La revisión independiente pidió cambios; TIL Foundry los hace y la entrega se vuelve a revisar. | No |
| Tu entrega está lista para que la revises | La entrega pasó la revisión independiente y espera tu decisión. | Sí: acepta o rechaza la entrega |
| Entregado | TIL Foundry incorporó la entrega a tu repositorio y cerró el issue. | No |
| En pausa: necesitamos una decisión tuya | No se puede seguir sin una decisión tuya; el issue explica cuál. | Sí: lo que diga el issue |
| No se pudo terminar | El pedido terminó sin poder completarse; el issue explica por qué y queda cerrado. | No |
| Cancelado | El pedido se canceló y el issue quedó cerrado. | No |

En los comandos, la etapa se escribe con su nombre en inglés, tal como te lo indica el mensaje: por ejemplo,
`/foundry approve issue-<n> SPECIFIED` aprueba el plan y `/foundry approve issue-<n> DELIVERED` acepta la entrega.

## Aprobar y rechazar

- TIL Foundry te pide tu decisión en el issue del pedido, con el comando exacto que tienes que escribir.
- Tu aprobación vale para la versión exacta que se te mostró: si el plan o el código cambian después,
  TIL Foundry te la vuelve a pedir.
- Tu silencio nunca cuenta como aprobación.
- Si rechazas la entrega, explica en el mismo comentario qué hay que corregir.

## Tu opinión

Al aprobar el plan y al entregar el pedido, TIL Foundry te hace una pregunta corta. Responder es opcional:
escribe `/foundry rate` con tu puntaje y, si quieres, un comentario. Al entregar te hace dos más, también
opcionales: cómo te pareció el precio (`/foundry rate price`, del 1 al 3) y qué fue para tu negocio
(`/foundry rate value`, del 1 al 3). Para mejorar, TIL Foundry también mide el
tono de tus comentarios en el issue (positivo, neutro o frustrado). Nunca guarda el texto fuera del issue:
solo esa etiqueta y tu puntaje.

## Hablar con el equipo de TIL Foundry

Si algo no avanza, no te convence una respuesta o quieres hablar con una persona, escribe `/foundry support`
seguido de tu mensaje, en cualquier issue de este repositorio. Te damos un número de caso y el equipo de TIL
Foundry te responde en ese mismo issue. Pedir soporte no cambia tu pedido ni gasta su presupuesto. No incluyas
contraseñas ni claves en el mensaje.

## La memoria

La rama `foundry/memoria` guarda todo lo que la fábrica hace en este repositorio: el plan de cada pedido, tus
aprobaciones, los informes de auditoría y la bitácora de cada pedido. Solo la escribe TIL Foundry, no se borra
nada y nunca guarda un secreto. No la modifiques a mano: TIL Foundry reconstruye el estado de cada pedido
desde ahí.

## Configuración

- El issue "Instalación de TIL Foundry" dice qué hay que configurar en este repositorio. Cuando hagas un
  cambio, escribe `/foundry recheck` en ese issue para que TIL Foundry lo revise de nuevo.
- Para desinstalar TIL Foundry: en GitHub, **Settings** > **GitHub Apps** > **TIL Foundry** > **Configure** >
  **Uninstall**. La rama `foundry/memoria` y los issues se conservan.
