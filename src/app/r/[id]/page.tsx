import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apagarRole } from "@/app/acoes";
import { Anuncio } from "@/components/anuncio";
import { BotaoAcao, BotaoWhatsApp } from "@/components/botoes";
import { FormParticipante } from "@/components/formularios";
import { Acerto, ListaParticipantes, QuemSouEu, SecaoGastos } from "@/components/role";
import { formatarCentavos } from "@/lib/acerto";
import { carregarRole, transferenciasPendentes } from "@/lib/db";
import { ehUuid } from "@/lib/validacao";

type Props = { params: Promise<{ id: string }> };

async function dadosOu404(id: string) {
  const dados = ehUuid(id) ? await carregarRole(id) : null;
  if (!dados) notFound();
  return dados;
}

// O link do rolê é privado: não indexar nos buscadores. O título aparece na prévia do WhatsApp.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await dadosOu404((await params).id);
  return {
    title: role.nome,
    description: "Lance o que você pagou e veja quanto cada um deve, com Pix já no valor certo.",
    robots: { index: false, follow: false },
  };
}

export default async function PaginaRole({ params }: Props) {
  const dados = await dadosOu404((await params).id);
  const { role, participantes, gastos, pagamentos } = dados;
  const total = gastos.reduce((soma, g) => soma + g.valor_centavos, 0);

  return (
    <main className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{role.nome}</h1>
        <p className="text-zinc-600">Total do rolê: {formatarCentavos(total)}</p>
        <BotaoWhatsApp nomeRole={role.nome} />
        <QuemSouEu roleId={role.id} participantes={participantes} />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Quem está no rolê</h2>
        <ListaParticipantes roleId={role.id} participantes={participantes} />
        <FormParticipante roleId={role.id} />
      </section>

      {participantes.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Gastos</h2>
          <SecaoGastos roleId={role.id} participantes={participantes} gastos={gastos} />
        </section>
      )}

      {gastos.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">Acerto</h2>
          <Acerto
            roleId={role.id}
            nomeRole={role.nome}
            participantes={participantes}
            transferencias={transferenciasPendentes(dados)}
            pagamentos={pagamentos}
          />
          <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_ACERTO} />
        </section>
      )}

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-6 text-sm text-zinc-600">
        <p>
          Terminou o acerto? Apague o rolê para remover nomes e chaves Pix do site. Rolês sem alteração
          por 180 dias são apagados automaticamente.
        </p>
        <BotaoAcao
          acao={apagarRole.bind(null, role.id)}
          rotulo="Apagar este rolê"
          pendenteRotulo="Apagando..."
          confirmar="Apagar o rolê para todo mundo? Isso não pode ser desfeito."
          className="self-start rounded-lg border border-red-300 px-3 py-1 font-medium text-red-700"
        />
      </section>
    </main>
  );
}
