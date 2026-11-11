package pruebas.globalinvoice.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import pruebas.globalinvoice.soporte.Usuarios;

/**
 * Protección contra fuerza bruta: el login admite 5 intentos por minuto por IP.
 * Va al final de la suite porque deja el login bloqueado durante un minuto.
 */
@Tag("api")
@Order(13)
@DisplayName("API: seguridad")
class SeguridadApiTest {

    private static final int MAX_INTENTOS = 6;

    @Test
    @DisplayName("CP-R23 Los intentos de login repetidos se bloquean con 429 antes del sexto")
    void limiteDeIntentos() {
        ClienteApi api = new ClienteApi();
        List<Integer> codigos = new ArrayList<>();

        // Se repite hasta recibir 429; así no importa cuántos logins hubo antes en la misma ventana.
        for (int intento = 1; intento <= MAX_INTENTOS; intento++) {
            int codigo = api.login(Usuarios.operador().usuario(), "IntentoFuerzaBruta1").codigo();
            codigos.add(codigo);
            if (codigo == 429) {
                break;
            }
        }

        assertThat(codigos).as("códigos recibidos: " + codigos).allMatch(c -> c == 401 || c == 429);
        assertThat(codigos).as("debe aparecer 429 en %d intentos o menos", MAX_INTENTOS).contains(429);
    }
}
