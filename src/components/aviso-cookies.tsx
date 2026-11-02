"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

const CHAVE = "divide-role:cookies-ok";
const EVENTO = "divide-role:cookies";

function aceitou() {
  try {
    return localStorage.getItem(CHAVE) === "1";
  } catch {
    return false;
  }
}

function assinar(aoMudar: () => void) {
  window.addEventListener(EVENTO, aoMudar);
  return () => window.removeEventListener(EVENTO, aoMudar);
}

/** Aviso de cookies (LGPD). Só aparece quando os anúncios estão ligados, pois só eles usam cookies. */
export function AvisoCookies() {
  // No servidor, considera aceito para não piscar o aviso antes de ler o navegador.
  const ok = useSyncExternalStore(assinar, aceitou, () => true);
  if (ok) return null;
  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-xl flex-col gap-2 text-sm sm:flex-row sm:items-center">
        <p className="flex-1">
          Usamos cookies do Google AdSense para exibir anúncios e manter o site gratuito. Saiba mais na{" "}
          <Link href="/privacidade" className="text-roxo underline">
            política de privacidade
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.setItem(CHAVE, "1");
            } catch {
              // sem armazenamento: o aviso volta na próxima visita
            }
            window.dispatchEvent(new Event(EVENTO));
          }}
          className="rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
