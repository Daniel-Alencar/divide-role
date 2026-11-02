"use client";

import { useActionState, useState } from "react";
import type { EstadoForm } from "@/app/acoes";

export function BotaoCopiar({
  texto,
  rotulo,
  className = "rounded-lg border border-roxo px-3 py-1 text-sm font-medium text-roxo",
}: {
  texto: string | (() => string);
  rotulo: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);
  const [falhou, setFalhou] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(typeof texto === "function" ? texto() : texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        } catch {
          setFalhou(true);
        }
      }}
      className={className}
    >
      <span aria-live="polite">{copiado ? "Copiado!" : falhou ? "Não deu para copiar" : rotulo}</span>
    </button>
  );
}

export function BotaoWhatsApp({
  nomeRole,
  mensagem,
  rotulo = "Enviar link no WhatsApp",
}: {
  nomeRole: string;
  /** Recebe a URL da página. Sem ela, manda o convite para lançar os gastos. */
  mensagem?: (url: string) => string;
  rotulo?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const url = window.location.href;
        const texto = mensagem ? mensagem(url) : `Lança aqui o que você pagou no "${nomeRole}": ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
      }}
      className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
    >
      {rotulo}
    </button>
  );
}

/**
 * Botão que chama uma server action sem campos (remover, marcar como pago...).
 * Mostra "aguarde" enquanto roda, pede confirmação se `confirmar` vier e exibe o erro devolvido.
 */
export function BotaoAcao({
  acao,
  rotulo,
  pendenteRotulo = "Aguarde...",
  confirmar,
  className,
  rotuloAcessivel,
  aoConcluir,
}: {
  acao: () => Promise<EstadoForm>;
  rotulo: string;
  pendenteRotulo?: string;
  confirmar?: string;
  className?: string;
  rotuloAcessivel?: string;
  /** Recebe o resultado. Útil quando o botão some depois da ação e o erro precisa aparecer em outro lugar. */
  aoConcluir?: (estado: EstadoForm) => void;
}) {
  const [estado, executar, pendente] = useActionState(async () => {
    const resultado = await acao();
    aoConcluir?.(resultado);
    return resultado;
  }, {} as EstadoForm);
  return (
    <form
      action={executar}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className="inline-flex flex-col gap-1"
    >
      <button disabled={pendente} className={`${className ?? ""} disabled:opacity-60`} aria-label={rotuloAcessivel}>
        {pendente ? pendenteRotulo : rotulo}
      </button>
      {estado.erro && !aoConcluir && (
        <span role="alert" className="text-sm text-red-700">
          {estado.erro}
        </span>
      )}
    </form>
  );
}
