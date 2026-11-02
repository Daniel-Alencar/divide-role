import { test } from "node:test";
import assert from "node:assert/strict";
import { ehUuid, validarGasto, validarNomeRole, validarParticipante } from "./validacao.ts";

const A = "6f1c2b0e-1d2a-4c3b-9e8f-0a1b2c3d4e5f";
const B = "7a2d3c1f-2e3b-4d4c-8f9a-1b2c3d4e5f60";

test("uuid inválido é recusado", () => {
  assert.equal(ehUuid(A), true);
  assert.equal(ehUuid("123"), false);
  assert.equal(ehUuid(undefined), false);
});

test("nome do rolê é obrigatório e tem limite", () => {
  assert.deepEqual(validarNomeRole("  Churrasco  "), { ok: true, dados: "Churrasco" });
  assert.equal(validarNomeRole("   ").ok, false);
  assert.equal(validarNomeRole("x".repeat(81)).ok, false);
  assert.equal(validarNomeRole(null).ok, false);
});

test("participante sem chave Pix é aceito", () => {
  assert.deepEqual(validarParticipante({ nome: "Ana", tipoChave: "celular", chavePix: "" }), {
    ok: true,
    dados: { nome: "Ana", chavePix: null },
  });
});

test("participante com chave Pix é normalizado", () => {
  const r = validarParticipante({ nome: "Ana", tipoChave: "celular", chavePix: "(11) 99999-8888" });
  assert.deepEqual(r, { ok: true, dados: { nome: "Ana", chavePix: "+5511999998888" } });
});

test("chave Pix inválida ou tipo desconhecido são recusados", () => {
  assert.equal(validarParticipante({ nome: "Ana", tipoChave: "cpf_cnpj", chavePix: "123" }).ok, false);
  assert.equal(validarParticipante({ nome: "Ana", tipoChave: "outro", chavePix: "a@b.com" }).ok, false);
  assert.equal(validarParticipante({ nome: "x".repeat(41), tipoChave: "email", chavePix: "" }).ok, false);
});

test("gasto válido remove repetidos da divisão", () => {
  const r = validarGasto({ descricao: "Carne", valor: "120,50", pagoPor: A, divididoEntre: [A, B, B] });
  assert.deepEqual(r, {
    ok: true,
    dados: { descricao: "Carne", valorCentavos: 12050, pagoPor: A, divididoEntre: [A, B] },
  });
});

test("gasto acima de R$ 100.000 ou sem valor é recusado", () => {
  assert.equal(validarGasto({ descricao: "Casa", valor: "100.000,01", pagoPor: A, divididoEntre: [A] }).ok, false);
  assert.equal(validarGasto({ descricao: "Casa", valor: "100.000,00", pagoPor: A, divididoEntre: [A] }).ok, true);
  assert.equal(validarGasto({ descricao: "Casa", valor: "0", pagoPor: A, divididoEntre: [A] }).ok, false);
  assert.equal(validarGasto({ descricao: "Casa", valor: "abc", pagoPor: A, divididoEntre: [A] }).ok, false);
});

test("gasto sem divisão ou com participante inválido é recusado", () => {
  assert.equal(validarGasto({ descricao: "Carne", valor: "10", pagoPor: A, divididoEntre: [] }).ok, false);
  assert.equal(validarGasto({ descricao: "Carne", valor: "10", pagoPor: "x", divididoEntre: [A] }).ok, false);
  assert.equal(validarGasto({ descricao: "Carne", valor: "10", pagoPor: A, divididoEntre: ["x"] }).ok, false);
  assert.equal(validarGasto({ descricao: "", valor: "10", pagoPor: A, divididoEntre: [A] }).ok, false);
});
