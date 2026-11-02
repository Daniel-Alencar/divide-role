"use client";

import { useState } from "react";
import {
  desfazerPagamento,
  marcarPago,
  removerGasto,
  removerParticipante,
  type EstadoForm,
} from "@/app/acoes";
import { BotaoAcao, BotaoCopiar, BotaoWhatsApp } from "@/components/botoes";
import { useEu } from "@/components/eu";
import { FormGasto, FormParticipante } from "@/components/formularios";
import { QrCode } from "@/components/qrcode";
import { formatarCentavos, resumoDoAcerto, type Transferencia } from "@/lib/acerto";
import type { GastoCompleto, Pagamento, Participante } from "@/lib/db";
import { gerarPixCopiaECola } from "@/lib/pix";

const link = "text-sm font-medium text-roxo hover:underline";
const linkPerigo = "text-sm text-red-700 hover:underline";

function useNomes(participantes: Participante[]) {
  const nomes = new Map(participantes.map((p) => [p.id, p.nome]));
  return (id: string) => nomes.get(id) ?? "?";
}

export function QuemSouEu({ roleId, participantes }: { roleId: string; participantes: Participante[] }) {
  const [eu, definirEu] = useEu(roleId);
  if (!participantes.length) return null;
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      Quem é você?
      <select
        value={participantes.some((p) => p.id === eu) ? (eu as string) : ""}
        onChange={(e) => definirEu(e.target.value || null)}
        className="rounded-lg border border-zinc-300 bg-white px-2 py-1"
      >
        <option value="">Escolha seu nome</option>
        {participantes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ListaParticipantes({ roleId, participantes }: { roleId: string; participantes: Participante[] }) {
  const [eu] = useEu(roleId);
  const [editando, setEditando] = useState<string | null>(null);
  if (!participantes.length) return null;

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg bg-white shadow-sm">
      {participantes.map((p) =>
        editando === p.id ? (
          <li key={p.id} className="px-4 py-3">
            <FormParticipante roleId={roleId} participante={p} aoConcluir={() => setEditando(null)} />
          </li>
        ) : (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2">
            <span>
              <span className="font-medium">{p.nome}</span>
              {p.id === eu && <span className="text-zinc-600"> (você)</span>}
              <span className="text-sm text-zinc-600">
                {p.chave_pix ? " · tem Pix" : " · sem chave Pix"}
              </span>
            </span>
            <span className="flex items-center gap-3">
              <button type="button" onClick={() => setEditando(p.id)} className={link}>
                Editar
              </button>
              <BotaoAcao
                acao={() => removerParticipante(roleId, p.id)}
                rotulo="Remover"
                rotuloAcessivel={`Remover ${p.nome}`}
                confirmar={`Remover ${p.nome} do rolê?`}
                className={linkPerigo}
              />
            </span>
          </li>
        ),
      )}
    </ul>
  );
}

export function SecaoGastos({
  roleId,
  participantes,
  gastos,
}: {
  roleId: string;
  participantes: Participante[];
  gastos: GastoCompleto[];
}) {
  const [eu] = useEu(roleId);
  const [editando, setEditando] = useState<string | null>(null);
  const nome = useNomes(participantes);

  return (
    <>
      {gastos.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-lg bg-white shadow-sm">
          {gastos.map((g) =>
            editando === g.id ? (
              <li key={g.id} className="px-4 py-3">
                <FormGasto
                  roleId={roleId}
                  participantes={participantes}
                  gasto={g}
                  aoConcluir={() => setEditando(null)}
                />
              </li>
            ) : (
              <li key={g.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <div>
                  <p className="font-medium">
                    {g.descricao} · {formatarCentavos(g.valor_centavos)}
                  </p>
                  <p className="text-sm text-zinc-600">
                    {nome(g.pago_por)} pagou · dividido entre {g.dividido_entre.map(nome).join(", ")}
                  </p>
                </div>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <button type="button" onClick={() => setEditando(g.id)} className={link}>
                    Editar
                  </button>
                  <BotaoAcao
                    acao={() => removerGasto(roleId, g.id)}
                    rotulo="Remover"
                    rotuloAcessivel={`Remover ${g.descricao}`}
                    confirmar={`Remover o gasto "${g.descricao}"?`}
                    className={linkPerigo}
                  />
                </span>
              </li>
            ),
          )}
        </ul>
      )}
      <FormGasto roleId={roleId} participantes={participantes} pagoPorPadrao={eu} />
    </>
  );
}

function ItemTransferencia({
  roleId,
  nomeRole,
  transferencia: t,
  participantes,
  eu,
  aoMarcarPago,
}: {
  roleId: string;
  nomeRole: string;
  transferencia: Transferencia;
  participantes: Participante[];
  eu: string | null;
  aoMarcarPago: (estado: EstadoForm) => void;
}) {
  const [mostrarQr, setMostrarQr] = useState(false);
  const nome = useNomes(participantes);
  const recebedor = participantes.find((p) => p.id === t.para);
  const pix = recebedor?.chave_pix
    ? gerarPixCopiaECola({
        chave: recebedor.chave_pix,
        nomeRecebedor: recebedor.nome,
        valorCentavos: t.valorCentavos,
        descricao: nomeRole,
      })
    : null;
  const minha = t.de === eu || t.para === eu;

  return (
    <li
      className={`flex flex-col gap-2 rounded-lg bg-white p-4 shadow-sm ${minha ? "ring-2 ring-roxo" : ""}`}
    >
      <p>
        <strong>{t.de === eu ? "Você" : nome(t.de)}</strong> paga{" "}
        <strong>{formatarCentavos(t.valorCentavos)}</strong> para{" "}
        <strong>{t.para === eu ? "você" : nome(t.para)}</strong>
      </p>
      <div className="flex flex-wrap items-start gap-2">
        {pix ? (
          <>
            <BotaoCopiar texto={pix} rotulo="Copiar Pix com valor" />
            <button
              type="button"
              onClick={() => setMostrarQr((v) => !v)}
              aria-expanded={mostrarQr}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-sm font-medium"
            >
              {mostrarQr ? "Esconder QR Code" : "Mostrar QR Code"}
            </button>
          </>
        ) : (
          <span className="text-sm text-zinc-600">{nome(t.para)} ainda não informou a chave Pix</span>
        )}
        <BotaoAcao
          acao={() => marcarPago(roleId, t.de, t.para, t.valorCentavos)}
          rotulo="Marcar como pago"
          pendenteRotulo="Registrando..."
          aoConcluir={aoMarcarPago}
          className="rounded-lg bg-zinc-800 px-3 py-1 text-sm font-medium text-white"
        />
      </div>
      {pix && mostrarQr && (
        <QrCode
          texto={pix}
          rotulo={`QR Code Pix de ${formatarCentavos(t.valorCentavos)} para ${nome(t.para)}`}
        />
      )}
    </li>
  );
}

export function Acerto({
  roleId,
  nomeRole,
  participantes,
  transferencias,
  pagamentos,
}: {
  roleId: string;
  nomeRole: string;
  participantes: Participante[];
  transferencias: Transferencia[];
  pagamentos: Pagamento[];
}) {
  const [eu] = useEu(roleId);
  const nome = useNomes(participantes);
  // Fica aqui, e não no botão: se o acerto mudou, a transferência some da lista junto com o botão.
  const [aviso, setAviso] = useState<string | null>(null);
  // As transferências da pessoa aparecem primeiro.
  const ordenadas = [...transferencias].sort(
    (a, b) => Number(b.de === eu || b.para === eu) - Number(a.de === eu || a.para === eu),
  );
  const resumo = (url: string) =>
    resumoDoAcerto(
      nomeRole,
      transferencias.map((t) => ({ de: nome(t.de), para: nome(t.para), valorCentavos: t.valorCentavos })),
      url,
    );

  return (
    <>
      {aviso && (
        <p role="alert" className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {aviso}
        </p>
      )}
      {ordenadas.length === 0 ? (
        <p className="text-green-700">Tudo certo! Ninguém deve nada. 🎉</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ordenadas.map((t) => (
            <ItemTransferencia
              key={`${t.de}-${t.para}`}
              roleId={roleId}
              nomeRole={nomeRole}
              transferencia={t}
              participantes={participantes}
              eu={eu}
              aoMarcarPago={(estado) => setAviso(estado.erro ?? null)}
            />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <BotaoWhatsApp nomeRole={nomeRole} mensagem={resumo} rotulo="Mandar acerto no WhatsApp" />
        <BotaoCopiar
          texto={() => resumo(window.location.href)}
          rotulo="Copiar resumo"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium"
        />
      </div>

      {pagamentos.length > 0 && (
        <details className="rounded-lg bg-white p-4 shadow-sm">
          <summary className="cursor-pointer font-medium">Pagamentos feitos ({pagamentos.length})</summary>
          <ul className="mt-2 flex flex-col gap-2">
            {pagamentos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {nome(p.de)} pagou {formatarCentavos(p.valor_centavos)} para {nome(p.para)}
                </span>
                <BotaoAcao
                  acao={() => desfazerPagamento(roleId, p.id)}
                  rotulo="Desfazer"
                  confirmar="Desfazer este pagamento? A transferência volta para o acerto."
                  className={linkPerigo}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
