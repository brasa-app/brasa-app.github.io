# Brasa

App de segunda mano que conecta Wallapop, Vinted, Milanuncios, coches.net, eBay y más:
busca chollos en todas a la vez, comprueba la fiabilidad del vendedor y ayuda a publicar
un anuncio en varias webs de una vez. La compra siempre se hace en la plataforma original.

Hecha con Expo (React Native): un solo código para iOS, Android y web.

## Probarla

```bash
npm install
npx expo start
```

- En el móvil: instala **Expo Go** y escanea el código QR que aparece.
- En el navegador: pulsa `w` en la terminal.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/app/(tabs)` | Las 4 pestañas: Ofertas TOP, Añadir, Buscador, Mi perfil |
| `src/app/listing/[id].tsx` | Detalle del anuncio con el análisis de fiabilidad |
| `src/app/filters.tsx` | Filtros de distancia, precio, estado y forma de compra |
| `src/lib/scoring.ts` | Fiabilidad del vendedor, "está que arde", mejor estado/precio |
| `src/lib/sources/` | Fuentes de anuncios: datos de ejemplo y eBay (API oficial) |
| `src/lib/ai.ts` | Estimación del estado por fotos |
| `src/lib/store.tsx` | Perfil, filtros, favoritos y alertas (se guardan en el móvil) |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `EXPO_PUBLIC_API_URL` | Servidor propio que habla con eBay y con el modelo de IA. Sin ella se usan datos de ejemplo. |
| `EXPO_PUBLIC_USE_MOCK=false` | Desactiva los datos de ejemplo. |

## Publicar en las tiendas

```bash
npx eas-cli@latest build --platform all
npx eas-cli@latest submit --platform all
```

Requiere cuenta de Apple Developer y de Google Play Console (pendiente, se hará al final).
