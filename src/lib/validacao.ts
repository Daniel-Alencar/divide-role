// Validação das entradas dos formulários. Pura (sem banco), para ser testada isoladamente.

import { z } from "zod";
import { reaisParaCentavos } from "./acerto.ts";
import { normalizarChavePix, type TipoChavePix } from "./pix.ts";

export const LIMITES = {
  participantesPorRole: 50,
  gastosPorRole: 300, // repetido na função salvar_gasto do banco
  valorMaximoCentavos: 10_000_000, // R$ 100.000
};

export type Resultado<T> = { ok: true; dados: T } | { ok: false; erro: string };

const Uuid = z.uuid();
export const ehUuid = (valor: unknown): valor is string => Uuid.safeParse(valor).success;

const texto = (max: number, erro: string) =>
  z.string().trim().min(1, erro).max(max, erro);

const TipoChave = z.enum(["cpf_cnpj", "celular", "email", "aleatoria"]);

export function validarNomeRole(nome: unknown): Resultado<string> {
  const r = texto(80, "Dê um nome ao rolê (até 80 caracteres).").safeParse(nome ?? "");
  return r.success ? { ok: true, dados: r.data } : { ok: false, erro: r.error.issues[0].message };
}

export function validarParticipante(entrada: {
  nome: unknown;
  tipoChave: unknown;
  chavePix: unknown;
}): Resultado<{ nome: string; chavePix: string | null }> {
  const nome = texto(40, "Informe um nome (até 40 caracteres).").safeParse(entrada.nome ?? "");
  if (!nome.success) return { ok: false, erro: nome.error.issues[0].message };

  const chaveDigitada = String(entrada.chavePix ?? "").trim();
  if (!chaveDigitada) return { ok: true, dados: { nome: nome.data, chavePix: null } };

  const tipo = TipoChave.safeParse(entrada.tipoChave);
  const chavePix = tipo.success ? normalizarChavePix(tipo.data as TipoChavePix, chaveDigitada) : null;
  if (!chavePix) return { ok: false, erro: "Chave Pix inválida para o tipo escolhido." };
  return { ok: true, dados: { nome: nome.data, chavePix } };
}

export function validarGasto(entrada: {
  descricao: unknown;
  valor: unknown;
  pagoPor: unknown;
  divididoEntre: unknown[];
}): Resultado<{ descricao: string; valorCentavos: number; pagoPor: string; divididoEntre: string[] }> {
  const descricao = texto(80, "Descreva o gasto (até 80 caracteres).").safeParse(entrada.descricao ?? "");
  if (!descricao.success) return { ok: false, erro: descricao.error.issues[0].message };

  const valorCentavos = reaisParaCentavos(String(entrada.valor ?? ""));
  if (!valorCentavos || valorCentavos <= 0 || valorCentavos > LIMITES.valorMaximoCentavos) {
    return { ok: false, erro: "Valor inválido. Use o formato 12,50 (até R$ 100.000)." };
  }

  const divididoEntre = [...new Set(entrada.divididoEntre.map(String))];
  if (!divididoEntre.length) return { ok: false, erro: "Marque quem vai dividir esse gasto." };
  if (!ehUuid(entrada.pagoPor) || !divididoEntre.every(ehUuid)) {
    return { ok: false, erro: "Participante inválido." };
  }

  return {
    ok: true,
    dados: { descricao: descricao.data, valorCentavos, pagoPor: entrada.pagoPor, divididoEntre },
  };
}
