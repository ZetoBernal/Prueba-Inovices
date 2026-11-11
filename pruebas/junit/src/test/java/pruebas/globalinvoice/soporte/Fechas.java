package pruebas.globalinvoice.soporte;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

/**
 * Lectura tolerante de las fechas que devuelve .NET: con zona ("...Z" o "+00:00")
 * o sin ella (se asume UTC, que es como las guarda el backend).
 */
public final class Fechas {

    private Fechas() {
    }

    public static OffsetDateTime parsear(String texto) {
        try {
            return OffsetDateTime.parse(texto);
        } catch (DateTimeParseException sinZona) {
            return LocalDateTime.parse(texto).atOffset(ZoneOffset.UTC);
        }
    }
}
