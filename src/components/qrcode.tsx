import { gerarQrCode } from "@/lib/qrcode";

/** QR Code em SVG, sempre preto no branco (com margem) para qualquer câmera ler. */
export function QrCode({ texto, rotulo }: { texto: string; rotulo: string }) {
  const matriz = gerarQrCode(texto);
  const margem = 4;
  const lado = matriz.length + margem * 2;
  let caminho = "";
  matriz.forEach((linha, y) =>
    linha.forEach((escuro, x) => {
      if (escuro) caminho += `M${x + margem} ${y + margem}h1v1h-1z`;
    }),
  );
  return (
    <svg
      viewBox={`0 0 ${lado} ${lado}`}
      role="img"
      aria-label={rotulo}
      shapeRendering="crispEdges"
      className="h-56 w-56 rounded-lg"
    >
      <rect width={lado} height={lado} fill="#fff" />
      <path d={caminho} fill="#000" />
    </svg>
  );
}
