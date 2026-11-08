import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularSaldos, calcularTransferencias } from "./acerto.ts";
import { GUIAS } from "./guias.ts";

test("slugs são únicos e próprios para URL", () => {
  assert.equal(new Set(GUIAS.map((g) => g.slug)).size, GUIAS.length);
  for (const g of GUIAS) assert.match(g.slug, /^[a-z0-9-]+$/);
});

test("título e descrição cabem no resultado da busca", () => {
  for (const g of GUIAS) {
    assert.ok(g.titulo.length <= 50, `título longo: ${g.titulo}`);
    assert.ok(g.descricao.length >= 110 && g.descricao.length <= 160, `descrição: ${g.descricao.length} (${g.slug})`);
  }
});

test("exemplos só usam pessoas do grupo e geram acerto", () => {
  for (const { exemplo, slug } of GUIAS) {
    for (const gasto of exemplo.gastos) {
      assert.ok(exemplo.pessoas.includes(gasto.pagoPor), slug);
      assert.ok(gasto.divididoEntre.every((p) => exemplo.pessoas.includes(p)), slug);
    }
    const transferencias = calcularTransferencias(calcularSaldos(exemplo.pessoas, exemplo.gastos));
    assert.ok(transferencias.length > 0, slug);
    assert.ok(transferencias.length < exemplo.pessoas.length, slug);
  }
});
