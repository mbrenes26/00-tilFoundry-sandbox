---
id: "issue-2/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec de solución: función de saludo con pytest"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "4ed1d392d4161a621d08a814841e4a3800ab5b61", "modelo": "gpt-6.1-sol"}
---
# Solución: issue-2 — Función de saludo

## Necesidad y resultado
Crear una pequeña librería de Python desde cero con una función que reciba un nombre y devuelva un saludo. El discovery fue confirmado en el issue #2. Riesgo declarado por Core: medium. Esta spec es una propuesta pendiente de aprobación; no autoriza implementación todavía.

## Cerebro consultado
Se consultó el registro `cerebro`: no existe. No se presuponen decisiones de arquitectura o convenciones vigentes. El inventario contiene únicamente `README.md`; el proyecto es greenfield confirmado por la persona.

## Decisiones para el cerebro
Propuestas sujetas a aprobación de esta spec: usar Python y pytest; exponer `saludar(nombre: str) -> str` desde un módulo `saludo.py` en la raíz; usar una única línea de producto. Python y pytest corresponden a lo solicitado por la persona. No se propone reemplazar ninguna decisión vigente.

# Línea: saludo

## Objetivo
Implementar una función pura que devuelva el saludo esperado y demostrar su comportamiento con pruebas automatizadas independientes.

Alcance: crear exclusivamente `saludo.py`, `tests/test_saludo.py` y `requirements-dev.txt`. No modificar, mover ni borrar `README.md` ni otros archivos existentes. No tocar `.github/` ni configuración de Foundry.

## Interfaz y comportamiento
- Interfaz pública: `from saludo import saludar`; firma `saludar(nombre: str) -> str`.
- Entrada dentro del contrato: cadenas de Python.
- Si `nombre.strip()` es vacío, devolver exactamente `Hola, mundo!`.
- En otro caso, devolver exactamente `Hola, {nombre}!`, conservando el nombre original sin recortar ni normalizar.
- Devolver el texto, sin imprimirlo ni producir efectos secundarios.
- Las entradas que no sean cadenas quedan fuera del contrato; no se exige validación ni comportamiento para ellas.

## Criterios de aceptación y pruebas
1. `saludar("Ana")` devuelve `Hola, Ana!`. Prueba automatizada del nombre normal.
2. `saludar("")` devuelve `Hola, mundo!`. Prueba de cadena vacía.
3. `saludar("   ")` devuelve `Hola, mundo!`. Prueba de espacios únicamente.
4. `saludar(" Ana ")` devuelve `Hola,  Ana !`. Prueba de conservación exacta de espacios en un nombre no vacío.
5. `saludar("María José")` devuelve `Hola, María José!`. Prueba de conservación de caracteres y espacios internos.
6. La función no escribe en la salida estándar ni en la salida de errores. Verificar con la captura de pytest.
7. `python -m pytest` desde la raíz descubre las pruebas y finaliza correctamente tras instalar la dependencia de desarrollo.

## Estructura y dependencias
- `saludo.py`: únicamente la función pública y documentación breve de su contrato.
- `tests/test_saludo.py`: pruebas de los criterios anteriores con pytest.
- `requirements-dev.txt`: declarar `pytest>=8,<9` como dependencia de pruebas.
- No añadir dependencias de ejecución, empaquetado para publicación ni interfaz de comandos.

## Verificación y evidencia requerida
El constructor trabajará con TDD, registrando pruebas fallidas antes de implementar y pruebas correctas después, con comandos y salidas reales. El probador verificará de forma independiente todos los criterios. Comandos propuestos: `python -m pip install -r requirements-dev.txt` y `python -m pytest`. La versión de Python utilizada debe quedar registrada en la evidencia real. No se han ejecutado estos comandos ni se dispone aún de resultados.

## Exclusiones
Sin publicación de paquetes, instalación como paquete distribuible, integración continua nueva, modificación del README, validaciones para tipos no solicitados, traducciones ni funciones adicionales. No hay migraciones, persistencia, red ni datos de producción.

## Contrato entre líneas
No aplica: existe una sola línea que incluye función y pruebas.

## Entrega y aprobación
La entrega debe limitarse a los tres archivos del alcance, con evidencia por criterio en el PR. Cualquier necesidad de ampliar el alcance se detiene y se consulta con la persona. Aprobar esta spec autoriza construir la interfaz, los archivos y los comportamientos descritos; no equivale a aprobar la entrega final.