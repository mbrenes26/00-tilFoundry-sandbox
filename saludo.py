"""Saludos de texto sin efectos secundarios."""


def saludar(nombre: str) -> str:
    """Devuelve un saludo; usa 'mundo' si strip() queda vacío.

    Conserva íntegro el nombre no vacío. Solo admite cadenas.
    """
    if not nombre.strip():
        return "Hola, mundo!"
    return f"Hola, {nombre}!"
