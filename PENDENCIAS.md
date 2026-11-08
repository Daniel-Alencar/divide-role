# Pendências do Divide Rolê

Situação em 02/11/2026. Todo o código previsto está pronto e testado. O que sobra depende de contas externas, de testes no celular ou de decisões suas.

## Onde estamos

| Verificação | Situação |
|---|---|
| `npm run typecheck`, `npm test` (25 testes) e `npm run build` | ✅ passam |
| Migrations `0001` e `0002` aplicadas no Supabase (`npm run db:migrate`) | ✅ |
| Chave anônima não lê nenhuma tabela nem executa nenhuma função do banco | ✅ verificado |
| Fluxo completo no navegador (teste automatizado, 17 verificações) | ✅ passou |
| Sem AdSense configurado, nenhuma requisição de anúncio | ✅ verificado |
| Pix aceito no app de um banco real | ⬜ teste manual (veja abaixo) |
| Deploy em produção | ⬜ não feito |

O teste ponta a ponta cobriu:

- criar rolê, 3 pessoas e nome repetido recusado;
- "quem sou eu";
- 3 gastos com divisões diferentes e acerto conferido;
- Pix copiado e QR Code;
- editar gasto e recálculo do acerto;
- clique duplo mais uma segunda aba gerando um único pagamento;
- desfazer pagamento até chegar em "Tudo certo!";
- copiar o resumo;
- remover pessoa com gastos (bloqueado), editar pessoa e remover pessoa sem lançamentos;
- título, imagem de prévia e `noindex`;
- apagar rolê e receber 404 no link;
- páginas institucionais;
- nenhum erro de JavaScript.

---

## O que falta (depende de você)

### Antes de lançar

- [ ] **Testar o Pix em bancos reais.** Cole o copia e cola e leia o QR Code em pelo menos dois apps (por exemplo, Nubank e Itaú), com cada tipo de chave: aleatória, e-mail, celular e CPF. Confira valor, nome do recebedor e descrição.
- [ ] **Criar o Supabase de produção em São Paulo (`sa-east-1`).** O projeto atual está em `us-west-2`, mais lento para usuários no Brasil. Depois de criar:
  1. coloque a `DATABASE_URL` do projeto novo no `.env.local`;
  2. rode `npm run db:migrate`.

  A migration já agenda a limpeza diária no `pg_cron`.
