package pruebas.globalinvoice.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.MissingNode;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import pruebas.globalinvoice.soporte.Configuracion;

/**
 * Cliente de la API de Global Invoice construido sobre TestRestTemplate.
 * TestRestTemplate no lanza excepciones ante respuestas 4xx/5xx, así que las pruebas
 * pueden verificar códigos de error como cualquier otro resultado.
 */
public class ClienteApi {

    private static final ObjectMapper JSON = new ObjectMapper();

    private final TestRestTemplate rest;

    public ClienteApi() {
        this.rest = new TestRestTemplate(new RestTemplateBuilder().rootUri(Configuracion.apiUrl()));
    }

    /** Respuesta simplificada: código, cabeceras y cuerpo ya convertido a JSON. */
    public record Respuesta(int codigo, HttpHeaders cabeceras, String cuerpo, long milisegundos) {

        /** Cuerpo como árbol JSON; MissingNode si la respuesta no trae cuerpo. */
        public JsonNode json() {
            if (cuerpo == null || cuerpo.isBlank()) {
                return MissingNode.getInstance();
            }
            try {
                return JSON.readTree(cuerpo);
            } catch (JsonProcessingException e) {
                throw new IllegalStateException("La respuesta no es JSON válido: " + cuerpo, e);
            }
        }
    }

    public Respuesta get(String ruta, String token) {
        return enviar(HttpMethod.GET, ruta, null, token);
    }

    public Respuesta post(String ruta, Object cuerpo, String token) {
        return enviar(HttpMethod.POST, ruta, cuerpo, token);
    }

    /** Inicia sesión y devuelve la respuesta completa (no solo el token). */
    public Respuesta login(String usuario, String clave) {
        return post("/auth/login", Map.of("username", usuario, "password", clave), null);
    }

    private Respuesta enviar(HttpMethod metodo, String ruta, Object cuerpo, String token) {
        HttpHeaders cabeceras = new HttpHeaders();
        cabeceras.setAccept(List.of(MediaType.APPLICATION_JSON));
        if (cuerpo != null) {
            cabeceras.setContentType(MediaType.APPLICATION_JSON);
        }
        if (token != null) {
            cabeceras.setBearerAuth(token);
        }
        String json;
        try {
            json = cuerpo == null ? null : JSON.writeValueAsString(cuerpo);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("No se pudo convertir el cuerpo a JSON", e);
        }

        long inicio = System.nanoTime();
        ResponseEntity<String> respuesta = rest.exchange(ruta, metodo, new HttpEntity<>(json, cabeceras), String.class);
        long milisegundos = (System.nanoTime() - inicio) / 1_000_000;

        int codigo = respuesta.getStatusCode().value();
        registrar(metodo, ruta, codigo, milisegundos);
        return new Respuesta(codigo, respuesta.getHeaders(), respuesta.getBody(), milisegundos);
    }

    /**
     * Deja constancia de cada petición en evidencias/reportes/peticiones-api.csv
     * (hora, método, ruta, código y tiempo), que el informe usa como evidencia.
     */
    private static synchronized void registrar(HttpMethod metodo, String ruta, int codigo, long milisegundos) {
        Path archivo = Configuracion.evidencias().resolve("reportes").resolve("peticiones-api.csv");
        String hora = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss"));
        try {
            Files.createDirectories(archivo.getParent());
            if (Files.notExists(archivo)) {
                Files.writeString(archivo, "hora,metodo,ruta,codigo,milisegundos\n", StandardCharsets.UTF_8);
            }
            Files.writeString(archivo, String.join(",", hora, metodo.name(), ruta, String.valueOf(codigo),
                    String.valueOf(milisegundos)) + "\n", StandardCharsets.UTF_8, StandardOpenOption.APPEND);
        } catch (IOException e) {
            // El registro es evidencia adicional: si falla, la prueba sigue.
            System.err.println("No se pudo registrar la petición: " + e.getMessage());
        }
    }
}
