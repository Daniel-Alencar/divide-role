import type { Metadata } from "next";
import Script from "next/script";
import { Anuncio } from "@/components/anuncio";
import "./globals.css";

export const metadata: Metadata = {
  title: "Divide Rolê",
  description: "Divida as contas do rolê com os amigos e acerte tudo no Pix, sem instalar nada.",
};

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
        <footer className="mx-auto w-full max-w-xl px-4 pb-4">
          <Anuncio slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RODAPE} />
        </footer>
      </body>
    </html>
  );
}
