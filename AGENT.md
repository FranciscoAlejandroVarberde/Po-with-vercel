# AGENT.md

Guía para cualquier agente o dev que trabaje en este proyecto.

## Qué es
El proyecto web más chico posible con **front estático + back en TypeScript**, preparado para publicarse en **Vercel**.
- Front: `public/index.html` (HTML + JS inline, sin dependencias).
- Back: `api/hello.ts` (función serverless de Vercel).

## Estructura
```
public/index.html   front: hace fetch a /api/hello y muestra el JSON
api/hello.ts        back: GET /api/hello?name=X → { message, time }
package.json        sin dependencias de runtime; devDep: typescript
tsconfig.json       solo chequeo de tipos (noEmit). Vercel compila el TS solo.
.gitignore          node_modules/, .vercel/
AGENT.md            este archivo
MEMORY.md           bitácora de decisiones y estado
```

## Cómo funciona en Vercel
- Todo archivo dentro de `api/` en la raíz se convierte en una función serverless. Su ruta es el nombre del archivo: `api/hello.ts` queda en `/api/hello`.
- Vercel compila el `.ts` automáticamente, así que no hay paso de build.
- La carpeta `public/` se sirve como estático, y `public/index.html` queda en `/`.
- Los handlers usan la **firma Web estándar** (`Request` → `Response`), sin `@vercel/node`. Se exporta una función por método HTTP: `GET`, `POST`, etc.

## Comandos
| Comando | Qué hace |
|---|---|
| `npm install` | Instala TypeScript (única dependencia) |
| `npm run typecheck` | Chequea tipos con `tsc --noEmit` |
| `npx vercel dev` | Levanta front y back en local en http://localhost:3000 (la primera vez pide login y vincular el proyecto) |

## Convenciones
- Un endpoint por archivo en `api/`.
- Para agregar un endpoint, creá `api/<nombre>.ts` y exportá `GET`, `POST`, etc.:
  ```ts
  export async function POST(request: Request) {
    const body = await request.json();
    return Response.json({ recibido: body });
  }
  ```
- Antes de cada push corré `npm run typecheck`.
- Las decisiones y cambios de estado se anotan en `MEMORY.md`.

## Paso a paso: publicar en Vercel (GitHub → Vercel)
1. **Repo local** (ya hecho en el primer commit):
   ```bash
   git init
   git add .
   git commit -m "Proyecto inicial"
   ```
2. **Crear el repo en GitHub**: en github.com → New repository, con un nombre como `mini-vercel-ts`. Dejalo **vacío**, sin README ni .gitignore.
3. **Subir el código**:
   ```bash
   git remote add origin https://github.com/<usuario>/mini-vercel-ts.git
   git branch -M main
   git push -u origin main
   ```
4. **Importar en Vercel**: en vercel.com → Add New… → Project → Import el repo de GitHub. Si no aparece, en "Adjust GitHub App Permissions" dale acceso al repo.
5. **Configuración**:
   - Framework Preset: **Other**
   - Build Command: vacío
   - Output Directory: vacío o por defecto (Vercel usa `public/`)
   - Install Command: por defecto (`npm install`)
6. **Deploy**: al terminar, Vercel muestra la URL `https://<proyecto>.vercel.app`.
7. **Probar**:
   - `https://<proyecto>.vercel.app`: el botón tiene que mostrar el JSON.
   - `https://<proyecto>.vercel.app/api/hello?name=Fran` devuelve `{"message":"Hola, Fran!", ...}`.
8. **Deploys siguientes**: cada `git push` a `main` genera un deploy de **producción**. Las otras ramas y los PRs generan deploys de **preview** con su propia URL.

## Problemas comunes
- **El botón "no hace nada" o muestra `Error: 404`**: la página carga pero la API no existe en el deploy. Probá directo `https://<proyecto>.vercel.app/api/hello`.
  - La carpeta tiene que llamarse `api/` y estar en la **raíz** del repo.
  - En Vercel → Settings → Build and Deployment, **Root Directory tiene que quedar vacío (raíz)**, nunca `public`. Si apunta a `public`, Vercel solo ve el HTML y no la carpeta `api/`.
  - Después de cambiar la configuración: Deployments → ⋯ → **Redeploy**.
- **La página muestra 404 en `/`**: revisá que `public/index.html` exista y que Output Directory no apunte a otra carpeta.
- **Error de tipos en el build**: corré `npm run typecheck` en local y corregí.
- **Variables de entorno**: se cargan en Vercel → Project → Settings → Environment Variables y se leen con `process.env.NOMBRE`. Si las usás, agregá `@types/node`.
