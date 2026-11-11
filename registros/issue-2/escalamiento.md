---
id: "issue-2/escalamiento"
tipo: "escalamiento"
titulo: "Excepción aceptada para COD-1: continuar sin evidencia histórica del rojo"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "4c46cccbca8a93d5ab4b7568377656edab543853", "modelo": "gpt-6.1-sol"}
---
Trabajo: issue-2. Estado proporcionado por Core: BLOCKED. PR #3, commit vigente 1d7dcf93f72f8462131f818ac5816be635c484c7.

Decisión humana: el 2026-11-11 a las 15:49:27Z, mbrenes26 respondió «Acepto la excepción» a la pregunta de Core de las 15:16:44Z sobre continuar sin la evidencia histórica de pruebas fallidas antes de implementar, conservando las pruebas actuales y su resultado correcto.

Excepción a la spec-solucion: exclusivamente para este trabajo, se dispensa aportar el rojo histórico original en «Verificación y evidencia requerida» y las referencias al rojo por criterio en la entrega. Se mantiene la exigencia de evidencia real de las pruebas correctas y de verificación independiente. No se modifica el comportamiento, los siete criterios de aceptación, dependencias, exclusiones ni el alcance aprobado: saludo.py, tests/test_saludo.py y requirements-dev.txt. No constituye aprobación de entrega ni una excepción general al TDD.

Evidencia disponible: la publicación de Core del 2026-11-11 a las 15:16:56Z registra instalación de dependencias, Python 3.12.16, pytest 8.4.2 y seis pruebas correctas mediante python -m pytest -v y python -m pytest. Los intentos de consultar historial fallaron porque la sesión carecía de .git. No se recuperó evidencia original del rojo; esto no demuestra que nunca existiera. No presentar fallos de entorno ni pruebas fallidas posteriores como rojo original.

Auditoría vigente: seguridad sin bloqueantes; código identifica únicamente COD-1, falta de evidencia histórica, y no detecta defectos funcionales. Su corrección admite gestionar una decisión humana sobre el requisito.

Siguiente paso solicitado: REWORK para resolver documentalmente COD-1 en el mismo PR #3, incorporando esta excepción en «Desviación de la spec» y las referencias a la evidencia verde publicada por Core, y preparar nueva revisión. No hacen falta cambios funcionales. Esta ejecución no dispone de herramienta para editar el cuerpo del PR; queda pendiente, no se declara realizada. La entrega permanece sujeta a revisión y aprobación posterior.