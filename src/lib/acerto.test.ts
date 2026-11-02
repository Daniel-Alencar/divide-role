import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularSaldos, calcularTransferencias, reaisParaCentavos, resumoDoAcerto } from "./acerto.ts";

test("divide igualmente e quem pagou recebe", () => {
  const saldos = calcularSaldos(["ana", "bia", "caio"], [
    { valorCentavos: 9000, pagoPor: "ana", divididoEntre: ["ana", "bia", "caio"] },
  ]);
  assert.deepEqual(Object.fromEntries(saldos), { ana: 6000, bia: -3000, caio: -3000 });
});

test("centavos que sobram não somem", () => {
  const saldos = calcularSaldos(["a", "b", "c"], [
    { valorCentavos: 1000, pagoPor: "a", divididoEntre: ["a", "b", "c"] },
  ]);
  const total = [...saldos.values()].reduce((s, v) => s + v, 0);
  assert.equal(total, 0);
});

test("quem não participou do gasto não paga", () => {
  const saldos = calcularSaldos(["ana", "bia", "caio"], [
    { valorCentavos: 6000, pagoPor: "ana", divididoEntre: ["ana", "bia"] },
  ]);
  assert.equal(saldos.get("caio"), 0);
  assert.equal(saldos.get("bia"), -3000);
});

test("transferências zeram todos os saldos", () => {
  const participantes = ["ana", "bia", "caio", "duda"];
  const saldos = calcularSaldos(participantes, [
    { valorCentavos: 18000, pagoPor: "ana", divididoEntre: participantes },
    { valorCentavos: 9500, pagoPor: "bia", divididoEntre: ["bia", "caio", "duda"] },
    { valorCentavos: 4001, pagoPor: "duda", divididoEntre: [] },
  ]);
  const transferencias = calcularTransferencias(saldos);
  assert.ok(transferencias.length <= participantes.length - 1);

  const depois = calcularSaldos(participantes, [], transferencias);
  for (const [id, saldo] of saldos) assert.equal(saldo + depois.get(id)!, 0);
});

test("pagamentos feitos abatem o que falta", () => {
  const gastos = [{ valorCentavos: 4000, pagoPor: "ana", divididoEntre: ["ana", "bia"] }];
  const saldos = calcularSaldos(["ana", "bia"], gastos, [{ de: "bia", para: "ana", valorCentavos: 2000 }]);
  assert.deepEqual(calcularTransferencias(saldos), []);
});

test("converte reais digitados para centavos", () => {
  assert.equal(reaisParaCentavos("12,50"), 1250);
  assert.equal(reaisParaCentavos("R$ 1.234,56"), 123456);
  assert.equal(reaisParaCentavos("7"), 700);
  assert.equal(reaisParaCentavos("12.5"), 1250);
  assert.equal(reaisParaCentavos("abc"), null);
  assert.equal(reaisParaCentavos("1,234"), null);
});

test("resumo do acerto lista as transferências e o link", () => {
  const texto = resumoDoAcerto("Bar", [{ de: "Bia", para: "Ana", valorCentavos: 3050 }], "https://x/r/1");
  assert.match(texto, /Acerto do rolê "Bar":/);
  assert.match(texto, /• Bia paga R\$\s30,50 para Ana/);
  assert.match(texto, /https:\/\/x\/r\/1$/);
  assert.match(resumoDoAcerto("Bar", [], "u"), /Ninguém deve nada/);
});
