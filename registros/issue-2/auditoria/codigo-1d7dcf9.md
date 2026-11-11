---
id: "issue-2/auditoria/codigo-1d7dcf9"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre 1d7dcf9: cambios"
version: 1
estado: "aprobado"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "1d7dcf93f72f8462131f818ac5816be635c484c7", "modelo": "gpt-6-astra"}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "1d7dcf93f72f8462131f818ac5816be635c484c7"}
---
# Auditoría de código — issue-2, PR #3
Commit de referencia proporcionado por Core: `1d7dcf93f72f8462131f818ac5816be635c484c7`.

## Resultado
**Cambios** por falta de evidencia verificable del rojo original del TDD exigido por la spec. No encontré defectos funcionales ni criterios de comportamiento sin pruebas.

## Criterio y alcance
Consulté `spec-solucion`, discovery y conversación. Core identifica la spec como aprobada; su registro conserva el encabezado «borrador». No existen registros `cerebro` ni `contrato`; la spec declara una sola línea y ningún contrato entre líneas. El diff solo añade `saludo.py`, `tests/test_saludo.py` y `requirements-dev.txt`, dentro del alcance. No modifica Foundry ni archivos existentes.

## Hallazgo bloqueante
**COD-1 — Falta evidencia accesible del rojo anterior a implementar.** La sección «Verificación y evidencia requerida» exige pruebas fallidas antes de implementar y correctas después, con comandos y salidas reales por criterio; no contempla excepción. La conversación consultada no contiene ejecuciones originales publicadas por Core que acrediten ese rojo. Los registros `evidencia` e `informe-pruebas` devuelven «No existe». El comentario de Core de 2026-11-11 a las 13:10:44 también identifica esta evidencia como pendiente. El resultado verde obtenido en esta auditoría no acredita la secuencia histórica.

Corrección requerida: recuperar y hacer accesible la evidencia original registrada por Core, con sus comandos, resultados y vinculación a las pruebas, e incluir sus referencias de rojo y verde en el PR. Si no existe, declararlo expresamente al Manager para que gestione una decisión humana sobre la exigencia de la spec; no presentar una ejecución fallida posterior como TDD original. No hace falta alterar la función para resolver este hallazgo documental.

## Cobertura y evidencia funcional
- Criterios 1–5: `saludo.py:9-11` implementa el caso vacío mediante `strip()` y conserva el nombre original en los demás casos. `tests/test_saludo.py:4-17` verifica exactamente Ana, cadena vacía, solo espacios, espacios exteriores y María José. Pasaron los cinco casos parametrizados.
- Criterio 6: `tests/test_saludo.py:20-28` llama a la función con los cinco casos y comprueba stdout y stderr mediante `capsys`. Pasó.
- Criterio 7: `requirements-dev.txt:1` contiene `pytest>=8,<9`. Ejecuté desde la raíz `python -m pip install -r requirements-dev.txt && python -m pytest -v && python -m pytest`: salida 0; ambas ejecuciones dieron `6 passed in 0.02s`, con Python 3.12.16 y pytest 8.4.2.
- La firma pública y documentación están en `saludo.py:4-7`. No observé código muerto, duplicación innecesaria ni efectos secundarios; las entradas que no son cadenas quedan fuera del contrato.

## Límites de comprobación
La primera ejecución no pudo iniciar pytest porque no estaba instalado; se resolvió instalando las dependencias aprobadas. Ese fallo de entorno no es evidencia del rojo del TDD. La sesión no contiene `.git`, por lo que no pude verificar allí el hash; sus archivos coinciden con el diff entregado por Core. La herramienta de cambios no expone el cuerpo ni los checks del PR y no hay herramienta específica disponible para consultarlos: no afirmo que los checks estén verdes ni que el cuerpo carezca de referencias. El Manager debe obtener esos datos junto con la evidencia original. La plantilla `plantillas/informe-auditoria.md` no está disponible en la rama.

## Sugerencias
Ninguna adicional. No modifiqué archivos del proyecto ni solicité transiciones.