"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  adicionarParticipante,
  criarRole,
  editarParticipante,
  salvarGasto,
  type EstadoForm,
} from "@/app/acoes";
import type { GastoCompleto, Participante } from "@/lib/db";
import { tipoDaChave } from "@/lib/pix";

export const campo = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2";
export const botao =
  "rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro disabled:opacity-60";
export const botaoSecundario = "rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium";

/** Limpa o formulário (ou fecha a edição) depois de salvar com sucesso. */
function useAoSalvar(estado: EstadoForm, aoSalvar?: () => void) {
  const ref = useRef<HTMLFormElement>(null);
  const callback = useRef(aoSalvar);
  callback.current = aoSalvar;
  useEffect(() => {
    if (!estado.ok) return;
    ref.current?.reset();
    callback.current?.();
  }, [estado]);
  return ref;
}

export function Erro({ estado }: { estado: EstadoForm }) {
  return (
    <p role="alert" className="text-sm text-red-700 empty:hidden">
      {estado.erro}
    </p>
  );
}

export function FormCriarRole() {
  const [estado, acao, pendente] = useActionState(criarRole, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <label htmlFor="nome-role" className="sr-only">
        Nome do rolê
      </label>
      <input
        id="nome-role"
        name="nome"
        required
        maxLength={80}
        placeholder="Ex.: Churrasco de sábado"
        className={campo}
      />
      <button disabled={pendente} className={botao}>
        {pendente ? "Criando..." : "Criar rolê"}
      </button>
      <Erro estado={estado} />
    </form>
  );
}

/** Adiciona uma pessoa ou, com `participante`, edita nome e chave Pix. */
export function FormParticipante({
  roleId,
  participante,
  aoConcluir,
}: {
  roleId: string;
  participante?: Participante;
  aoConcluir?: () => void;
}) {
  const acaoServidor = participante
    ? editarParticipante.bind(null, roleId, participante.id)
    : adicionarParticipante.bind(null, roleId);
  const [estado, acao, pendente] = useActionState(acaoServidor, {});
  const ref = useAoSalvar(estado, aoConcluir);
  const prefixo = participante ? `p-${participante.id}` : "novo-participante";

  return (
    <form ref={ref} action={acao} className="flex flex-col gap-2">
      <label htmlFor={`${prefixo}-nome`} className="sr-only">
        Nome
      </label>
      <input
        id={`${prefixo}-nome`}
        name="nome"
        required
        maxLength={40}
        placeholder="Nome"
        defaultValue={participante?.nome}
        className={campo}
      />
      <div className="flex gap-2">
        <label htmlFor={`${prefixo}-tipo`} className="sr-only">
          Tipo de chave Pix
        </label>
        <select
          id={`${prefixo}-tipo`}
          name="tipo_chave"
          defaultValue={participante?.chave_pix ? tipoDaChave(participante.chave_pix) : "aleatoria"}
          className="rounded-lg border border-zinc-300 bg-white px-2"
        >
          <option value="aleatoria">Aleatória</option>
          <option value="email">E-mail</option>
          <option value="celular">Celular</option>
          <option value="cpf_cnpj">CPF/CNPJ</option>
        </select>
        <label htmlFor={`${prefixo}-chave`} className="sr-only">
          Chave Pix (opcional)
        </label>
        <input
          id={`${prefixo}-chave`}
          name="chave_pix"
          placeholder="Chave Pix (opcional)"
          defaultValue={participante?.chave_pix ?? ""}
          className={campo}
        />
      </div>
      <p className="text-xs text-zinc-600">
        Quem tiver o link do rolê verá a chave Pix. Prefira a chave aleatória ou o e-mail em vez do CPF.
      </p>
      <div className="flex gap-2">
        <button disabled={pendente} className={`${botao} flex-1`}>
          {participante ? "Salvar" : "Adicionar pessoa"}
        </button>
        {aoConcluir && (
          <button type="button" onClick={aoConcluir} className={botaoSecundario}>
            Cancelar
          </button>
        )}
      </div>
      <Erro estado={estado} />
    </form>
  );
}

const centavosParaCampo = (centavos: number) => (centavos / 100).toFixed(2).replace(".", ",");

/** Lança um gasto ou, com `gasto`, edita um existente. */
export function FormGasto({
  roleId,
  participantes,
  gasto,
  pagoPorPadrao,
  aoConcluir,
}: {
  roleId: string;
  participantes: Participante[];
  gasto?: GastoCompleto;
  pagoPorPadrao?: string | null;
  aoConcluir?: () => void;
}) {
  const [estado, acao, pendente] = useActionState(salvarGasto.bind(null, roleId, gasto?.id ?? null), {});
  const ref = useAoSalvar(estado, aoConcluir);
  const prefixo = gasto ? `g-${gasto.id}` : "novo-gasto";
  const pagoPor = gasto?.pago_por ?? (participantes.some((p) => p.id === pagoPorPadrao) ? pagoPorPadrao : null);

  return (
    <form ref={ref} action={acao} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor={`${prefixo}-descricao`} className="sr-only">
          Descrição
        </label>
        <input
          id={`${prefixo}-descricao`}
          name="descricao"
          required
          maxLength={80}
          placeholder="O que foi? (ex.: Carne)"
          defaultValue={gasto?.descricao}
          className={campo}
        />
        <label htmlFor={`${prefixo}-valor`} className="sr-only">
          Valor em reais
        </label>
        <input
          id={`${prefixo}-valor`}
          name="valor"
          required
          inputMode="decimal"
          placeholder="R$ 0,00"
          defaultValue={gasto ? centavosParaCampo(gasto.valor_centavos) : undefined}
          className={`${campo} max-w-32`}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        Pago por
        <select
          key={pagoPor ?? "primeiro"}
          name="pago_por"
          defaultValue={pagoPor ?? undefined}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-2"
        >
          {participantes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <legend className="mb-1">Dividido entre</legend>
        {participantes.map((p) => (
          <label key={p.id} className="flex items-center gap-1">
            <input
              type="checkbox"
              name="dividido_entre"
              value={p.id}
              defaultChecked={gasto ? gasto.dividido_entre.includes(p.id) : true}
            />
            {p.nome}
          </label>
        ))}
      </fieldset>
      <div className="flex gap-2">
        <button disabled={pendente} className={`${botao} flex-1`}>
          {pendente ? "Salvando..." : gasto ? "Salvar gasto" : "Adicionar gasto"}
        </button>
        {aoConcluir && (
          <button type="button" onClick={aoConcluir} className={botaoSecundario}>
            Cancelar
          </button>
        )}
      </div>
      <Erro estado={estado} />
    </form>
  );
}
