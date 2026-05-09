# Bazaar Admin

Backoffice web para administrar la plataforma Bazaar (usuarios e items). Es la aplicación complementaria a la app React Native de [`../app`](../app).

Stack: **Vite + React 18 + TypeScript + React Router v6**.

## Requisitos

- Node.js **>= 18**
- npm **>= 9**

## Instalación

```bash
cd backoffice
npm install
```

El paso `install` también configura [Husky](https://typicode.github.io/husky) (hook `pre-commit`) automáticamente vía el script `prepare`.

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

El workflow `.github/workflows/deploy-pages.yml` corre en cada push a `main` o `develop`:

1. Instala dependencias con `npm ci`.
2. Ejecuta `npm run build` con `VITE_ENV=production` y `VITE_BASE_PATH=/backoffice/`.
3. Copia `dist/index.html` a `dist/404.html` para soportar refresh en rutas internas.
4. Publica `dist/` usando GitHub Pages Actions.

Para activarlo en GitHub:

1. Entrar al repo `backoffice`.
2. Ir a `Settings > Pages`.
3. En `Build and deployment`, elegir `Source: GitHub Actions`.
4. Hacer push a `develop` o correr manualmente `Deploy backoffice to GitHub Pages`.

Si el backoffice queda publicado en otro repo o dominio, ajustar `VITE_BASE_PATH` en el workflow.
Para validar el build local con la misma base de Pages:

```bash
VITE_ENV=production VITE_BASE_PATH=/backoffice/ npm run build
```

También hay que permitir el origen de GitHub Pages en el gateway desplegado. Para esta URL, el
origin CORS es `https://is2-grupo9-2026-1c.github.io` (sin `/backoffice`).

## Login

El login usa el gateway (`/auth/admin/token`) y guarda access/refresh tokens en `localStorage`. El listado de usuarios se consume desde `GET /users` via gateway.

## Linter y formato

- **ESLint** (`.eslintrc.cjs`): `eslint:recommended` + `@typescript-eslint` + `react-hooks` + `prettier`.
- **Prettier** (`.prettierrc`): `singleQuote`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`.
- **Pre-commit hook** (`.husky/pre-commit`): corre `lint-staged`, que aplica `eslint --fix` + `prettier --write` solo sobre los archivos stageados.

Para saltar el hook en un commit puntual (no recomendado):

```bash
git commit --no-verify -m "..."
```

## Notas

- Usuarios se obtienen del gateway; items siguen mockeados en memoria y sus cambios se pierden al refrescar.
- La paleta y el logo replican los de la app React Native para mantener consistencia de marca.
- El bloqueo/desbloqueo de usuarios se hace via API (admins no son usuarios del marketplace).
