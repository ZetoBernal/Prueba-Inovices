package pruebas.globalinvoice.soporte;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;
import pruebas.globalinvoice.web.PruebaWebBase;

/**
 * Extensión de JUnit 5: si una prueba web falla, guarda una captura de la pantalla
 * en ese instante con el prefijo FALLO, para poder analizar el error después.
 */
public class CapturaEnFallo implements TestWatcher {

    @Override
    public void testFailed(ExtensionContext contexto, Throwable causa) {
        contexto.getTestInstance()
                .filter(PruebaWebBase.class::isInstance)
                .map(PruebaWebBase.class::cast)
                .filter(prueba -> prueba.driver() != null)
                .ifPresent(prueba -> Evidencias.capturar(prueba.driver(), "FALLO " + contexto.getDisplayName()));
    }
}
