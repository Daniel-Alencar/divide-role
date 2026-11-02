"use client";

import Link from "next/link";

export default function Erro({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-col gap-4 pt-12">
      <h1 className="text-3xl font-bold">Algo deu errado</h1>
      <p className="text-zinc-600">
        Não conseguimos carregar esta página agora. Seus dados não foram perdidos: tente de novo em
        alguns segundos.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro"
        >
          Tentar de novo
        </button>
        <Link href="/" className="rounded-lg border border-zinc-300 bg-white px-4 py-2 font-medium">
          Página inicial
        </Link>
      </div>
    </main>
  );
}
