"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { reaisParaCentavos } from "@/lib/acerto";
import { bancoDeDados } from "@/lib/db";
import { normalizarChavePix, type TipoChavePix } from "@/lib/pix";

export type EstadoForm = { erro?: string; ok?: boolean };

const Uuid = z.uuid();

export async function criarRole(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const nome = String(form.get("nome") ?? "").trim();
  if (!nome || nome.length > 80) return { erro: "Dê um nome ao rolê (até 80 caracteres)." };

  const { data, error } = await bancoDeDados().from("roles").insert({ nome }).select("id").single();
  if (error) return { erro: "Não foi possível criar o rolê." };
  redirect(`/r/${data.id}`);
}

export async function adicionarParticipante(
  roleId: string,
  _: EstadoForm,
  form: FormData,
): Promise<EstadoForm> {
  if (!Uuid.safeParse(roleId).success) return { erro: "Rolê inválido." };

  const nome = String(form.get("nome") ?? "").trim();
  if (!nome || nome.length > 40) return { erro: "Informe um nome (até 40 caracteres)." };

  const chaveDigitada = String(form.get("chave_pix") ?? "").trim();
  let chavePix: string | null = null;
  if (chaveDigitada) {
    chavePix = normalizarChavePix(String(form.get("tipo_chave")) as TipoChavePix, chaveDigitada);
    if (!chavePix) return { erro: "Chave Pix inválida para o tipo escolhido." };
  }

  const { error } = await bancoDeDados()
    .from("participantes")
    .insert({ role_id: roleId, nome, chave_pix: chavePix });
  if (error) {
    return { erro: error.code === "23505" ? "Já existe alguém com esse nome." : "Erro ao adicionar." };
  }
  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

/** Garante que os participantes informados pertencem a este rolê. */
async function participantesDoRole(roleId: string, ids: string[]) {
  const { data } = await bancoDeDados()
    .from("participantes")
    .select("id")
    .eq("role_id", roleId)
    .in("id", ids);
  return new Set((data ?? []).map((p) => p.id));
}

export async function adicionarGasto(roleId: string, _: EstadoForm, form: FormData): Promise<EstadoForm> {
  if (!Uuid.safeParse(roleId).success) return { erro: "Rolê inválido." };

  const descricao = String(form.get("descricao") ?? "").trim();
  const valorCentavos = reaisParaCentavos(String(form.get("valor") ?? ""));
  const pagoPor = String(form.get("pago_por") ?? "");
  const divididoEntre = form.getAll("dividido_entre").map(String);

  if (!descricao || descricao.length > 80) return { erro: "Descreva o gasto (até 80 caracteres)." };
  if (!valorCentavos || valorCentavos <= 0 || valorCentavos > 10_000_000) {
    return { erro: "Valor inválido. Use o formato 12,50." };
  }
  if (!divididoEntre.length) return { erro: "Marque quem vai dividir esse gasto." };

  const validos = await participantesDoRole(roleId, [pagoPor, ...divididoEntre]);
  if (!validos.has(pagoPor) || !divididoEntre.every((id) => validos.has(id))) {
    return { erro: "Participante inválido." };
  }

  const db = bancoDeDados();
  const { data: gasto, error } = await db
    .from("gastos")
    .insert({ role_id: roleId, descricao, valor_centavos: valorCentavos, pago_por: pagoPor })
    .select("id")
    .single();
  if (error) return { erro: "Erro ao salvar o gasto." };

  const { error: erroDivisao } = await db
    .from("gasto_participantes")
    .insert(divididoEntre.map((participante_id) => ({ gasto_id: gasto.id, participante_id })));
  if (erroDivisao) {
    await db.from("gastos").delete().eq("id", gasto.id);
    return { erro: "Erro ao salvar o gasto." };
  }

  revalidatePath(`/r/${roleId}`);
  return { ok: true };
}

export async function removerGasto(roleId: string, gastoId: string) {
  if (!Uuid.safeParse(roleId).success || !Uuid.safeParse(gastoId).success) return;
  await bancoDeDados().from("gastos").delete().eq("id", gastoId).eq("role_id", roleId);
  revalidatePath(`/r/${roleId}`);
}

export async function marcarPago(roleId: string, de: string, para: string, valorCentavos: number) {
  if (![roleId, de, para].every((id) => Uuid.safeParse(id).success)) return;
  if (!Number.isInteger(valorCentavos) || valorCentavos <= 0) return;

  const validos = await participantesDoRole(roleId, [de, para]);
  if (!validos.has(de) || !validos.has(para)) return;

  await bancoDeDados()
    .from("pagamentos")
    .insert({ role_id: roleId, de, para, valor_centavos: valorCentavos });
  revalidatePath(`/r/${roleId}`);
}
