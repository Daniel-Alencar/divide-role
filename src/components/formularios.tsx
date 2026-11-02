"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  adicionarGasto,
  adicionarParticipante,
  criarRole,
  type EstadoForm,
} from "@/app/acoes";
import type { Participante } from "@/lib/db";

const campo = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2";
const botao =
  "rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro disabled:opacity-60";

/** Limpa o formulário depois de salvar com sucesso. */
function useLimparAoSalvar(estado: EstadoForm) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (estado.ok) ref.current?.reset();
  }, [estado]);
  return ref;
}

function Erro({ estado }: { estado: EstadoForm }) {
  return estado.erro ? <p className="text-sm text-red-700">{estado.erro}</p> : null;
}

export function FormCriarRole() {
  const [estado, acao, pendente] = useActionState(criarRole, {});
  return (
    <form action={acao} className="flex flex-col gap-3">
      <input name="nome" required maxLength={80} placeholder="Ex.: Churrasco de sábado" className={campo} />
      <button disabled={pendente} className={botao}>
        {pendente ? "Criando..." : "Criar rolê"}
      </button>
      <Erro estado={estado} />
    </form>
  );
}

export function FormParticipante({ roleId }: { roleId: string }) {
  const [estado, acao, pendente] = useActionState(adicionarParticipante.bind(null, roleId), {});
  const ref = useLimparAoSalvar(estado);
  return (
    <form ref={ref} action={acao} className="flex flex-col gap-2">
      <input name="nome" required maxLength={40} placeholder="Nome" className={campo} />
      <div className="flex gap-2">
        <select name="tipo_chave" className="rounded-lg border border-zinc-300 bg-white px-2">
          <option value="celular">Celular</option>
          <option value="cpf_cnpj">CPF/CNPJ</option>
          <option value="email">E-mail</option>
          <option value="aleatoria">Aleatória</option>
        </select>
        <input name="chave_pix" placeholder="Chave Pix (opcional)" className={campo} />
      </div>
      <button disabled={pendente} className={botao}>
        Adicionar pessoa
      </button>
      <Erro estado={estado} />
    </form>
  );
}

export function FormGasto({ roleId, participantes }: { roleId: string; participantes: Participante[] }) {
  const [estado, acao, pendente] = useActionState(adicionarGasto.bind(null, roleId), {});
  const ref = useLimparAoSalvar(estado);
  return (
    <form ref={ref} action={acao} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input name="descricao" required maxLength={80} placeholder="O que foi? (ex.: Carne)" className={campo} />
        <input name="valor" required inputMode="decimal" placeholder="R$ 0,00" className={`${campo} max-w-32`} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        Pago por
        <select name="pago_por" className="flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-2">
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
            <input type="checkbox" name="dividido_entre" value={p.id} defaultChecked />
            {p.nome}
          </label>
        ))}
      </fieldset>
      <button disabled={pendente} className={botao}>
        Adicionar gasto
      </button>
      <Erro estado={estado} />
    </form>
  );
}
