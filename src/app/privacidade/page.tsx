import type { Metadata } from "next";
import { PaginaTexto } from "@/components/pagina-texto";
import { EMAIL_CONTATO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidade · Divide Rolê",
  description: "Quais dados o Divide Rolê guarda, quem pode vê-los, por quanto tempo e como apagá-los.",
};

export default function Privacidade() {
  return (
    <PaginaTexto titulo="Política de privacidade" atualizadoEm="2 de novembro de 2026">
      <p>
        O Divide Rolê foi feito para guardar o mínimo possível. Não há cadastro, login nem coleta de
        documentos. Esta página explica, conforme a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018),
        o que é guardado e por quê.
      </p>

      <h2>Quais dados guardamos</h2>
      <ul>
        <li>O nome do rolê.</li>
        <li>O nome (ou apelido) de cada participante, como foi digitado.</li>
        <li>
          A chave Pix, quando a pessoa decide informar. Ela pode ser um e-mail, telefone, CPF/CNPJ ou chave
          aleatória.
        </li>
        <li>Os gastos (descrição, valor, quem pagou, entre quem foi dividido) e os pagamentos marcados.</li>
        <li>
          Um código irreversível (hash) do endereço IP, apagado em até dois dias, só para limitar
          abusos como a criação automática de rolês. O IP em si não é armazenado.
        </li>
      </ul>

      <h2>Para que usamos</h2>
      <p>
        Exclusivamente para calcular o acerto e gerar o Pix com o valor certo. Os dados não são vendidos,
        compartilhados com terceiros para marketing nem usados para criar perfis. A base legal é a execução
        do serviço que você pediu ao usar o site (art. 7º, V, da LGPD).
      </p>

      <h2>Quem pode ver</h2>
      <p>
        Qualquer pessoa que tenha o link do rolê vê tudo o que foi lançado nele, inclusive as chaves Pix.
        O link funciona como uma senha do grupo: compartilhe só com quem participou. Por isso recomendamos
        usar uma chave Pix aleatória ou e-mail em vez do CPF. As páginas de rolê não aparecem em buscadores.
      </p>

      <h2>Por quanto tempo</h2>
      <p>
        Até alguém do grupo tocar em &quot;Apagar este rolê&quot;, ou por 180 dias sem nenhuma alteração.
        Depois disso o rolê e tudo o que pertence a ele são apagados automaticamente.
      </p>

      <h2>Cookies e anúncios</h2>
      <p>
        O Divide Rolê não usa cookies próprios. No seu navegador ficam guardados só dois lembretes locais:
        qual participante é você em cada rolê, para destacar o que você deve, e se você já viu o aviso de
        cookies. Eles não são enviados para nós.
      </p>
      <p>
        O site é mantido por anúncios do Google AdSense. O Google e seus parceiros podem usar cookies para
        exibir anúncios com base em visitas anteriores a este e a outros sites, e o script de anúncios tem
        acesso ao endereço da página aberta. Você pode desativar a publicidade personalizada em{" "}
        <a href="https://adssettings.google.com" className="text-roxo underline">
          adssettings.google.com
        </a>{" "}
        e saber mais em{" "}
        <a href="https://policies.google.com/technologies/ads" className="text-roxo underline">
          policies.google.com/technologies/ads
        </a>
        .
      </p>

      <h2>Onde os dados ficam</h2>
      <p>
        Em um banco de dados gerenciado pelo Supabase, com acesso restrito ao servidor do site. O navegador
        nunca acessa o banco diretamente.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode corrigir ou remover seu nome e sua chave Pix a qualquer momento na página do rolê (botão
        Editar ou Remover) e apagar o rolê inteiro com o botão &quot;Apagar este rolê&quot;.
        {EMAIL_CONTATO && (
          <>
            {" "}
            Para qualquer outro pedido sobre seus dados, escreva para{" "}
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
