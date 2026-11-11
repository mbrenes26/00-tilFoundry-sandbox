import pytest


@pytest.mark.parametrize(
    ("nombre", "esperado"),
    [
        pytest.param("Ana", "Hola, Ana!", id="ana"),
        pytest.param("", "Hola, mundo!", id="vacio"),
        pytest.param("   ", "Hola, mundo!", id="solo-espacios"),
        pytest.param(" Ana ", "Hola,  Ana !", id="espacios-originales"),
        pytest.param("María José", "Hola, María José!", id="acentos"),
    ],
)
def test_saludar(nombre, esperado):
    from saludo import saludar

    assert saludar(nombre) == esperado


def test_saludar_no_escribe_en_stdout_ni_stderr(capsys):
    from saludo import saludar

    for nombre in ("Ana", "", "   ", " Ana ", "María José"):
        saludar(nombre)

    captura = capsys.readouterr()
    assert captura.out == ""
    assert captura.err == ""
