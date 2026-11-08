import type { Metadata } from "next";
import Link from "next/link";
import { GUIAS } from "@/lib/guias";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadadosDaPagina({
  titulo: "Guias para dividir contas com amigos",
  descricao:
    "Guias práticos para dividir a conta do churrasco, do bar, da viagem e da casa, com exemplos de cálculo e acerto no Pix.",
  caminho: "/guias",
});

export default function Guias() {
  return (
    <main className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Guias para dividir contas com amigos</h1>
        <p className="text-zinc-600">
          Cada situação tem a sua pegadinha. Veja como dividir de forma justa, com exemplos calculados.
        </p>
      </header>
      <ul className="flex flex-col gap-3">
        {GUIAS.map((g) => (
          <li key={g.slug} className="rounded-lg bg-white p-4 shadow-sm">
            <Link href={`/guias/${g.slug}`} className="font-semibold text-roxo hover:underline">
              {g.titulo}
            </Link>
            <p className="mt-1 text-zinc-600">{g.resumo}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
