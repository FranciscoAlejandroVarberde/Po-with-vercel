# Guía: tu primer proyecto web publicado con GitHub + Vercel

En esta guía vas a crear un proyecto web mínimo, con **front** (una página HTML) y **back** (una API en TypeScript), lo vas a subir a **GitHub** y lo vas a publicar gratis en **Vercel**.

Al terminar vas a tener:
- Una página en `https://tu-proyecto.vercel.app`.
- Una API en `https://tu-proyecto.vercel.app/api/hello?name=TuNombre` que responde un JSON.
- Deploy automático: cada vez que subas cambios a GitHub, Vercel publica la versión nueva solo.

```
[Tu PC] --git push--> [GitHub] --deploy automático--> [Vercel] --> https://tu-proyecto.vercel.app
```

---

## 0. Requisitos

| Qué | Dónde | Cómo verificar |
|---|---|---|
| **Git** | https://git-scm.com | `git --version` |
| **Node.js** (versión LTS) | https://nodejs.org | `node -v` |
| **VS Code** (recomendado) | https://code.visualstudio.com | — |
| Cuenta de **GitHub** | https://github.com | — |
| Cuenta de **Vercel** (plan Hobby, gratis) | https://vercel.com → *Sign Up* → **Continue with GitHub** | — |

> 💡 Creá la cuenta de Vercel **con tu cuenta de GitHub**. Así después Vercel puede ver tus repos sin configurar nada más.

