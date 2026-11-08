import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { calcularSaldos, calcularTransferencias, formatarCentavos } from "@/lib/acerto";
import { GUIAS, guiaPorSlug } from "@/lib/guias";
import { metadadosDaPagina } from "@/lib/seo";
import { NOME_DO_SITE, URL_DO_SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIAS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guia = guiaPorSlug((await params).slug);
  if (!guia) notFound();
  return metadadosDaPagina({ titulo: guia.titulo, descricao: guia.descricao, caminho: `/guias/${guia.slug}` });
}

export default async function PaginaGuia({ params }: Props) {
  const guia = guiaPorSlug((await params).slug);
  if (!guia) notFound();
  const { exemplo } = guia;
  const transferencias = calcularTransferencias(calcularSaldos(exemplo.pessoas, exemplo.gastos));
  const url = `${URL_DO_SITE}/guias/${guia.slug}`;
  const outros = GUIAS.filter((g) => g.slug !== guia.slug);

  return (
    <main className="flex flex-col gap-8">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: guia.titulo,
              description: guia.descricao,
              inLanguage: "pt-BR",
              dateModified: guia.atualizadoEm,
              mainEntityOfPage: url,
              author: { "@type": "Organization", name: NOME_DO_SITE, url: URL_DO_SITE },
              publisher: { "@type": "Organization", name: NOME_DO_SITE, url: URL_DO_SITE },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Guias", item: `${URL_DO_SITE}/guias` },
                { "@type": "ListItem", position: 2, name: guia.titulo, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: guia.perguntas.map(({ p, r }) => ({
                "@type": "Question",
                name: p,
                acceptedAnswer: { "@type": "Answer", text: r },
              })),
            },
          ],
        }}
      />

      <header className="flex flex-col gap-3">
        <nav aria-label="Trilha" className="text-sm text-zinc-600">
          <Link href="/guias" className="hover:underline">
            Guias
          </Link>
        </nav>
        <h1 className="text-3xl font-bold">{guia.titulo}</h1>
        {guia.introducao.map((texto) => (
          <p key={texto} className="text-zinc-700">
            {texto}
          </p>
        ))}
      </header>

      {guia.secoes.map((secao) => (
        <section key={secao.titulo} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{secao.titulo}</h2>
          {secao.paragrafos.map((texto) => (
            <p key={texto}>{texto}</p>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Exemplo com valores</h2>
        <p>{exemplo.contexto}</p>
        <ul className="divide-y divide-zinc-200 rounded-lg bg-white shadow-sm">
          {exemplo.gastos.map((g) => (
            <li key={g.descricao} className="px-4 py-3">
              <p className="font-medium">
                {g.descricao} · {formatarCentavos(g.valorCentavos)}
              </p>
              <p className="text-sm text-zinc-600">
                {g.pagoPor} pagou · dividido entre {g.divididoEntre.join(", ")}
              </p>
            </li>
          ))}
        </ul>
        <p>O acerto fica assim:</p>
        <ul className="flex flex-col gap-2">
          {transferencias.map((t) => (
            <li key={`${t.de}-${t.para}`} className="rounded-lg bg-white p-4 shadow-sm">
              <strong>{t.de}</strong> paga <strong>{formatarCentavos(t.valorCentavos)}</strong> para{" "}
              <strong>{t.para}</strong>
            </li>
          ))}
        </ul>
        <p className="text-zinc-600">{exemplo.comentario}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
        {guia.perguntas.map(({ p, r }) => (
          <div key={p} className="rounded-lg bg-white p-4 shadow-sm">
            <h3 className="font-medium">{p}</h3>
            <p className="mt-2 text-zinc-700">{r}</p>
          </div>
        ))}
      </section>

      <Link
        href="/"
        className="self-start rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro"
      >
        Calcular o meu rolê
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Veja também</h2>
        <ul className="flex flex-col gap-1">
          {outros.map((g) => (
            <li key={g.slug}>
              <Link href={`/guias/${g.slug}`} className="text-roxo hover:underline">
                {g.titulo}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
