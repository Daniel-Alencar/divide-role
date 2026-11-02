import Link from "next/link";
import { Suspense } from "react";
import { AvisoApagado } from "@/components/aviso-apagado";
import { FormCriarRole } from "@/components/formularios";

export default function Inicio() {
  return (
    <main className="flex flex-col gap-6 pt-12">
      <Suspense>
        <AvisoApagado />
      </Suspense>
      <h1 className="text-4xl font-bold">Divide Rolê</h1>
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
    </main>
  );
}
