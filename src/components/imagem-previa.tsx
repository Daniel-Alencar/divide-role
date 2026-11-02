import { ImageResponse } from "next/og";

export const tamanhoPrevia = { width: 1200, height: 630 };

/** Imagem que aparece quando o link é compartilhado (WhatsApp, redes sociais). */
export function imagemPrevia(titulo: string, subtitulo: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#6d28d9",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.85 }}>Divide Rolê</div>
        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 16, lineHeight: 1.1 }}>{titulo}</div>
        <div style={{ fontSize: 36, marginTop: 32, opacity: 0.9 }}>{subtitulo}</div>
      </div>
    ),
    tamanhoPrevia,
  );
}

/** Ícone: "R$" branco sobre o roxo do site. */
export function icone(tamanho: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6d28d9",
          color: "#fff",
          fontSize: tamanho * 0.42,
          fontWeight: 700,
          borderRadius: tamanho * 0.2,
        }}
      >
        R$
      </div>
    ),
    { width: tamanho, height: tamanho },
  );
}
