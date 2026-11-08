import type { MetadataRoute } from "next";
import { GUIAS } from "@/lib/guias";
import { URL_DO_SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: URL_DO_SITE, lastModified: "2026-11-08", priority: 1 },
    { url: `${URL_DO_SITE}/como-funciona`, lastModified: "2026-11-08", priority: 0.8 },
    { url: `${URL_DO_SITE}/guias`, lastModified: "2026-11-08", priority: 0.8 },
    ...GUIAS.map((g) => ({
      url: `${URL_DO_SITE}/guias/${g.slug}`,
      lastModified: g.atualizadoEm,
      priority: 0.7,
    })),
    { url: `${URL_DO_SITE}/privacidade`, lastModified: "2026-11-02", priority: 0.3 },
    { url: `${URL_DO_SITE}/termos`, lastModified: "2026-11-02", priority: 0.3 },
  ];
}
