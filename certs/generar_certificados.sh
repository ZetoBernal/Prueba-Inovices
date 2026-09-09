#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Taller AA2 - Seguridad en Software (Unidad 2)
# Generacion de certificados digitales para habilitar HTTPS en la aplicacion.
#
# Produce dos cosas:
#   Opcion 1 - certificado auto-firmado suelto  -> cert.pem + key.pem
#   Opcion 2 - CA propia de desarrollo + certificado firmado por ella
#              -> ca.cert.pem / server.cert.pem / server.key.pem
#
# Uso:  bash generar_certificados.sh
# ---------------------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"

# En Git Bash / MSYS sobre Windows, un argumento que empieza por "/" se traduce
# a una ruta de Windows y rompe los -subj de OpenSSL. Estas dos variables lo
# desactivan; en Linux o macOS simplemente se ignoran.
export MSYS_NO_PATHCONV=1
export MSYS2_ARG_CONV_EXCL='*'

DIAS_CA=1825          # 5 anios para la CA
DIAS_SRV=397          # 397 dias: maximo que aceptan hoy los navegadores
SUJETO_BASE="/C=CO/ST=Bogota D.C./L=Bogota/O=Taller Seguridad en Software"

echo "### OpenSSL utilizado"
openssl version

# ---------------------------------------------------------------------------
echo
echo "### OPCION 1 - Certificado auto-firmado en un solo comando"
# -nodes deja la clave privada sin cifrar, que es lo que espera el servidor de
# desarrollo. En produccion la clave iria protegida por passphrase o en un HSM.
openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "${SUJETO_BASE}/OU=Desarrollo/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:pruebainvoices.local,IP:127.0.0.1" \
  -addext "basicConstraints=critical,CA:FALSE" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=serverAuth"

# ---------------------------------------------------------------------------
echo
echo "### OPCION 2, paso 1 - Clave privada y certificado raiz de la CA"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out ca.key.pem
chmod 600 ca.key.pem
openssl req -x509 -new -key ca.key.pem -sha256 -days "${DIAS_CA}" -out ca.cert.pem \
  -subj "${SUJETO_BASE}/OU=Autoridad Certificadora de desarrollo/CN=Taller SegSW Root CA" \
  -addext "basicConstraints=critical,CA:TRUE,pathlen:0" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"

echo
echo "### OPCION 2, paso 2 - Clave privada del servidor"
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out server.key.pem
chmod 600 server.key.pem

echo
echo "### OPCION 2, paso 3 - Solicitud de firma (CSR)"
openssl req -new -key server.key.pem -out server.csr.pem \
  -subj "${SUJETO_BASE}/OU=Aplicacion web/CN=localhost"

echo
echo "### OPCION 2, paso 4 - Extensiones del certificado del servidor"
cat > server.ext <<'EXT'
basicConstraints     = critical, CA:FALSE
keyUsage             = critical, digitalSignature, keyEncipherment
extendedKeyUsage     = serverAuth
subjectKeyIdentifier = hash
subjectAltName       = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = pruebainvoices.local
IP.1  = 127.0.0.1
EXT
cat server.ext

echo
echo "### OPCION 2, paso 5 - La CA firma el CSR"
openssl x509 -req -in server.csr.pem -sha256 -days "${DIAS_SRV}" \
  -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial \
  -extfile server.ext -out server.cert.pem

echo
echo "### Verificacion de la cadena de confianza"
openssl verify -CAfile ca.cert.pem server.cert.pem

echo
echo "### Archivos generados"
ls -l *.pem *.srl 2>/dev/null
