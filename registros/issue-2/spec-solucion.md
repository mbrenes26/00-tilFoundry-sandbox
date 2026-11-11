---
id: "issue-2/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec de solución: función de saludo con alcance corregido"
version: 1
estado: "borrador"
solucion: "issue-2"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "c0e9e426f62c1ae78d92d9ea221c979f07ff282b", "modelo": "gpt-6.1-sol"}
---
# Solución: issue-2 — Función de saludo

## Necesidad y resultado
Crear una pequeña librería de Python desde cero con una función que reciba un nombre y devuelva un saludo, con pruebas automatizadas mediante pytest. Discovery confirmado en el issue #2. Riesgo declarado por Core: medium. Esta propuesta no autoriza construir hasta que se registre la aprobación.

## Cerebro consultado
Se consultó el registro `cerebro` en esta ejecución: no existe. No se presuponen decisiones vigentes. El inventario contiene únicamente `README.md`; la persona confirmó que el desarrollo es desde cero.

## Decisiones para el cerebro
Propuestas sujetas a aprobación: Python y pytest, según el pedido; interfaz `saludar(nombre: str) -> str` en el módulo raíz `saludo.py`; una sola línea de producto. No se reemplaza ninguna decisión vigente conocida.

## Corrección solicitada
Tras el rechazo de la propuesta anterior, la línea `Alcance:` contiene únicamente las rutas permitidas. Las prohibiciones se trasladan a Exclusiones. No cambia el comportamiento ni se amplía el conjunto de archivos propuesto.

# Línea: saludo

## Objetivo
Implementar una función pura que devuelva el saludo esperado y demostrar su comportamiento con pruebas automatizadas independientes.

Alcance: saludo.py, tests/test_saludo.py, requirements-dev.txt

## Interfaz y comportamiento
- Interfaz pública: `from saludo import saludar`; firma `saludar(nombre: str) -> str`.
- Las entradas del contrato son cadenas de Python.
- Si `nombre.strip()` es vacío, devolver exactamente `Hola, mundo!`.
- En otro caso, devolver exactamente `Hola, {nombre}!`, conservando el nombre original sin recortar ni normalizar.
- Devolver texto sin imprimir ni producir efectos secundarios.
- Las entradas que no sean cadenas quedan fuera del contrato; no se exige validación ni comportamiento para ellas.

## Criterios de aceptación y pruebas
1. `saludar("Ana")` devuelve `Hola, Ana!`: prueba de nombre normal.
2. `saludar("")` devuelve `Hola, mundo!`: prueba de cadena vacía.
3. `saludar("   ")` devuelve `Hola, mundo!`: prueba de espacios únicamente.
4. `saludar(" Ana ")` devuelve `Hola,  Ana !`: prueba de conservación exacta de espacios alrededor.
5. `saludar("María José")` devuelve `Hola, María José!`: prueba de caracteres y espacios internos.
6. La función no escribe en salida estándar ni de errores: verificar mediante la captura de pytest.
7. Tras instalar la dependencia de desarrollo, `python -m pytest` desde la raíz descubre las pruebas y finaliza correctamente.

## Estructura y dependencias
- Crear `saludo.py` con la función pública y documentación breve del contrato.
- Crear `tests/test_saludo.py` con pruebas de todos los criterios.
- Crear `requirements-dev.txt` declarando `pytest>=8,<9`.

## Verificación y evidencia requerida
El constructor trabajará con TDD, registrando las pruebas fallidas antes de implementar y las correctas después, con comandos y salidas reales. El probador verificará independientemente todos los criterios. Comandos propuestos: `python -m pip install -r requirements-dev.txt` y `python -m pytest`. Registrar la versión real de Python utilizada. No se han ejecutado pruebas ni existen resultados en este paso.

## Exclusiones
No modificar, mover ni borrar `README.md` ni otros archivos existentes. No tocar `.github/`, la configuración de Foundry ni la configuración del repositorio. No añadir dependencias de ejecución, empaquetado para publicación, interfaz de comandos, integración continua, validaciones para tipos no solicitados, traducciones ni funciones adicionales. Sin migraciones, persistencia, red ni datos de producción.

## Contrato entre líneas
No aplica: una sola línea incluye función y pruebas.

## Entrega y aprobación
La entrega se limita a los tres archivos enumerados en Alcance, con evidencia por criterio en el PR. Si hace falta ampliar el alcance, se detiene el trabajo y se consulta con la persona. Aprobar esta spec autoriza construir la interfaz, los archivos y los comportamientos descritos; no aprueba la entrega final.