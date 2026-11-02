import type { MetadataRoute } from "next";
import { URL_DO_SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: URL_DO_SITE, priority: 1 },
    { url: `${URL_DO_SITE}/como-funciona`, priority: 0.8 },
    { url: `${URL_DO_SITE}/privacidade`, priority: 0.3 },
    { url: `${URL_DO_SITE}/termos`, priority: 0.3 },
  ];
}
