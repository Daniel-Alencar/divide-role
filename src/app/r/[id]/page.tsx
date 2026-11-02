import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { marcarPago, removerGasto } from "@/app/acoes";
import { Anuncio } from "@/components/anuncio";
import { BotaoCopiar, BotaoWhatsApp } from "@/components/botoes";
import { FormGasto, FormParticipante } from "@/components/formularios";
import { calcularSaldos, calcularTransferencias, formatarCentavos } from "@/lib/acerto";
import { carregarRole } from "@/lib/db";
import { gerarPixCopiaECola } from "@/lib/pix";

type Props = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Link do rolê é privado: não indexar nos buscadores.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PaginaRole({ params }: Props) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const dados = await carregarRole(id);
  if (!dados) notFound();
  const { role, participantes, gastos, pagamentos } = dados;

  const nomes = new Map(participantes.map((p) => [p.id, p.nome]));
  const total = gastos.reduce((soma, g) => soma + g.valor_centavos, 0);
  const transferencias = calcularTransferencias(
    calcularSaldos(
      participantes.map((p) => p.id),
      gastos.map((g) => ({ valorCentavos: g.valor_centavos, pagoPor: g.pago_por, divididoEntre: g.dividido_entre })),
      pagamentos.map((p) => ({ de: p.de, para: p.para, valorCentavos: p.valor_centavos })),
    ),
  );

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{role.nome}</h1>
        <p className="text-zinc-600">Total do rolê: {formatarCentavos(total)}</p>
        <BotaoWhatsApp nomeRole={role.nome} />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Quem está no rolê</h2>
        {participantes.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {participantes.map((p) => (
              <li key={p.id} className="rounded-full bg-white px-3 py-1 shadow-sm">
                {p.nome}
                {p.chave_pix && <span title="Tem chave Pix"> · Pix</span>}
              </li>
            ))}
          </ul>
        )}
        <FormParticipante roleId={role.id} />
      </section>

      {participantes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Gastos</h2>
          {gastos.length > 0 && (
            <ul className="divide-y divide-zinc-200 rounded-lg bg-white shadow-sm">
              {gastos.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-2 px-4 py-3">
                  <div>
                    <p className="font-medium">
                      {g.descricao} · {formatarCentavos(g.valor_centavos)}
                    </p>
                    <p className="text-sm text-zinc-600">
                      {nomes.get(g.pago_por)} pagou · dividido entre{" "}
                      {g.dividido_entre.map((pid) => nomes.get(pid)).join(", ")}
                    </p>
                  </div>
                  <form action={removerGasto.bind(null, role.id, g.id)}>
                    <button className="text-sm text-red-700" aria-label={`Remover ${g.descricao}`}>
                      Remover
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <FormGasto roleId={role.id} participantes={participantes} />
        </section>
      )}

      {gastos.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Acerto</h2>
          {transferencias.length === 0 ? (
            <p className="text-green-700">Tudo certo! Ninguém deve nada. 🎉</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {transferencias.map((t) => {
                const recebedor = participantes.find((p) => p.id === t.para);
                const pix = recebedor?.chave_pix
                  ? gerarPixCopiaECola({
                      chave: recebedor.chave_pix,
                      nomeRecebedor: recebedor.nome,
                      valorCentavos: t.valorCentavos,
                      descricao: role.nome,
                    })
                  : null;
                return (
                  <li key={`${t.de}-${t.para}`} className="flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm">
                    <p>
                      <strong>{nomes.get(t.de)}</strong> paga{" "}
                      <strong>{formatarCentavos(t.valorCentavos)}</strong> para{" "}
                      <strong>{nomes.get(t.para)}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {pix ? (
                        <BotaoCopiar texto={pix} rotulo="Copiar Pix com valor" />
                      ) : (
                        <span className="text-sm text-zinc-500">
                          {nomes.get(t.para)} ainda não informou a chave Pix
                        </span>
                      )}
                      <form action={marcarPago.bind(null, role.id, t.de, t.para, t.valorCentavos)}>
                        <button className="rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-white">
                          Marcar como pago
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ACERTO} />
        </section>
      )}
    </main>
  );
}
