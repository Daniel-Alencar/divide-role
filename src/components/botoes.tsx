"use client";

import { useState } from "react";

export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }}
      className="rounded-lg border border-roxo px-3 py-1 text-sm font-medium text-roxo"
    >
      {copiado ? "Copiado!" : rotulo}
    </button>
  );
}

export function BotaoWhatsApp({ nomeRole }: { nomeRole: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const texto = `Lança aqui o que você pagou no "${nomeRole}": ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
      }}
      className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
    >
      Enviar link no WhatsApp
    </button>
  );
}
