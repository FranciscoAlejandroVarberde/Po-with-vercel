// Función serverless de Vercel: POST /api/n8n → reenvía el JSON recibido a un webhook de n8n.
// Variables de entorno (Vercel → Settings → Environment Variables):
//   N8N_WEBHOOK_URL  URL pública del webhook (la del túnel, ej. https://xxx.trycloudflare.com/webhook/...)
//   N8N_SECRET       opcional: se manda en el header x-secret para que n8n valide quién llama
export async function POST(request: Request) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ error: "Falta configurar N8N_WEBHOOK_URL en Vercel" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "El body tiene que ser un JSON válido" }, { status: 400 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.N8N_SECRET) headers["x-secret"] = process.env.N8N_SECRET;

  try {
    const res = await fetch(webhookUrl, { method: "POST", headers, body: JSON.stringify(body) });
    const text = await res.text();
    let n8n: unknown = text;
    try {
      n8n = JSON.parse(text);
    } catch {}
    return Response.json({ ok: res.ok, status: res.status, n8n }, { status: res.ok ? 200 : 502 });
  } catch {
    return Response.json(
      { error: "No se pudo contactar a n8n. ¿Están prendidos n8n y el túnel? ¿La URL es la correcta?" },
      { status: 502 },
    );
  }
}
