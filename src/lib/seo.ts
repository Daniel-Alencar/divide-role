import type { Metadata } from "next";
import { NOME_DO_SITE } from "@/lib/site";

/** Metadados de uma página pública: título, descrição, URL canônica e prévia em redes sociais. */
export function metadadosDaPagina({
  titulo,
  descricao,
  caminho,
  tituloCompleto = false,
}: {
  titulo: string;
  descricao: string;
  caminho: string;
  /** Usa o título como está, sem acrescentar o nome do site no fim. */
  tituloCompleto?: boolean;
}): Metadata {
  const imagens = ["/opengraph-image"];
  return {
    title: tituloCompleto ? { absolute: titulo } : titulo,
    description: descricao,
    alternates: { canonical: caminho },
    openGraph: {
      title: titulo,
      description: descricao,
      url: caminho,
      siteName: NOME_DO_SITE,
      locale: "pt_BR",
      type: "website",
      images: imagens,
    },
    twitter: { card: "summary_large_image", title: titulo, description: descricao, images: imagens },
  };
}
