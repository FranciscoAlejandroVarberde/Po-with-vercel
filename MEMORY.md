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
- **2026-10-19: el front muestra los errores de la API.** Antes, si `/api/hello` fallaba, el botón no hacía nada visible.

## Incidentes
- **2026-10-19: el botón "no hace nada" en producción.** La página carga, pero `/api/hello` devuelve **404 NOT_FOUND**. En el repo de GitHub `api/hello.ts` sí está en la raíz, así que el problema es la configuración del proyecto en Vercel. Lo más probable es que el **Root Directory** esté en `public` (el nombre del proyecto, `po-with-vercel-public`, lo sugiere). Si es así, Vercel no ve la carpeta `api/`.
  - Solución: Vercel → Settings → Build and Deployment → Root Directory vacío (raíz), Framework Preset **Other**, Output Directory vacío o `public` → Save → Redeploy.
  - Además, el front ahora muestra el error en pantalla en vez de fallar en silencio.
  - 2026-10-19: después del push del commit `17bcc07` el front nuevo ya está en producción, pero `/api/hello` sigue en 404. Hacer push no cambia la configuración del proyecto en Vercel: hay que corregir el Root Directory a mano y volver a deployar.
  - **Resuelto (2026-10-19):** el usuario dejó vacío el Root Directory en Vercel e hizo Redeploy. Se confirmó que `/api/hello?name=Fran` responde **200** con `{"message":"Hola, Fran!", ...}`. Causa confirmada: el Root Directory estaba en `public`.
  - **Lección:** al importar un repo en Vercel, revisar que el Root Directory sea la raíz del repo. Si queda en `public`, solo se publica el estático y `api/` desaparece.

## Estado
- [x] Archivos creados: `public/index.html`, `api/hello.ts`, `package.json`, `tsconfig.json`, `.gitignore`.
- [x] `npm install` y `npm run typecheck` pasan sin errores.
- [x] `git init` + primer commit.
- [x] Crear el repo en GitHub y hacer push.
- [x] Importar en Vercel y hacer el primer deploy (el estático anda, la API daba 404).
- [x] Corregir el Root Directory en Vercel, redeployar y confirmar que `/api/hello` responde 200.
- [x] **Proyecto publicado y funcionando de punta a punta (front + back).**

## Datos del deploy
- Repo GitHub: https://github.com/FranciscoAlejandroVarberde/Po-with-vercel
- URL producción: https://po-with-vercel-public.vercel.app/
