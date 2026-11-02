"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/** Bloco do Google AdSense. Não renderiza nada se as variáveis não estiverem configuradas. */
export function Anuncio({ slot }: { slot?: string }) {
  const cliente = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!cliente || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Bloqueador de anúncio ou script ainda carregando: segue sem anúncio.
    }
  }, [cliente, slot]);

  if (!cliente || !slot) return null;
  return (
    <ins
      className="adsbygoogle block min-h-[90px] w-full"
      data-ad-client={cliente}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
