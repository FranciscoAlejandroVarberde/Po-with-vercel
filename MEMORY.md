# MEMORY.md

Bitácora del proyecto: decisiones, contexto y estado. Se actualiza en cada cambio relevante.

## Entorno (2026-10-19)
- Windows 10 Home, Node v24.18.0, npm 12.0.1, git 2.56.
- La CLI de Vercel no está instalada (se puede usar con `npx vercel`). `gh` (GitHub CLI) tampoco está instalado.
- El usuario tiene cuenta en GitHub y en Vercel.

## Decisiones
- **2026-10-19: stack mínimo, HTML estático + función serverless en TS.** Objetivo: el proyecto más chico posible con back, para aprender a publicar en Vercel. Se descartaron Next.js (más pesado) y Express (innecesario).
- **2026-10-19: handler con firma Web estándar** (`export function GET(request: Request)`), sin `@vercel/node`. Así la única dependencia es `typescript`, y solo para chequear tipos.
- **2026-10-19: `tsconfig` con `noEmit`.** Vercel compila el TS por su cuenta y `tsc` solo valida.
- **2026-10-19: deploy por GitHub → Vercel**, con deploy automático en cada push a `main`.

## Estado
- [x] Archivos creados: `public/index.html`, `api/hello.ts`, `package.json`, `tsconfig.json`, `.gitignore`.
- [x] `npm install` y `npm run typecheck` pasan sin errores.
- [x] `git init` + primer commit.
- [ ] Crear el repo en GitHub y hacer push.
- [ ] Importar en Vercel y hacer el primer deploy.
- [ ] Anotar acá la URL de producción y la del repo.

## Datos del deploy
- Repo GitHub: _(pendiente)_
- URL producción: _(pendiente)_
