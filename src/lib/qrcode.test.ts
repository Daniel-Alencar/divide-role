import { test } from "node:test";
import assert from "node:assert/strict";
import { gerarQrCode } from "./qrcode.ts";
import { gerarPixCopiaECola } from "./pix.ts";

const pix = gerarPixCopiaECola({
  chave: "123e4567-e12b-12d1-a456-426655440000",
  nomeRecebedor: "Fulano de Tal",
  valorCentavos: 123456,
  descricao: "Churrasco de sábado",
});

/** Localizador 7x7: borda escura, anel claro, centro 3x3 escuro. */
function temLocalizador(m: boolean[][], x0: number, y0: number) {
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const d = Math.max(Math.abs(x - 3), Math.abs(y - 3));
      if (m[y0 + y][x0 + x] !== (d !== 2)) return false;
    }
  }
  return true;
}

test("tamanho cresce com o texto (versão = (lado - 17) / 4)", () => {
  assert.equal(gerarQrCode("ola").length, 21);
  const m = gerarQrCode(pix);
  assert.equal((m.length - 17) % 4, 0);
  assert.ok(m.every((linha) => linha.length === m.length));
  assert.ok(gerarQrCode("x".repeat(400)).length > m.length);
});

test("tem os três localizadores, a linha de sincronia e o módulo escuro fixo", () => {
  const m = gerarQrCode(pix);
  const n = m.length;
  assert.ok(temLocalizador(m, 0, 0));
  assert.ok(temLocalizador(m, n - 7, 0));
  assert.ok(temLocalizador(m, 0, n - 7));
  for (let i = 8; i < n - 8; i++) {
    assert.equal(m[6][i], i % 2 === 0);
    assert.equal(m[i][6], i % 2 === 0);
  }
  assert.equal(m[n - 8][8], true);
});

test("é determinístico e recusa texto grande demais", () => {
  assert.deepEqual(gerarQrCode(pix), gerarQrCode(pix));
  assert.throws(() => gerarQrCode("x".repeat(3000)));
});
