import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AvisoApagado } from "@/components/aviso-apagado";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { FormCriarRole } from "@/components/formularios";
import { GUIAS } from "@/lib/guias";
import { metadadosDaPagina } from "@/lib/seo";
import { NOME_DO_SITE, URL_DO_SITE } from "@/lib/site";

export const metadata: Metadata = metadadosDaPagina({
  titulo: "Dividir conta com amigos e acertar no Pix | Divide Rolê",
  descricao:
    "Divida a conta do churrasco, do bar ou da viagem sem cadastro: o site calcula quem deve para quem e gera o Pix com o valor certo. Grátis.",
  caminho: "/",
  tituloCompleto: true,
});

export default function Inicio() {
  return (
    <main className="flex flex-col gap-6 pt-12">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", name: NOME_DO_SITE, url: URL_DO_SITE, inLanguage: "pt-BR" },
            {
              "@type": "WebApplication",
              name: NOME_DO_SITE,
              url: URL_DO_SITE,
              description: "Calcula quem deve para quem em um grupo e gera o Pix com o valor certo.",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Qualquer navegador",
              inLanguage: "pt-BR",
              offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
            },
          ],
        }}
      />
      <Suspense>
        <AvisoApagado />
      </Suspense>
      <p className="font-semibold text-roxo">{NOME_DO_SITE}</p>
      <h1 className="text-4xl font-bold">Divida a conta com os amigos e acerte no Pix</h1>
      <p className="text-lg text-zinc-600">
        Cada um lança o que pagou, a gente calcula quem deve para quem e gera o Pix com o valor
        certo. Sem cadastro e sem instalar nada.
      </p>
      <FormCriarRole />
      <ol className="list-decimal space-y-1 pl-5 text-zinc-600">
        <li>Crie o rolê e mande o link no grupo.</li>
        <li>Cada pessoa adiciona o que pagou.</li>
        <li>No fim, cada um vê quanto deve e paga com Pix copia e cola.</li>
      </ol>

      <section className="flex flex-col gap-3 pt-6">
        <h2 className="text-xl font-semibold">Por que usar</h2>
        <ul className="flex flex-col gap-3">
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Ninguém precisa baixar app.</strong> Funciona no navegador do celular. Basta abrir o link
            que chegou no grupo.
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Menos transferências.</strong> Em vez de cada um pagar um pouco para cada pessoa, o
            site junta as dívidas e diz o mínimo de Pix necessário.
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Pix já com o valor.</strong> Copie o código ou leia o QR Code no app do banco, sem
            digitar chave nem valor.
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Quem não bebe não paga a cerveja.</strong> Cada gasto pode ser dividido só entre quem
            participou dele.
          </li>
        </ul>
        <Link href="/como-funciona" className="font-medium text-roxo hover:underline">
          Veja um exemplo completo de como funciona →
        </Link>
      </section>

      <section className="flex flex-col gap-3 pt-6">
        <h2 className="text-xl font-semibold">Como dividir cada tipo de conta</h2>
        <ul className="flex flex-col gap-2">
          {GUIAS.map((g) => (
            <li key={g.slug}>
              <Link href={`/guias/${g.slug}`} className="font-medium text-roxo hover:underline">
                {g.titulo}
              </Link>
              <p className="text-zinc-600">{g.resumo}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
