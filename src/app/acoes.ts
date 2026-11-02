"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bancoDeDados, lerRole, transferenciasPendentes } from "@/lib/db";
import { dentroDoLimite } from "@/lib/limite";
import { ehUuid, LIMITES, validarGasto, validarNomeRole, validarParticipante } from "@/lib/validacao";

export type EstadoForm = { erro?: string; ok?: boolean };

const MUITAS_TENTATIVAS = { erro: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };
const ROLE_INVALIDO = { erro: "Rolê inválido." };

export async function criarRole(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const nome = validarNomeRole(form.get("nome"));
  if (!nome.ok) return { erro: nome.erro };
  if (!(await dentroDoLimite("criar-role", 10, 3600))) return MUITAS_TENTATIVAS;

  const { data, error } = await bancoDeDados().from("roles").insert({ nome: nome.dados }).select("id").single();
  if (error) return { erro: "Não foi possível criar o rolê." };
  redirect(`/r/${data.id}`);
}

export async function apagarRole(roleId: string): Promise<EstadoForm> {
  if (!ehUuid(roleId)) return ROLE_INVALIDO;
  const { error } = await bancoDeDados().from("roles").delete().eq("id", roleId);
  if (error) return { erro: "Não foi possível apagar o rolê." };
  redirect("/?apagado=1");
}

function lerParticipante(form: FormData) {
  return validarParticipante({
    nome: form.get("nome"),
    tipoChave: form.get("tipo_chave"),
    chavePix: form.get("chave_pix"),
  });
}

const NOME_REPETIDO = "23505";

export async function adicionarParticipante(
  roleId: string,
  _: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  if (!ehUuid(roleId)) return ROLE_INVALIDO;
  const participante = lerParticipante(form);
  if (!participante.ok) return { erro: participante.erro };
  if (!(await dentroDoLimite("participante", 60, 3600))) return MUITAS_TENTATIVAS;

  const db = bancoDeDados();
  const { count } = await db
    .from("participantes")
    .select("id", { count: "exact", head: true })
    .eq("role_id", roleId);
  if ((count ?? 0) >= LIMITES.participantesPorRole) {
    return { erro: `O rolê já tem o máximo de ${LIMITES.participantesPorRole} pessoas.` };
  }

  const { error } = await db.from("participantes").insert({
    role_id: roleId,
    nome: participante.dados.nome,
    chave_pix: participante.dados.chavePix,
  });
  if (error) {
    return { erro: error.code === NOME_REPETIDO ? "Já existe alguém com esse nome." : "Erro ao adicionar." };
  }
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

export async function editarParticipante(
  roleId: string,
  participanteId: string,
  _: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  if (!ehUuid(roleId) || !ehUuid(participanteId)) return ROLE_INVALIDO;
  const participante = lerParticipante(form);
  if (!participante.ok) return { erro: participante.erro };

  const { data, error } = await bancoDeDados()
    .from("participantes")
    .update({ nome: participante.dados.nome, chave_pix: participante.dados.chavePix })
    .eq("id", participanteId)
    .eq("role_id", roleId)
    .select("id");
  if (error) {
    return { erro: error.code === NOME_REPETIDO ? "Já existe alguém com esse nome." : "Erro ao salvar." };
  }
  if (!data.length) return { erro: "Pessoa não encontrada." };
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

export async function removerParticipante(roleId: string, participanteId: string): Promise<EstadoForm> {
  if (!ehUuid(roleId) || !ehUuid(participanteId)) return ROLE_INVALIDO;
  const { data, error } = await bancoDeDados().rpc("remover_participante", {
    p_role_id: roleId,
    p_participante_id: participanteId,
  });
  if (error) return { erro: "Erro ao remover." };
  if (!data) return { erro: "Essa pessoa já está em algum gasto ou pagamento. Remova esses lançamentos antes." };
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

/** Cria um gasto (gastoId nulo) ou edita um existente. A divisão é gravada na mesma transação. */
export async function salvarGasto(
  roleId: string,
  gastoId: string | null,
  _: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  if (!ehUuid(roleId) || (gastoId !== null && !ehUuid(gastoId))) return ROLE_INVALIDO;
  const gasto = validarGasto({
    descricao: form.get("descricao"),
    valor: form.get("valor"),
    pagoPor: form.get("pago_por"),
    divididoEntre: form.getAll("dividido_entre"),
  });
  if (!gasto.ok) return { erro: gasto.erro };
  if (!(await dentroDoLimite("gasto", 200, 3600))) return MUITAS_TENTATIVAS;

  const { data, error } = await bancoDeDados().rpc("salvar_gasto", {
    p_role_id: roleId,
    p_gasto_id: gastoId,
    p_descricao: gasto.dados.descricao,
    p_valor_centavos: gasto.dados.valorCentavos,
    p_pago_por: gasto.dados.pagoPor,
    p_dividido_entre: gasto.dados.divididoEntre,
  });
  if (error) return { erro: "Erro ao salvar o gasto." };
  if (!data) {
    return { erro: `Participante inválido ou o rolê já tem o máximo de ${LIMITES.gastosPorRole} gastos.` };
  }

  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

export async function removerGasto(roleId: string, gastoId: string): Promise<EstadoForm> {
  if (!ehUuid(roleId) || !ehUuid(gastoId)) return ROLE_INVALIDO;
  const { error } = await bancoDeDados().from("gastos").delete().eq("id", gastoId).eq("role_id", roleId);
  if (error) return { erro: "Erro ao remover o gasto." };
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

/**
 * Registra uma transferência do acerto. O servidor recalcula o acerto e só aceita se essa
 * transferência ainda está pendente, e o banco recusa se o rolê mudou nesse meio tempo.
 */
export async function marcarPago(
  roleId: string,
  de: string,
  para: string,
  valorCentavos: number,
): Promise<EstadoForm> {
  if (![roleId, de, para].every(ehUuid)) return ROLE_INVALIDO;

  const dados = await lerRole(roleId);
  if (!dados) return ROLE_INVALIDO;
  const pendente = transferenciasPendentes(dados).some(
    (t) => t.de === de && t.para === para && t.valorCentavos === valorCentavos,
  );

  const { data, error } = pendente
    ? await bancoDeDados().rpc("registrar_pagamento", {
        p_role_id: roleId,
        p_de: de,
        p_para: para,
        p_valor_centavos: valorCentavos,
        p_versao: dados.role.versao,
      })
    : { data: false, error: null };

  revalidatePath(`/r/${roleId}`);
  if (error) return { erro: "Erro ao registrar o pagamento." };
  if (!data) return { erro: "O acerto mudou enquanto você olhava. Confira os valores atualizados." };
  return { ok: true };
}

export async function desfazerPagamento(roleId: string, pagamentoId: string): Promise<EstadoForm> {
  if (!ehUuid(roleId) || !ehUuid(pagamentoId)) return ROLE_INVALIDO;
  const { error } = await bancoDeDados()
    .from("pagamentos")
    .delete()
    .eq("id", pagamentoId)
    .eq("role_id", roleId);
  if (error) return { erro: "Erro ao desfazer o pagamento." };
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}