- [ ] **Repositório remoto.** Crie o repositório no GitHub e faça o push. O CI (`.github/workflows/ci.yml`) roda typecheck, testes e build a cada push.
- [ ] **Projeto na Vercel.**
  - Configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY` e `NEXT_PUBLIC_APP_URL` (com o domínio final, sem barra no fim).
  - Configure também `NEXT_PUBLIC_CONTATO_EMAIL`, o e-mail que aparece na política de privacidade e nos termos.
  - **Não** configure a `DATABASE_URL` na Vercel.
  - Escolha a região das funções igual à do banco (`gru1` para São Paulo).
- [ ] **Domínio próprio** (por exemplo, `dividerole.com.br`) apontado para a Vercel.
- [ ] **Revisar os textos de [privacidade](src/app/privacidade/page.tsx) e [termos](src/app/termos/page.tsx).** Foram escritos para este caso de uso, mas não substituem uma revisão jurídica.

### Aparecer na busca

O site já tem títulos, descrições, URLs canônicas, dados estruturados, sitemap e guias. Falta o que depende do site estar no ar:

- [ ] Definir `NEXT_PUBLIC_APP_URL` na Vercel com o domínio final. É a base das URLs canônicas e do sitemap.
- [ ] Cadastrar o domínio no [Google Search Console](https://search.google.com/search-console). Use a verificação por tag HTML e coloque o código em `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.
- [ ] No Search Console, enviar `https://SEU-DOMINIO/sitemap.xml` e pedir a indexação da página inicial e dos guias.
- [ ] Repetir no [Bing Webmaster Tools](https://www.bing.com/webmasters), com `NEXT_PUBLIC_BING_SITE_VERIFICATION`.
- [ ] Conseguir links de outros sites (grupos, redes sociais, blogs). É o que mais ajuda um domínio novo a ganhar posição.

### AdSense

- [ ] Cadastrar o site no AdSense e aguardar a aprovação. As páginas "Como funciona", "Privacidade" e "Termos" já existem e estão no rodapé.
- [ ] Criar os blocos de anúncio "rodapé" e "acerto" e preencher na Vercel:
  - `NEXT_PUBLIC_ADSENSE_CLIENT` (`ca-pub-...`)
  - `NEXT_PUBLIC_ADSENSE_SLOT_RODAPE`
  - `NEXT_PUBLIC_ADSENSE_SLOT_ACERTO`

  Com essas variáveis preenchidas, o `/ads.txt` e o aviso de cookies passam a aparecer sozinhos.
- [ ] Em AdSense, Privacidade e mensagens, ativar a mensagem de consentimento do Google para o Espaço Econômico Europeu. Essa plataforma certificada é exigida pelo Google e não pode ser feita no código.

### Decisões em aberto

- [ ] **README.md:** foi removido no commit `feat: teste`. Se foi sem querer, posso recriá-lo com o passo a passo atualizado (migrations, variáveis, segurança).
- [ ] **Teste ponta a ponta no repositório:** o roteiro usado está fora do projeto, porque precisa do Playwright e o `PROMPT.md` proíbe dependências novas. Se liberar o Playwright como `devDependency`, o roteiro entra no projeto e no CI.
- [ ] **Monitoramento de erros:** os logs da Vercel já mostram os erros do servidor. Para alertas e erros do navegador, crie uma conta no Sentry e eu faço a integração (é uma dependência nova).
- [ ] **CSP mais rígida para scripts:** hoje a CSP bloqueia iframe, `base-uri`, `form-action` e `object`, mas não restringe scripts, porque o AdSense carrega código de muitos domínios do Google. Dá para endurecer com nonce depois que os anúncios estiverem rodando, testando em produção.

### Ideias para depois

- Divisão desigual: por valor, porcentagem ou peso (por exemplo, "quem levou acompanhante paga em dobro"). Exige mudar o schema, o cálculo e o formulário.
- Gastos em outra moeda, para viagens.
- Foto do comprovante (Supabase Storage).
- Histórico de alterações ("Fulano removeu o gasto X").

---

## O que foi feito

### Banco ([0002_integridade_e_limites.sql](supabase/migrations/0002_integridade_e_limites.sql))
- `salvar_gasto`: cria ou edita o gasto e a divisão numa transação só. Não sobra gasto sem divisão.
- `registrar_pagamento`: só grava se o rolê está na mesma `versao` em que o acerto foi calculado. A versão sobe por trigger a cada alteração, e isso evita pagamento em dobro.
- `remover_participante`: recusa remover quem aparece em gastos ou pagamentos. Sem essa trava, o cascade apagaria os gastos da pessoa.
- `consumir_limite` e a tabela `limites`: limite por IP, guardando só um hash SHA-256 (ação + IP).
- `limpar_dados_antigos`, agendada no `pg_cron` todo dia às 4h UTC: apaga rolês sem alteração há 180 dias e limites com mais de 1 dia.
- Todas as funções têm `execute` revogado de `anon` e `authenticated`.
- Índices nas chaves estrangeiras usadas em buscas e cascades.
- `npm run db:migrate` ([scripts/migrar.mjs](scripts/migrar.mjs)), que usa a Supabase CLI via `npx`, sem dependência nova.

### Bugs corrigidos
- **Pagamento em dobro:** o servidor recalcula o acerto, confere se a transferência ainda está pendente e o banco recusa se o rolê mudou. A outra aba recebe o aviso "O acerto mudou enquanto você olhava".
- **Gasto gravado pela metade:** agora a gravação é atômica.
- **Erros sem tratamento:**
  - [error.tsx](src/app/error.tsx) mostra a tela "Algo deu errado" com o botão "Tentar de novo";
  - [not-found.tsx](src/app/not-found.tsx) mostra "Rolê não encontrado";
  - as actions devolvem mensagens de erro em vez de falhar caladas.
- **Ações sem retorno visual:** "Remover", "Marcar como pago" e "Desfazer" mostram estado de carregamento e erro, e pedem confirmação quando a ação é destrutiva.

### Funcionalidades
- Editar gasto: descrição, valor, quem pagou e divisão.
- Editar pessoa (nome e chave Pix) e remover pessoa, quando ela não tem lançamentos.
- Desfazer "marcar como pago", na lista "Pagamentos feitos".
- "Quem é você?", guardado no navegador:
  - destaca "Você paga..." e mostra essas transferências primeiro;
  - já seleciona a pessoa em "Pago por";
  - marca "(você)" na lista.
- QR Code do Pix com gerador próprio ([qrcode.ts](src/lib/qrcode.ts)), validado com um decodificador externo nas versões 1 a 29.
- "Mandar acerto no WhatsApp" e "Copiar resumo".
- Prévia do link no WhatsApp: título com o nome do rolê e imagem gerada ([r/[id]/opengraph-image.tsx](src/app/r/[id]/opengraph-image.tsx)).
- Botão "Apagar este rolê", com confirmação e aviso na página inicial.

### Abuso e segurança
- Limites por IP:
  - 10 rolês por hora;
  - 60 pessoas por hora;
  - 200 gastos por hora.
- Limites por rolê: 50 pessoas e 300 gastos.
- Cabeçalhos em [next.config.ts](next.config.ts):
  - CSP contra iframe e envio de formulário para fora;
  - `X-Frame-Options`, `nosniff`, `Referrer-Policy` (o caminho do link não vai para outros sites), `Permissions-Policy` e HSTS;
  - `X-Powered-By` removido.
- Validação centralizada e testada em [validacao.ts](src/lib/validacao.ts).

### AdSense e LGPD
- Páginas [Como funciona](src/app/como-funciona/page.tsx) (com exemplo e perguntas frequentes), [Privacidade](src/app/privacidade/page.tsx) e [Termos](src/app/termos/page.tsx), com links no rodapé.
- [Aviso de cookies](src/components/aviso-cookies.tsx), exibido só quando o AdSense está configurado.
- Aviso no formulário: quem tiver o link verá a chave Pix, então é melhor usar a chave aleatória ou o e-mail.
- `/ads.txt` gerado a partir de `NEXT_PUBLIC_ADSENSE_CLIENT`.
- O `NEXT_PUBLIC_ADSENSE_CLIENT` de exemplo (`ca-pub-000…`) foi esvaziado no `.env.local`.

### SEO e identidade
- Ícone e ícone da Apple, gerados por código; `manifest`, `robots.txt` e `sitemap.xml`.
- `metadataBase` lido de `NEXT_PUBLIC_APP_URL`, imagem de prévia da página inicial e `theme-color`.
- Página inicial com a seção "Por que usar" e link para o exemplo completo.

### Qualidade
- Testes novos para validação, QR Code, resumo do acerto e tipo de chave Pix. Eram 9 testes, agora são 22.
- CI no GitHub Actions.
- Acessibilidade:
  - labels em todos os campos;
  - erros com `role="alert"`;
  - "Copiado!" com `aria-live`;
  - textos cinza com mais contraste (`zinc-600`).
