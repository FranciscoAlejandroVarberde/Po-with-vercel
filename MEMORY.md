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
- **2026-10-19: uso docente con n8n.** El proyecto es de prueba. El objetivo es darles a los alumnos herramientas **gratuitas** para usar n8n.
  - n8n **no** corre dentro de Vercel: es un servidor permanente y Vercel es serverless.
  - Opción elegida: **n8n local en la PC de cada alumno** (`npx n8n`, o Docker). Es gratis y sin límites. Se descartaron para la guía: n8n Cloud (es una prueba de 14 días, no un plan gratis) y Oracle Cloud o los planes gratis de GCP/AWS (piden tarjeta y son complejos).
  - n8n → Vercel funciona directo. Vercel → n8n necesita un túnel: se eligió **Cloudflare Tunnel** (`cloudflared tunnel --url http://localhost:5678`) porque es gratis y no requiere cuenta.
  - Cada alumno hace **fork** del repo y su propio deploy en Vercel, con su propia `N8N_WEBHOOK_URL`.
- **2026-10-19: `api/n8n.ts`** reenvía el JSON a `N8N_WEBHOOK_URL`, con un `x-secret` opcional. Se agregó `@types/node` y `"types": ["node"]` en tsconfig, porque TypeScript 7 no los toma solo.
  - Se probó en local con un webhook falso: los casos sin env (500), ok (200), JSON inválido (400), secreto incorrecto (502 con 403 de n8n) y n8n apagado (502) responden lo esperado.
  - **No se probó con un n8n real ni en Vercel.**
- **2026-10-19: guía `GUIA-VERCEL-GITHUB.md`** (guía 1, antes de la de n8n). Los alumnos crean el proyecto **desde cero**: copian los 5 archivos de la guía en vez de hacer fork, para aprender la estructura. Después lo suben a GitHub y lo publican en Vercel.
  - La versión del proyecto en la guía es la mínima: solo `/api/hello`, y TypeScript sin `@types/node`.
  - Incluye los problemas que aparecieron en este proyecto: Root Directory en `public` → 404, y que hacer push no cambia la configuración de Vercel.
  - Verificado: se extrajeron los archivos de la guía a una carpeta limpia, con `npm install` + `typecheck` OK, y `/api/hello` y el desafío `/api/hora` responden bien.
  - Gotcha: `toLocaleTimeString("es-AR")` en Node da formato de 12 horas sin "a. m./p. m.", así que se usa `hour12: false`.

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
- [x] `api/n8n.ts`, el formulario en el front y `GUIA-ALUMNOS.md` creados. Typecheck OK.
- [ ] Push y verificar `/api/n8n` en producción. Sin `N8N_WEBHOOK_URL` tiene que responder 500 con el mensaje "Falta configurar...".
- [ ] El repo de GitHub tiene que ser **público** para que los alumnos puedan hacer fork.
- [ ] Probar la guía de punta a punta con un n8n real antes de dársela a los alumnos.
- [x] `GUIA-VERCEL-GITHUB.md` creada y con el código verificado en local.
- [ ] Hacer la guía de Vercel una vez con un repo nuevo, para confirmar que los nombres de los botones de GitHub y Vercel coinciden con la interfaz actual.

## Datos del deploy
- Repo GitHub: https://github.com/FranciscoAlejandroVarberde/Po-with-vercel
- URL producción: https://po-with-vercel-public.vercel.app/
