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

## Login

El login es mock: cualquier email + password redirige a `/usuarios`. No hay backend conectado todavía; los datos vienen de [`src/mocks.ts`](src/mocks.ts).

## Linter y formato

- **ESLint** (`.eslintrc.cjs`): `eslint:recommended` + `@typescript-eslint` + `react-hooks` + `prettier`.
- **Prettier** (`.prettierrc`): `singleQuote`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`.
- **Pre-commit hook** (`.husky/pre-commit`): corre `lint-staged`, que aplica `eslint --fix` + `prettier --write` solo sobre los archivos stageados.

Para saltar el hook en un commit puntual (no recomendado):

```bash
git commit --no-verify -m "..."
```

## Notas

- Los datos son mockeados en memoria: los cambios de estado (bloquear usuarios, deshabilitar items) se pierden al refrescar.
- La paleta y el logo replican los de la app React Native para mantener consistencia de marca.
- El admin actual (`ADMIN_ACTUAL_ID` en `mocks.ts`) no puede bloquearse a sí mismo desde la tabla de Usuarios.
