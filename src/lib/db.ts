import "server-only";
import { createClient } from "@supabase/supabase-js";

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
export type Pagamento = { de: string; para: string; valor_centavos: number };

export async function carregarRole(id: string) {
  const db = bancoDeDados();
  const [role, participantes, gastos, pagamentos] = await Promise.all([
    db.from("roles").select("id, nome").eq("id", id).maybeSingle(),
    db.from("participantes").select("id, nome, chave_pix").eq("role_id", id).order("criado_em"),
    db
      .from("gastos")
      .select("id, descricao, valor_centavos, pago_por, gasto_participantes(participante_id)")
      .eq("role_id", id)
      .order("criado_em"),
    db.from("pagamentos").select("de, para, valor_centavos").eq("role_id", id),
  ]);

  for (const r of [role, participantes, gastos, pagamentos]) if (r.error) throw r.error;
  if (!role.data) return null;

  return {
    role: role.data as { id: string; nome: string },
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
