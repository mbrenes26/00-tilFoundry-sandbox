---
id: "issue-2/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec de solución: saludo con rutas de alcance entre comillas invertidas"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "d91154ef78e925e24ee5cb5bc02a5a6da13f2cd8", "modelo": "gpt-6.1-sol"}
---
# Solución: issue-2 — Función de saludo

## Necesidad y resultado
Crear desde cero una pequeña librería Python que devuelva un saludo por nombre, con pruebas mediante pytest. Discovery confirmado por la persona en el issue #2. Riesgo declarado por Core: medium. No se construye hasta la aprobación de esta spec.

## Cerebro consultado
Se consultó el registro `cerebro`: no existe. No hay decisiones vigentes disponibles que se puedan presuponer. El inventario contiene únicamente `README.md` y la persona confirmó que es un desarrollo desde cero.

## Decisiones para el cerebro
Propuestas sujetas a aprobación: Python y pytest; interfaz `saludar(nombre: str) -> str` en el módulo raíz `saludo.py`; una sola línea de producto. No se reemplaza ninguna decisión vigente conocida.

## Corrección solicitada
La línea de alcance lleva exclusivamente rutas entre comillas invertidas, separadas por comas. Las prohibiciones están en Exclusiones. No cambia el comportamiento ni se amplía el conjunto de archivos.

# Línea: saludo

## Objetivo
Implementar una función pura que devuelva el saludo esperado y verificarla con pruebas automatizadas.

Alcance: `saludo.py`, `tests/test_saludo.py`, `requirements-dev.txt`

## Interfaz y comportamiento
- Interfaz pública: `from saludo import saludar`; firma `saludar(nombre: str) -> str`.
- El contrato admite cadenas de Python.
- Si `nombre.strip()` es vacío, devolver exactamente `Hola, mundo!`.
- En otro caso, devolver exactamente `Hola, {nombre}!`, conservando el texto original sin recortarlo ni normalizarlo.
- Devolver texto sin imprimir ni producir efectos secundarios.
- Las entradas que no sean cadenas quedan fuera del contrato.

## Criterios de aceptación y pruebas
1. `saludar("Ana")` devuelve `Hola, Ana!`.
2. `saludar("")` devuelve `Hola, mundo!`.
3. `saludar("   ")` devuelve `Hola, mundo!`.
4. `saludar(" Ana ")` devuelve `Hola,  Ana !`, conservando los espacios originales.
5. `saludar("María José")` devuelve `Hola, María José!`, conservando acentos y espacios internos.
6. La función no escribe en salida estándar ni de errores; comprobarlo con la captura de pytest.
7. Tras instalar las dependencias de desarrollo, `python -m pytest` desde la raíz descubre las pruebas y termina correctamente.

## Estructura y dependencias
- Crear `saludo.py` con la función pública y documentación breve del contrato.
- Crear `tests/test_saludo.py` con pruebas de todos los criterios.
- Crear `requirements-dev.txt` con `pytest>=8,<9`.

## Verificación y evidencia requerida
Construir con TDD: registrar pruebas fallidas antes de implementar y correctas después, con comandos y salidas reales por criterio. El probador verificará independientemente todos los criterios. Comandos previstos: `python -m pip install -r requirements-dev.txt` y `python -m pytest`. Registrar la versión real de Python utilizada. No se han ejecutado pruebas en este paso.

## Exclusiones
No modificar, mover ni borrar `README.md` ni otros archivos existentes. No tocar `.github/`, la configuración de Foundry ni la del repositorio. No añadir dependencias de ejecución, empaquetado para publicación, interfaz de comandos, integración continua, validación de tipos no solicitados, traducciones ni funciones adicionales. No incluye migraciones, persistencia, red ni datos de producción.

## Contrato entre líneas
No aplica: hay una sola línea, que incluye función y pruebas.

## Entrega y aprobación
La entrega se limita a los tres archivos de Alcance, con evidencia por criterio en el PR. Si se necesita ampliar el alcance, detener el trabajo y consultar a la persona. Aprobar esta spec autoriza construir esos archivos con la interfaz y los comportamientos descritos; no aprueba la entrega final.