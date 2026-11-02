"use client";

import { useSearchParams } from "next/navigation";

/** Confirmação exibida na página inicial depois de apagar um rolê. */
export function AvisoApagado() {
  if (useSearchParams().get("apagado") !== "1") return null;
  return (
    <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-green-800">
      Rolê apagado. Nomes, gastos e chaves Pix foram removidos.
    </p>
  );
}
