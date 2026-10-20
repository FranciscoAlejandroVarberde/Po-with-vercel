# Guía: n8n en tu PC + un proyecto web en Vercel

En esta guía vas a instalar **n8n en tu propia computadora** (gratis y sin límites) y conectarlo con una web publicada en **Vercel** en los dos sentidos:

| Ejercicio | Quién llama a quién | ¿Necesita túnel? |
|---|---|---|
| 1 | n8n (tu PC) → API en Vercel | No |
| 2 | Web en Vercel → n8n (tu PC) | Sí (Cloudflare Tunnel, gratis) |

> 💡 n8n solo funciona mientras tu PC está prendida y n8n está corriendo. Para aprender, alcanza y sobra.

---

## 0. Requisitos

- **Node.js** en su versión LTS: se descarga de https://nodejs.org. Para verificar que quedó instalado, abrí una terminal y corré `node -v`.
- Para el ejercicio 2, además:
  - Cuenta en **GitHub** y en **Vercel** (podés entrar a Vercel con tu cuenta de GitHub).
  - **cloudflared**, el programa del túnel:
    - Windows: `winget install --id Cloudflare.cloudflared`
    - Mac: `brew install cloudflared`
    - Después cerrá y volvé a abrir la terminal, y verificá con `cloudflared --version`.

---

## 1. Instalar y abrir n8n

1. En una terminal corré:
   ```
   npx n8n
   ```
   La primera vez tarda unos minutos porque descarga n8n.
2. Cuando diga que está listo, abrí **http://localhost:5678**.
3. Creá tu usuario. Es una cuenta **local** de tu PC; no se crea nada en internet.
4. Para apagar n8n: `Ctrl + C` en la terminal. Tus workflows quedan guardados en la carpeta `.n8n` de tu usuario y siguen ahí la próxima vez que lo abras.

> Alternativa con Docker Desktop:
> `docker run -it --rm -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n`

---

## 2. Ejercicio 1: n8n llama a una API en Vercel

Vas a hacer que n8n consulte una API que ya está publicada.

1. En n8n: **Create workflow**.
2. Agregá el trigger **Manual Trigger** ("Trigger manually").
3. Agregá un nodo **HTTP Request** conectado al trigger:
   - **Method:** `GET`
   - **URL:** `https://po-with-vercel-public.vercel.app/api/hello`
   - Activá **Send Query Parameters** y agregá uno con Name `name` y Value con tu nombre.
4. Hacé clic en **Execute workflow**.
5. En la salida del nodo tendrías que ver algo así:
   ```json
   { "message": "Hola, TuNombre!", "time": "2026-..." }
   ```

**Extra:** agregá después un nodo **Edit Fields (Set)** que cree un campo `saludo` con el valor `{{ $json.message }} desde n8n`. Así ves cómo se usan los datos de un nodo en el siguiente.

✅ Ya tenés n8n consumiendo una API en la nube.

---

## 3. Ejercicio 2: tu web en Vercel dispara un workflow de n8n

Ahora el camino es al revés: alguien toca un botón en tu web, la web le avisa a n8n y n8n responde.

Vercel está en internet y tu n8n está en tu PC. Para que Vercel pueda llegar a tu PC vas a usar un **túnel**, que le da a tu n8n una URL pública temporal:

```
[Tu web en Vercel] → /api/n8n → [URL del túnel] → [n8n en tu PC]
```

### 3.1 Tu propia copia del proyecto

1. Entrá a https://github.com/FranciscoAlejandroVarberde/Po-with-vercel y tocá **Fork**. Con eso tenés una copia en tu cuenta.
2. En **vercel.com**: **Add New… → Project → Import**, y elegí tu fork.
3. Configuración:
   - **Framework Preset:** `Other`
   - **Root Directory:** **vacío**, que es la raíz del repo. ⚠️ No pongas `public`: si lo hacés, la API no se publica y vas a recibir errores 404.
   - Todo lo demás, por defecto.
4. Tocá **Deploy** y anotá tu URL, por ejemplo `https://tu-proyecto.vercel.app`.

### 3.2 El workflow en n8n

1. En n8n: **Create workflow**.
2. Agregá el trigger **Webhook**:
   - **HTTP Method:** `POST`
   - **Path:** `clase`
   - **Respond:** `When Last Node Finishes`
3. Conectá un nodo **Edit Fields (Set)** y creá un campo `respuesta` (tipo String) con este valor:
   ```
   Recibí tu mensaje: {{ $json.body.mensaje }}
   ```
4. **Guardá** el workflow y **activalo** con el switch de arriba a la derecha. Según la versión de n8n, puede decir *Active* o *Publish*.

