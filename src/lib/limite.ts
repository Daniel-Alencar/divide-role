import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { bancoDeDados } from "@/lib/db";

/**
 * Limite de uso por IP (contra robôs enchendo o banco). Guarda só um hash do IP.
 * Se o banco falhar, deixa passar: melhor aceitar um abuso raro do que travar o site.
 */
export async function dentroDoLimite(acao: string, maximo: number, janelaSegundos: number) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
  const chave = createHash("sha256").update(`${acao}:${ip}`).digest("hex");

  const { data, error } = await bancoDeDados().rpc("consumir_limite", {
    p_chave: chave,
    p_maximo: maximo,
    p_janela_segundos: janelaSegundos,
  });
  return error ? true : data === true;
}
