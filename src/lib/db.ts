import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { calcularSaldos, calcularTransferencias, type Transferencia } from "@/lib/acerto";

/**
 * Service role: o navegador nunca fala com o banco. Toda consulta
 * precisa filtrar pelo rolê do link, que é a única "senha" do grupo.
 */
export function bancoDeDados() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!url || !chave) throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY");
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type Participante = { id: string; nome: string; chave_pix: string | null };
export type GastoCompleto = {
  id: string;
  descricao: string;
  valor_centavos: number;
  pago_por: string;
  dividido_entre: string[];
};
export type Pagamento = { id: string; de: string; para: string; valor_centavos: number; criado_em: string };
export type DadosRole = NonNullable<Awaited<ReturnType<typeof lerRole>>>;

/** Lê o rolê completo direto do banco. As server actions usam esta versão, sem cache. */
export async function lerRole(id: string) {
  const db = bancoDeDados();
  const [role, participantes, gastos, pagamentos] = await Promise.all([
    db.from("roles").select("id, nome, versao").eq("id", id).maybeSingle(),
    db.from("participantes").select("id, nome, chave_pix").eq("role_id", id).order("criado_em"),
    db
      .from("gastos")
      .select("id, descricao, valor_centavos, pago_por, gasto_participantes(participante_id)")
      .eq("role_id", id)
      .order("criado_em"),
    db.from("pagamentos").select("id, de, para, valor_centavos, criado_em").eq("role_id", id).order("criado_em"),
  ]);

  for (const r of [role, participantes, gastos, pagamentos]) if (r.error) throw r.error;
  if (!role.data) return null;

  return {
    role: role.data as { id: string; nome: string; versao: number },
    participantes: (participantes.data ?? []) as Participante[],
    gastos: (gastos.data ?? []).map((g) => ({
      id: g.id,
      descricao: g.descricao,
      valor_centavos: g.valor_centavos,
      pago_por: g.pago_por,
      dividido_entre: (g.gasto_participantes as { participante_id: string }[]).map((p) => p.participante_id),
    })) as GastoCompleto[],
    pagamentos: (pagamentos.data ?? []) as Pagamento[],
  };
}

/** Em cache por requisição: a página, o metadata e a imagem de prévia compartilham a mesma leitura. */
export const carregarRole = cache(lerRole);

/** Transferências que ainda faltam, considerando os pagamentos já feitos. */
export function transferenciasPendentes(dados: DadosRole): Transferencia[] {
  return calcularTransferencias(
    calcularSaldos(
      dados.participantes.map((p) => p.id),
      dados.gastos.map((g) => ({
        valorCentavos: g.valor_centavos,
        pagoPor: g.pago_por,
        divididoEntre: g.dividido_entre,
      })),
      dados.pagamentos.map((p) => ({ de: p.de, para: p.para, valorCentavos: p.valor_centavos })),
    ),
  );
}
