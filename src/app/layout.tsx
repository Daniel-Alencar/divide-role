import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Anuncio } from "@/components/anuncio";
import { AvisoCookies } from "@/components/aviso-cookies";
import { NOME_DO_SITE, URL_DO_SITE } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(URL_DO_SITE),
  title: { default: "Dividir conta com amigos e acertar no Pix | Divide Rolê", template: `%s · ${NOME_DO_SITE}` },
  description: "Divida as contas do rolê com os amigos e acerte tudo no Pix, sem cadastro e sem instalar nada.",
  applicationName: NOME_DO_SITE,
  openGraph: { siteName: NOME_DO_SITE, locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image" },
  // Códigos das ferramentas de buscadores (Google Search Console e Bing Webmaster Tools).
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = { themeColor: "#6d28d9" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        {adsense && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">{children}</div>
        <footer className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pb-6">
          <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RODAPE} />
          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
            <Link href="/" className="hover:underline">
              Divide Rolê
            </Link>
            <Link href="/como-funciona" className="hover:underline">
              Como funciona
            </Link>
            <Link href="/guias" className="hover:underline">
              Guias
            </Link>
            <Link href="/privacidade" className="hover:underline">
              Privacidade
            </Link>
            <Link href="/termos" className="hover:underline">
              Termos de uso
            </Link>
          </nav>
        </footer>
        {adsense && <AvisoCookies />}
      </body>
    </html>
  );
}
