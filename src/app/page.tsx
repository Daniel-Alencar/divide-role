import { FormCriarRole } from "@/components/formularios";

export default function Inicio() {
  return (
    <main className="flex flex-col gap-6 pt-12">
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
    </main>
  );
}
