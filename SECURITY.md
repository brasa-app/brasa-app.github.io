# Seguridad y privacidad de Brasa

## Ahora (beta, sin servidor)

- **Datos solo en el dispositivo y cifrados.**
  - Web: AES-GCM de 256 bits con una clave de Web Crypto no extraíble guardada en IndexedDB (`src/lib/secure-storage.web.ts`).
  - iOS/Android: XSalsa20-Poly1305 (tweetnacl) con la clave en Keychain/Keystore, accesible solo con el dispositivo desbloqueado (`src/lib/secure-storage.ts`).
- **Minimización:** solo se pide el código postal, nunca la dirección exacta.
- **Sin rastreo:** ninguna analítica, publicidad ni SDK de terceros.
- **Enlaces:** solo se abren URLs `https` (sin usuario/contraseña en la URL). Se avisa si el dominio no es de una plataforma conocida.
- **Web:** Content-Security-Policy estricta (`script-src 'self'`, `object-src 'none'`, `form-action 'none'`), HTTPS obligatorio en GitHub Pages, `referrer` limitado.
- **Derechos RGPD:** exportar datos y borrar cuenta desde Mi perfil.
- **Contraseñas de otras apps:** nunca se piden ni se guardan.

## Cuando haya servidor (pendiente)

- Autenticación con Supabase Auth (correo con enlace mágico, Apple y Google). Sin contraseñas propias si es posible.
- Base de datos con Row Level Security: cada usuario solo puede leer y escribir sus filas.
- Vinculación de cuentas solo con OAuth oficial de cada plataforma. Los tokens se guardan cifrados en el servidor (pgsodium / Vault) y nunca llegan al móvil.
- Claves de APIs (eBay, IA) solo en el servidor, nunca en la app.
- Fotos subidas: se eliminan los metadatos EXIF (ubicación GPS) antes de guardarlas.
- Límite de peticiones y protección contra bots en las funciones públicas.
- Moderación: denuncias revisadas, bloqueo de usuarios y retirada de contenido.
- Revisión legal del aviso de privacidad y registro de actividades de tratamiento antes del lanzamiento.

## Informar de un problema

Escribe a [correo de seguridad pendiente] en lugar de abrir una incidencia pública.