En el nodo Webhook vas a ver dos URLs:
- **Test URL** (`/webhook-test/clase`): solo funciona mientras tocás *Listen for test event*, y una sola vez.
- **Production URL** (`/webhook/clase`): funciona siempre que el workflow esté activo. **Esta es la que vas a usar.**

### 3.3 Abrir el túnel

1. Con n8n corriendo, abrí **otra** terminal y corré:
   ```
   cloudflared tunnel --url http://localhost:5678
   ```
2. En la salida aparece una URL del estilo `https://algo-raro-1234.trycloudflare.com`. Copiala.
3. Armá la URL del webhook: reemplazá `http://localhost:5678` por la del túnel.
   ```
   https://algo-raro-1234.trycloudflare.com/webhook/clase
   ```
4. **Probá el túnel antes de tocar Vercel.** En PowerShell:
   ```powershell
   Invoke-RestMethod -Method Post -Uri "https://algo-raro-1234.trycloudflare.com/webhook/clase" -ContentType "application/json" -Body '{"mensaje":"hola"}'
   ```
   En Mac/Linux:
   ```bash
   curl -X POST "https://algo-raro-1234.trycloudflare.com/webhook/clase" -H "Content-Type: application/json" -d '{"mensaje":"hola"}'
   ```
   Si ves `Recibí tu mensaje: hola`, el túnel y el workflow funcionan.

### 3.4 Conectar Vercel con n8n

1. En Vercel: tu proyecto → **Settings → Environment Variables**.
2. Agregá:
   - **Key:** `N8N_WEBHOOK_URL`
   - **Value:** `https://algo-raro-1234.trycloudflare.com/webhook/clase`
3. **Save**, y después en **Deployments**, en el último deploy: **⋯ → Redeploy**. Las variables nuevas solo se aplican a los deploys nuevos.

### 3.5 Probar

1. Abrí tu web (`https://tu-proyecto.vercel.app`).
2. En la sección **Enviar a n8n**, escribí un mensaje y tocá **Enviar a /api/n8n**.
3. Tendrías que ver:
   ```json
   { "ok": true, "status": 200, "n8n": { "respuesta": "Recibí tu mensaje: ..." } }
   ```
4. En n8n, en la pestaña **Executions**, vas a ver cada ejecución con los datos que llegaron.

✅ Ya tenés una web en la nube que dispara automatizaciones en tu PC.

---

## 4. Opcional: proteger el webhook con un secreto

Cualquiera que conozca la URL del túnel puede llamar a tu webhook. Para que solo tu web pueda hacerlo:

1. En Vercel agregá otra variable: `N8N_SECRET` con una clave que inventes (por ejemplo `mi-clave-123`). Después hacé **Redeploy**.
2. En n8n, en el nodo **Webhook**, elegí **Authentication: Header Auth** y creá una credencial:
   - **Name:** `x-secret`
   - **Value:** la misma clave
3. Ahora, si alguien llama sin la clave, n8n rechaza el pedido (error 403).

> Nunca escribas claves ni URLs privadas en el código ni las subas a GitHub. Se cargan siempre como variables de entorno en Vercel.

---

## 5. Cosas a tener en cuenta

- **La URL del túnel cambia cada vez que reiniciás `cloudflared`.** Cuando pase, actualizá `N8N_WEBHOOK_URL` en Vercel y hacé **Redeploy**.
- Para que el ejercicio 2 funcione tienen que estar prendidas **las dos terminales**: la de `npx n8n` y la de `cloudflared`.
- Si apagás la PC, la web en Vercel sigue funcionando, pero el botón de n8n va a dar error hasta que vuelvas a prender todo.

## 6. Problemas comunes

| Lo que ves | Causa probable | Solución |
|---|---|---|
| `Falta configurar N8N_WEBHOOK_URL en Vercel` | No cargaste la variable, o no hiciste Redeploy | Cargala y hacé Redeploy |
| `No se pudo contactar a n8n...` | n8n o el túnel están apagados, o la URL del túnel es vieja | Prendé los dos y actualizá la URL en Vercel |
| `"status": 404` con un mensaje de n8n sobre el webhook | El workflow no está activo, usaste `/webhook-test/`, el path no es `clase` o el método no es POST | Activá el workflow y revisá la URL y el nodo Webhook |
| `"status": 403` | El secreto de Vercel y el de n8n no coinciden | Revisá `N8N_SECRET` y la credencial Header Auth |
| Error 404 al llamar a `/api/n8n` o `/api/hello` | Root Directory mal configurado en Vercel | Dejalo vacío (raíz) y hacé Redeploy |
| `npx n8n` falla al instalar | Versión de Node muy vieja | Instalá la versión LTS de nodejs.org |
