import type { Metadata } from "next";
import { PaginaTexto } from "@/components/pagina-texto";
import { EMAIL_CONTATO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de uso · Divide Rolê",
  description: "Regras de uso do Divide Rolê.",
};

export default function Termos() {
  return (
    <PaginaTexto titulo="Termos de uso" atualizadoEm="2 de novembro de 2026">
      <p>Ao usar o Divide Rolê, você concorda com estas regras.</p>

      <h2>O que o site faz</h2>
      <p>
        O Divide Rolê é uma calculadora gratuita: soma os gastos lançados pelo grupo, calcula quem deve para
        quem e gera um código Pix (copia e cola e QR Code) com o valor. O site <strong>não processa,
        intermedia nem guarda pagamentos</strong>. Toda transferência é feita por você, no app do seu banco,
        diretamente para a outra pessoa.
      </p>

      <h2>Responsabilidade pelos dados lançados</h2>
      <ul>
        <li>Os valores e as divisões são informados pelos próprios participantes.</li>
        <li>
          Confira o nome do recebedor e o valor no app do banco antes de confirmar o Pix. O Divide Rolê não
          se responsabiliza por pagamentos feitos para chaves digitadas erradas.
        </li>
        <li>Combinados e desacordos entre participantes são resolvidos entre vocês.</li>
      </ul>

      <h2>Quem pode editar</h2>
      <p>
        Não há login. Quem tem o link do rolê pode lançar, editar e apagar gastos, pessoas e o próprio rolê.
        Compartilhe o link só com quem participou.
      </p>

      <h2>Uso proibido</h2>
      <ul>
        <li>Criar rolês ou lançamentos de forma automatizada ou em massa.</li>
        <li>Usar o site para cobranças falsas, golpes ou para expor dados de outras pessoas.</li>
        <li>Tentar acessar rolês dos quais você não recebeu o link.</li>
      </ul>
      <p>Para evitar abusos, há limites de uso por conexão e por rolê.</p>

      <h2>Disponibilidade</h2>
      <p>
        O serviço é oferecido como está, sem garantia de funcionamento contínuo. Rolês sem alteração por
        180 dias são apagados automaticamente. Guarde o resumo do acerto se precisar dele por mais tempo.
      </p>

      <h2>Mudanças</h2>
      <p>
        Estes termos podem mudar. A data no topo indica a última atualização.
        {EMAIL_CONTATO && (
          <>
            {" "}
            Dúvidas:{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className="text-roxo underline">
              {EMAIL_CONTATO}
            </a>
            .
          </>
        )}
      </p>
    </PaginaTexto>
  );
}
