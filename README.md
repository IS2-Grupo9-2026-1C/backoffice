# Bazaar Admin

Backoffice web para administrar la plataforma Bazaar (usuarios, items, órdenes y métricas). Es la aplicación complementaria a la app React Native de [`../app`](../app).

Stack: **Vite + React 18 + TypeScript + React Router v6**, con **Tailwind CSS** para estilos y **Recharts** para los gráficos de métricas. Husky + lint-staged corren en el `pre-commit`.

## Requisitos

- Node.js **20** (versión usada en CI)
- npm **>= 9**

## Instalación

```bash
cd backoffice
npm install
```

El paso `install` también configura [Husky](https://typicode.github.io/husky) (hook `pre-commit`) automáticamente vía el script `prepare`.

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar según el entorno:

| Variable         | Descripción                                            | Default local           |
| ---------------- | ------------------------------------------------------ | ----------------------- |
| `VITE_ENV`       | Entorno de ejecución (`local` / `production`).         | `local`                 |
| `VITE_BASE_PATH` | Base path del bundle (en Pages se usa `/backoffice/`). | `/`                     |
| `VITE_API_URL`   | URL del gateway que consume la app.                    | `http://127.0.0.1:8000` |

## Scripts disponibles

| Comando             | Descripción                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Levanta el server de desarrollo de Vite (HMR).    |
| `npm run build`     | Typecheck (`tsc --noEmit`) + build de producción. |
| `npm run preview`   | Sirve el build de producción localmente.          |
| `npm run typecheck` | Corre el chequeo de tipos sin emitir.             |
| `npm run lint`      | Corre ESLint sobre `.ts` y `.tsx`.                |
| `npm run lint:fix`  | Corre ESLint con `--fix`.                         |
| `npm run format`    | Formatea todo el proyecto con Prettier.           |

Por defecto, Vite levanta en [http://localhost:5173](http://localhost:5173).

## Deploy en GitHub Pages

El proyecto está preparado para publicarse como GitHub Pages del repositorio
`IS2-Grupo9-2026-1C/backoffice`, por lo que la URL final queda bajo
`https://is2-grupo9-2026-1c.github.io/backoffice/`.

El workflow `.github/workflows/deploy-pages.yml` corre en cada push a `master` (o manualmente vía `workflow_dispatch`):

1. Instala dependencias con `npm ci`.
2. Ejecuta `npm run build` con `VITE_ENV=production`, `VITE_BASE_PATH=/backoffice/` y `VITE_API_URL` apuntando al gateway de producción.
3. Copia `dist/index.html` a `dist/404.html` para soportar refresh en rutas internas.
4. Publica `dist/` usando GitHub Pages Actions.

Para activarlo en GitHub:

1. Entrar al repo `backoffice`.
2. Ir a `Settings > Pages`.
3. En `Build and deployment`, elegir `Source: GitHub Actions`.
4. Hacer push a `master` o correr manualmente `Deploy backoffice to GitHub Pages`.

Si el backoffice queda publicado en otro repo o dominio, ajustar `VITE_BASE_PATH` en el workflow.
Para validar el build local con la misma base de Pages:

```bash
VITE_ENV=production VITE_BASE_PATH=/backoffice/ npm run build
```

También hay que permitir el origen de GitHub Pages en el gateway desplegado. Para esta URL, el
origin CORS es `https://is2-grupo9-2026-1c.github.io` (sin `/backoffice`).

## Autenticación

El login usa el endpoint de admin del gateway. Las rutas internas quedan detrás de un guard que exige sesión activa.

Los **access y refresh tokens se manejan como cookies `httpOnly`** que setea el backend. El navegador las envía automáticamente en cada request.

Para protegerse de CSRF se usa el patrón **double-submit**: el backend devuelve un token CSRF en el login, que el frontend guarda **solo en memoria** y reenvía en un header en cada request. Como vive en memoria, al refrescar la página se vuelve a inicializar la sesión: si el access expiró o el token CSRF quedó desactualizado, el cliente rota las cookies y el CSRF, y reintenta una vez.

## Páginas

- **Users** (`/users`): listado y bloqueo/desbloqueo de usuarios (`GET /users` vía gateway).
- **Items** (`/items`): listado y disable/enable de publicaciones (`GET /admin/items`).
- **Orders** (`/orders`): listado de órdenes vía gateway.
- **Metrics** (`/metrics`): gráficos (Recharts) de usuarios registrados, órdenes y ranking de ventas, con filtro por período. Incluye exportación a CSV (botón **Exportar CSV** → `GET /metrics/export`) y manejo de errores en pantalla con botón **Actualizar** para reintentar.

## Linter y formato

- **ESLint** (`.eslintrc.cjs`): `eslint:recommended` + `@typescript-eslint` + `react-hooks` + `prettier`.
- **Prettier** (`.prettierrc`): `singleQuote`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`.
- **Pre-commit hook** (`.husky/pre-commit`): corre `lint-staged`, que aplica `eslint --fix` + `prettier --write` solo sobre los archivos stageados.

Para saltar el hook en un commit puntual (no recomendado):

```bash
git commit --no-verify -m "..."
```

## Notas

- Usuarios, items, órdenes y métricas se consumen del gateway.
- La paleta y el logo replican los de la app React Native para mantener consistencia de marca.
- El bloqueo/desbloqueo de usuarios se hace via API (admins no son usuarios del marketplace).
