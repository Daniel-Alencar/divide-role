import type { MetadataRoute } from "next";
import { URL_DO_SITE } from "@/lib/site";

// Os rolês não são bloqueados aqui de propósito: eles usam "noindex", e o buscador
// precisa conseguir abrir a página para ler essa instrução.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${URL_DO_SITE}/sitemap.xml`,
  };
}