**Si es la primera vez que usás Git en esta PC**, decile quién sos. Esto se hace una sola vez:
```
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

---

## 1. Crear el proyecto

### 1.1 La carpeta
1. Creá una carpeta nueva, por ejemplo `mi-primer-vercel`.
2. Abrila en VS Code: **File → Open Folder**.
3. Abrí la terminal de VS Code: **Terminal → New Terminal**. Todos los comandos de la guía se corren ahí.

### 1.2 Los archivos
Vas a crear esta estructura:

```
mi-primer-vercel/
├─ public/index.html   ← front: la página
├─ api/hello.ts        ← back: la API en TypeScript
├─ package.json        ← datos del proyecto
├─ tsconfig.json       ← configuración de TypeScript
└─ .gitignore          ← archivos que NO se suben a GitHub
```

> 💡 En VS Code, si creás un archivo nuevo con el nombre `api/hello.ts`, la carpeta `api` se crea sola.

Hay **dos carpetas con nombres especiales** para Vercel:
- **`api/`**: cada archivo `.ts` que pongas acá se convierte en un endpoint del back. Por ejemplo, `api/hello.ts` responde en `/api/hello`.
- **`public/`**: lo que pongas acá se publica tal cual. `public/index.html` es la página principal.

#### `api/hello.ts`
```ts
// Función serverless de Vercel: GET /api/hello?name=...
export function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name") ?? "mundo";
  return Response.json({ message: `Hola, ${name}!`, time: new Date().toISOString() });
}
```
¿Qué hace? Cuando alguien entra a `/api/hello?name=Ana`, lee el parámetro `name` y responde `{"message":"Hola, Ana!","time":"..."}`. Si no hay `name`, saluda a "mundo".

#### `public/index.html`
```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi primer Vercel</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 3rem auto; padding: 0 1rem; }
    input, button { font-size: 1rem; padding: .5rem; }
    pre { background: #f4f4f4; padding: 1rem; border-radius: 6px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>Mi primer proyecto en Vercel</h1>
  <input id="name" placeholder="Tu nombre">
  <button id="btn">Llamar a /api/hello</button>
  <pre id="out">…</pre>
  <script>
    document.getElementById("btn").onclick = async () => {
      const name = encodeURIComponent(document.getElementById("name").value || "mundo");
      const out = document.getElementById("out");
      out.textContent = "Cargando…";
      try {
        const res = await fetch(`/api/hello?name=${name}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
        out.textContent = JSON.stringify(await res.json(), null, 2);
      } catch (err) {
        out.textContent = `Error: ${err.message}`;
      }
    };
  </script>
</body>
</html>
```
¿Qué hace? Cuando tocás el botón, llama a tu API (`/api/hello`) y muestra la respuesta. Si algo falla, muestra el error en pantalla en vez de quedarse sin hacer nada.

#### `package.json`
```json
{
  "name": "mi-primer-vercel",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```
> ⚠️ El `name` va en minúsculas, sin espacios ni tildes.

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["api"]
}
```

#### `.gitignore`
```
node_modules/
.vercel/
```

### 1.3 Instalar TypeScript y chequear el código
```
npm install -D typescript
npm run typecheck
```
- El primer comando instala TypeScript. Se crea la carpeta `node_modules`, que **no** se sube a GitHub gracias al `.gitignore`.
- El segundo revisa que el código no tenga errores de tipos. Si no muestra ningún error, está todo bien.

> 💡 Vercel compila el TypeScript por su cuenta al publicar. El `typecheck` es para encontrar errores **antes** de subir.

---

## 2. Guardar el proyecto con Git

```
git init
git add .
git commit -m "Mi primer proyecto"
git branch -M main
```
- `git init`: convierte la carpeta en un repositorio de Git.
- `git add .`: prepara todos los archivos para guardarlos.
- `git commit`: guarda una "foto" del proyecto con un mensaje.
- `git branch -M main`: llama `main` a la rama principal.

---

## 3. Subir el proyecto a GitHub

### 3.1 Crear el repositorio
1. En https://github.com, arriba a la derecha: **+ → New repository**.
2. **Repository name:** `mi-primer-vercel`.
3. Elegí **Public** o **Private**. Vercel funciona con los dos.
4. ⚠️ **No tildes** *Add a README*, *.gitignore* ni *license*. El repo tiene que nacer **vacío**, porque si no, el push da error (ver *Problemas comunes*).
5. **Create repository**.

### 3.2 Conectar y subir
GitHub te muestra unos comandos. Usá los de **"…or push an existing repository from the command line"**:
```
git remote add origin https://github.com/TU-USUARIO/mi-primer-vercel.git
git push -u origin main
```
- La primera vez se abre una ventana para iniciar sesión en GitHub. Aceptala.
- Recargá la página del repo en GitHub: tendrías que ver tus archivos.

---

## 4. Publicar en Vercel

1. Entrá a https://vercel.com, y en tu panel: **Add New… → Project**.
2. En **Import Git Repository** buscá `mi-primer-vercel` y tocá **Import**.
   - ¿No aparece? Tocá **Adjust GitHub App Permissions** (o *Configure GitHub App*) y dale acceso a ese repo.
3. En la pantalla de configuración:
   - **Project Name:** podés dejar el que propone.
   - **Framework Preset:** `Other`.
   - **Root Directory:** dejalo en **`./`**, que es la raíz del proyecto.
     > ⚠️ **No elijas `public`.** Si lo hacés, la página carga pero la API **no** se publica, y el botón va a mostrar `Error: 404`. Es el error más común.
   - **Build and Output Settings:** no toques nada.
4. Tocá **Deploy** y esperá alrededor de un minuto.
5. Cuando aparezca la pantalla de felicitaciones, vas a ver tu URL, del estilo `https://mi-primer-vercel.vercel.app`.

---

## 5. Probar

1. Abrí `https://tu-proyecto.vercel.app`, escribí tu nombre y tocá el botón. Tendrías que ver:
   ```json
   { "message": "Hola, TuNombre!", "time": "2026-..." }
   ```
2. Probá la API directo en el navegador:
   `https://tu-proyecto.vercel.app/api/hello?name=Ana`

✅ Tu proyecto ya está en internet, con front y back.

---

## 6. Subir cambios (deploy automático)

Desde ahora, **cada `git push` a `main` publica una versión nueva**.

1. Cambiá algo, por ejemplo en `api/hello.ts` reemplazá `Hola` por `Buenas`.
2. Corré:
   ```
   npm run typecheck
   git add .
   git commit -m "Cambio el saludo"
   git push
   ```
3. En Vercel, en la pestaña **Deployments**, vas a ver el deploy nuevo en curso. Cuando diga **Ready**, recargá tu página.

> 💡 Si trabajás en otra rama (no `main`), Vercel crea un deploy de **Preview** con una URL propia. Sirve para probar sin tocar la versión publicada.

---

## 7. Desafío: tu propio endpoint

Creá `api/hora.ts` que responda la hora actual:
```ts
export function GET() {
  const hora = new Date().toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour12: false });
  return Response.json({ hora });
}
```
Subilo con `git add .`, `git commit` y `git push`, y probá `https://tu-proyecto.vercel.app/api/hora`.

**Regla:** un archivo en `api/` es un endpoint. Para responder a un **POST** en vez de un GET, exportá una función llamada `POST`.

---

## 8. Problemas comunes

| Lo que ves | Causa probable | Solución |
|---|---|---|
| El botón muestra `Error: 404` o `/api/hello` da **404 NOT_FOUND** | En Vercel, el **Root Directory** quedó en `public` | Vercel → proyecto → **Settings → Build and Deployment** → Root Directory en la raíz → **Save** → **Deployments → ⋯ → Redeploy** |
| La página principal da 404 | Falta `public/index.html`, o el nombre está mal escrito | Revisá que el archivo exista en GitHub con ese nombre exacto |
| El deploy dice **Error / Failed** | Hay un error en el código | Abrí el deploy → **Build Logs** para ver el error. En tu PC, corré `npm run typecheck` |
| `git push` dice **rejected… fetch first** | Creaste el repo con README en GitHub | Corré `git pull origin main --allow-unrelated-histories` y después `git push`. O borrá el repo y creálo vacío |
| `git push` dice **Authentication failed** o **Permission denied** | No iniciaste sesión, o el repo es de otra cuenta | Revisá la URL con `git remote -v` y volvé a iniciar sesión |
| Git pide `user.name` / `user.email` | Es la primera vez que usás Git | Mirá el paso 0 |
| Mi repo no aparece en Vercel | Vercel no tiene permiso sobre ese repo | **Adjust GitHub App Permissions** y dale acceso |
| Subí cambios pero no se ven | No hiciste `git push`, el push fue a otra rama, o el navegador tiene la versión vieja | Revisá con `git status` y `git log`, mirá **Deployments** en Vercel y recargá con `Ctrl + F5` |
| Hacer push no arregla un error de configuración | La configuración de Vercel no está en el código | Cambiala en **Settings** y hacé **Redeploy** |

---

## Siguiente paso

Con este proyecto publicado, seguí con **`GUIA-ALUMNOS.md`**: vas a conectar tu web con **n8n** corriendo en tu PC.
