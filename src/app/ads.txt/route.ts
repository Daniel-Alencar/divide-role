// ads.txt exigido pelo AdSense, gerado a partir de NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX).
export function GET() {
  const cliente = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!cliente?.startsWith("ca-pub-")) return new Response("Not found", { status: 404 });
  const editor = cliente.replace(/^ca-/, "");
  return new Response(`google.com, ${editor}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
