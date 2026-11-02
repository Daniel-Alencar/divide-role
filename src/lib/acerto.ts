// Cálculo do acerto de contas. Tudo em centavos (inteiros) para não perder dinheiro em arredondamento.

export type Gasto = {
  valorCentavos: number;
  pagoPor: string;
  divididoEntre: string[];
};

export type Transferencia = {
  de: string;
  para: string;
  valorCentavos: number;
};

/**
 * Saldo de cada participante: positivo = tem a receber, negativo = deve.
 * Transferências já pagas entram como pagamentos (quem pagou passa a dever menos).
 */
export function calcularSaldos(
  participantes: string[],
  gastos: Gasto[],
  pagamentos: Transferencia[] = [],
): Map<string, number> {
  const saldos = new Map(participantes.map((id) => [id, 0]));
  const somar = (id: string, valor: number) => saldos.set(id, (saldos.get(id) ?? 0) + valor);

  for (const gasto of gastos) {
    const divididoEntre = gasto.divididoEntre.length ? gasto.divididoEntre : participantes;
    if (!divididoEntre.length) continue;

    somar(gasto.pagoPor, gasto.valorCentavos);

    // Divide em partes inteiras; os centavos que sobram vão um para cada, na ordem.
    const parte = Math.floor(gasto.valorCentavos / divididoEntre.length);
    const resto = gasto.valorCentavos % divididoEntre.length;
    divididoEntre.forEach((id, i) => somar(id, -(parte + (i < resto ? 1 : 0))));
  }

  for (const pagamento of pagamentos) {
    somar(pagamento.de, pagamento.valorCentavos);
    somar(pagamento.para, -pagamento.valorCentavos);
  }

  return saldos;
}

/**
 * Quem paga quanto para quem, com poucas transferências: o maior devedor
 * paga o maior credor até zerar um dos dois. Gera no máximo (n - 1) transferências.
 */
export function calcularTransferencias(saldos: Map<string, number>): Transferencia[] {
  const devedores = [...saldos].filter(([, s]) => s < 0).map(([id, s]) => ({ id, valor: -s }));
  const credores = [...saldos].filter(([, s]) => s > 0).map(([id, s]) => ({ id, valor: s }));
  const transferencias: Transferencia[] = [];

  while (devedores.length && credores.length) {
    devedores.sort((a, b) => b.valor - a.valor);
    credores.sort((a, b) => b.valor - a.valor);
    const devedor = devedores[0];
    const credor = credores[0];
    const valor = Math.min(devedor.valor, credor.valor);

    transferencias.push({ de: devedor.id, para: credor.id, valorCentavos: valor });
    devedor.valor -= valor;
    credor.valor -= valor;
    if (!devedor.valor) devedores.shift();
    if (!credor.valor) credores.shift();
  }

  return transferencias;
}

/** "12,50" | "12.50" | "1.234,56" -> 1250 | 1250 | 123456. Retorna null se inválido. */
export function reaisParaCentavos(texto: string): number | null {
  let limpo = texto.trim().replace(/^R\$\s*/i, "");
  if (limpo.includes(",")) limpo = limpo.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  return Math.round(Number(limpo) * 100);
}

export function formatarCentavos(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(centavos / 100);
}

/** Texto do acerto para colar no grupo. Recebe os nomes já resolvidos. */
export function resumoDoAcerto(
  nomeRole: string,
  transferencias: { de: string; para: string; valorCentavos: number }[],
  url: string,
): string {
  const linhas = transferencias.length
    ? transferencias.map((t) => `• ${t.de} paga ${formatarCentavos(t.valorCentavos)} para ${t.para}`)
    : ["Tudo certo! Ninguém deve nada. 🎉"];
  return [`Acerto do rolê "${nomeRole}":`, ...linhas, "", `Pix com o valor certo: ${url}`].join("\n");
}
