"use client";

import { useSyncExternalStore } from "react";

// "Quem sou eu" neste rolê, guardado só no navegador. Se o armazenamento estiver bloqueado
// (aba anônima, por exemplo), o site funciona normalmente, só sem o destaque.
const chave = (roleId: string) => `divide-role:eu:${roleId}`;
const EVENTO = "divide-role:eu";

function ler(roleId: string) {
  try {
    return localStorage.getItem(chave(roleId));
  } catch {
    return null;
  }
}

function assinar(aoMudar: () => void) {
  window.addEventListener("storage", aoMudar);
  window.addEventListener(EVENTO, aoMudar);
  return () => {
    window.removeEventListener("storage", aoMudar);
    window.removeEventListener(EVENTO, aoMudar);
  };
}

export function useEu(roleId: string): [string | null, (id: string | null) => void] {
  const eu = useSyncExternalStore(assinar, () => ler(roleId), () => null);
  const definir = (id: string | null) => {
    try {
      if (id) localStorage.setItem(chave(roleId), id);
      else localStorage.removeItem(chave(roleId));
    } catch {
      // sem armazenamento: ignora
    }
    window.dispatchEvent(new Event(EVENTO));
  };
  return [eu, definir];
}
