import type { Metadata } from "next";
import Link from "next/link";
import { DadosEstruturados } from "@/components/dados-estruturados";
import { metadadosDaPagina } from "@/lib/seo";

export const metadata: Metadata = metadadosDaPagina({
  titulo: "Como funciona",
  descricao:
    "Como dividir a conta do churrasco, da viagem ou do bar com os amigos e acertar tudo no Pix, passo a passo e sem cadastro.",
  caminho: "/como-funciona",
});

const perguntas = [
  {
    p: "Preciso criar conta?",
    r: "Não. Quem cria o rolê recebe um link. Qualquer pessoa com esse link pode lançar gastos e ver o acerto, sem cadastro.",
  },
  {
    p: "O site faz o pagamento?",
    r: "Não. O Divide Rolê só calcula e gera o código Pix. O pagamento é feito por você, no app do seu banco, direto para a outra pessoa.",
  },
  {
    p: "O link é seguro?",
    r: "O endereço de cada rolê tem um código aleatório impossível de adivinhar. Mesmo assim, ele funciona como uma senha do grupo: só mande para quem participou.",
  },
  {
    p: "E se alguém lançar um gasto errado?",
    r: "Qualquer pessoa do grupo pode editar ou remover o gasto. O acerto é recalculado na hora.",
  },
  {
    p: "Marquei como pago sem querer. E agora?",
    r: 'Abra "Pagamentos feitos", na seção Acerto, e toque em Desfazer.',
  },
  {
    p: "Por quanto tempo o rolê fica salvo?",
    r: "Até alguém apagar, ou por 180 dias sem nenhuma alteração. Depois disso ele é apagado automaticamente.",
  },
];

export default function ComoFunciona() {
  return (
    <main className="flex flex-col gap-8">
      <DadosEstruturados
        dados={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: perguntas.map(({ p, r }) => ({
            "@type": "Question",
            name: p,
            acceptedAnswer: { "@type": "Answer", text: r },
          })),
        }}
      />
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">Como funciona</h1>
        <p className="text-zinc-600">
          Dividir a conta parece fácil até alguém pagar a carne, outro o carvão e um terceiro a cerveja que
          metade do grupo não bebeu. O Divide Rolê resolve isso em três passos.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">1. Crie o rolê e mande o link</h2>
        <p>
          Dê um nome (por exemplo, &quot;Churrasco de sábado&quot;) e toque em Criar rolê. Use o botão
          &quot;Enviar link no WhatsApp&quot; para mandar o endereço no grupo. Cada pessoa adiciona o próprio
          nome e, se quiser receber, a chave Pix.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">2. Cada um lança o que pagou</h2>
        <p>
          Para cada gasto, informe o que foi, o valor, quem pagou e entre quem ele deve ser dividido. Quem não
          participou de um gasto é só desmarcar.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">3. Acerte no Pix</h2>
        <p>
          O site soma tudo, vê quem pagou a mais e quem pagou a menos e monta a lista de transferências.
          Ao lado de cada uma há o Pix copia e cola e o QR Code, já com o valor. Depois de pagar, toque em
          &quot;Marcar como pago&quot;.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Exemplo: o churrasco</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ana pagou R$ 120,00 de carne, dividida entre Ana, Bia e Caio.</li>
          <li>Bia pagou R$ 30,00 de carvão, dividido entre os três.</li>
          <li>Caio pagou R$ 60,00 de cerveja, dividida só entre Caio e Ana (Bia não bebe).</li>
        </ul>
        <p>
          No total, Ana gastou R$ 120,00 e consumiu R$ 80,00. Bia gastou R$ 30,00 e consumiu R$ 50,00. Caio
          gastou R$ 60,00 e consumiu R$ 80,00. O acerto fica:
        </p>
        <ul className="flex flex-col gap-2">
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Bia</strong> paga <strong>R$ 20,00</strong> para <strong>Ana</strong>
          </li>
          <li className="rounded-lg bg-white p-4 shadow-sm">
            <strong>Caio</strong> paga <strong>R$ 20,00</strong> para <strong>Ana</strong>
          </li>
        </ul>
        <p className="text-zinc-600">
          Dois Pix e pronto, em vez de cada um transferir um pouco para cada pessoa. Os centavos que não
          dividem por igual são distribuídos um para cada, então a conta sempre fecha.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Perguntas frequentes</h2>
        {perguntas.map(({ p, r }) => (
          <details key={p} className="rounded-lg bg-white p-4 shadow-sm">
            <summary className="cursor-pointer font-medium">{p}</summary>
            <p className="mt-2 text-zinc-700">{r}</p>
          </details>
        ))}
      </section>

      <Link
        href="/"
        className="self-start rounded-lg bg-roxo px-4 py-2 font-medium text-white hover:bg-roxo-escuro"
      >
        Criar um rolê
      </Link>
    </main>
  );
}
