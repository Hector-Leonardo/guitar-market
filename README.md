# Guitar Market

> Marketplace de guitarras — frontend en React + TypeScript y utilidades server-side.

## Resumen

Proyecto demo de marketplace para venta de guitarras. Incluye: cliente (Vite + React + TypeScript), integración con Mercado Pago, subida de imágenes a Cloudinary y persistencia opcional de órdenes en Firebase (Firestore).

## Tecnologías

- Vite, React, TypeScript
- Firebase (Firestore)
- Mercado Pago (pagos)
- Cloudinary (almacenamiento de imágenes)

## Requisitos

- Node.js (16+ recomendado)
- npm o yarn

## Instalación

1. Clona el repo

```bash
npm install
```

2. Ejecuta el frontend en modo desarrollo

```bash
npm run dev
```

Nota: el frontend proxyea las peticiones a `/api` hacia `http://localhost:3000` (ver `vite.config.ts`). Si usas rutas server-side, levanta el backend en `server/` o despliega las funciones serverless.

## Scripts útiles

- `npm run dev` — arranca Vite (frontend).
- `npm run server` — ejecuta `server/index.js` con `node --watch` (si existe).
- `npm run build` — compila TypeScript y construye la app.
- `npm run setup-firebase` — script interactivo para configurar Firebase (`scripts/setup-firebase.js`).
- `npm run test-firebase` — pruebas de conexión Firebase.

## Variables de entorno (.env)

Este proyecto usa varias variables.

Ejemplo mínimo en `.env`:

```
MP_ACCESS_TOKEN=TU_MP_ACCESS_TOKEN
APP_URL=http://localhost:3000
FIREBASE_PROJECT_ID=tu-firebase-project-id
GOOGLE_APPLICATION_CREDENTIALS=C:\\path\\to\\service-account.json
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

Variables públicas para el cliente en `.env.local` (Vite):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Notas de seguridad

- Almacena `MP_ACCESS_TOKEN` y `GOOGLE_APPLICATION_CREDENTIALS` como secretos en el entorno de despliegue.
- Las `VITE_` variables son públicas en el bundle; no pongas secretos ahí.

## Integraciones clave

- Mercado Pago: el cliente crea preferencias y redirige usando `back_urls`. El token se lee desde `process.env.MP_ACCESS_TOKEN`. Ver `src/services/paymentService.ts`.
- Cloudinary: preset `guitarmarket_products` (usar en Cloudinary dashboard). Las subidas desde frontend usan un preset sin firmar; la eliminación requiere backend.
- Firebase: Firestore se usa para guardar órdenes (`src/services/orderService.ts`). Ejecuta `npm run setup-firebase` para creación rápida de `.env` con `FIREBASE_PROJECT_ID`.

## Despliegue (Vercel)

`vercel.json` está configurado con `buildCommand: npm run build` y `outputDirectory: dist`.

Pasos rápidos:

1. Configura variables de entorno en Vercel (MP token, Cloudinary, Firebase credentials).
2. Despliega el proyecto (Git integration o `vercel` CLI).
3. Si usas webhooks de Mercado Pago, configura `APP_URL` pública y registra la URL de notificación.

## Estructura del proyecto (resumen)

- `src/` — frontend React (components, pages, hooks, services).
- `src/services/` — lógica para pagos, órdenes, Cloudinary, envíos y usuarios.
- `scripts/` — utilidades (setup Firebase, tests).
- `api/` — endpoints serverless (ej. `refund-shipment.js`).
- `public/` — assets y páginas estáticas.