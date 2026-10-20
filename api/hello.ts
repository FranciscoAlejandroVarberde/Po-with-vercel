// Función serverless de Vercel: GET /api/hello?name=...
export function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name") ?? "mundo";
  return Response.json({ message: `Hola, ${name}!`, time: new Date().toISOString() });
}
