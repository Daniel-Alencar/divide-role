# Pendências do Divide Rolê

O que falta para a aplicação ficar completa e no ar com anúncios. Situação em 02/11/2026.

## Onde estamos

| Item | Situação |
|---|---|
| `npm run typecheck`, `npm test` (9 testes) e `npm run build` | ✅ passam |
| Schema no Supabase (`0001_schema_inicial.sql`) | ✅ aplicado |
| Chave anônima bloqueada pelo RLS (critério 4 do `PROMPT.md`) | ✅ verificado: ela recebe `[]` mesmo com dados no banco |
| Criar rolê | ✅ funciona (já existe 1 rolê no banco) |
| Fluxo completo até "Tudo certo!" (critério 2) | ⬜ falta testar manualmente |
| Pix aceito no app de um banco (critério 3) | ⬜ falta testar manualmente |
| Sem AdSense, nenhum script de anúncio (critério 5) | ⬜ falta conferir no navegador |
| Deploy em produção | ⬜ não feito |

As prioridades vão de **P0** (impede o lançamento) a **P3** (melhoria futura).

---

## 1. Validação do MVP (P0)

- [ ] **Teste do fluxo completo.** Crie um rolê, adicione 3 pessoas (uma sem chave Pix), lance gastos com divisões diferentes, confira o acerto à mão, copie o Pix e marque todos como pagos até aparecer "Tudo certo! Ninguém deve nada. 🎉".
- [ ] **Teste do Pix em bancos reais.** Cole o "Pix copia e cola" em pelo menos dois apps (por exemplo, Nubank e Itaú) com cada tipo de chave: celular, CPF, e-mail e aleatória. Confira se o valor, o nome do recebedor e a descrição aparecem certos. Se algum banco recusar, o problema está em [pix.ts](src/lib/pix.ts).
- [ ] **Conferir os anúncios desligados.** Com as variáveis `NEXT_PUBLIC_ADSENSE_*` vazias, a aba Network do navegador não pode mostrar nenhuma requisição para `googlesyndication.com`. Hoje o `.env.local` tem `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-000…` preenchido com um valor de exemplo, que carrega o script. Apague esse valor enquanto não houver conta aprovada.

## 2. Bugs e riscos no código atual (P0)

- [ ] **"Marcar como pago" pode registrar o pagamento duas vezes.** Um clique duplo, ou duas pessoas clicando ao mesmo tempo, grava dois `pagamentos`. O saldo então se inverte e aparece uma dívida nova no sentido contrário. Como corrigir:
  - desabilitar o botão enquanto a ação roda (`useFormStatus`);
  - no servidor, recalcular o acerto antes de gravar e só aceitar se a transferência `de → para` com aquele valor ainda estiver pendente. Hoje [marcarPago](src/app/acoes.ts) confia no valor que veio da página, que pode estar desatualizado.
- [ ] **O gasto é gravado em duas etapas sem transação.** [adicionarGasto](src/app/acoes.ts) insere o gasto e depois a divisão. Se o servidor cair entre as duas inserções, fica um gasto sem divisão, e o cálculo divide esse valor entre todos. Solução: uma função SQL (`create function adicionar_gasto(...)`) chamada via `db.rpc`, numa migration `0002`.
- [ ] **Erros sem tratamento derrubam a página.** Se o banco falhar, `carregarRole` lança uma exceção e o usuário vê a tela de erro padrão do Next. Crie:
  - `src/app/error.tsx`, com uma mensagem amigável e um botão "Tentar de novo";
  - `src/app/not-found.tsx`, com o texto "Rolê não encontrado" e um link para criar um novo.
- [ ] **Remover gasto não pede confirmação.** Um toque errado no celular apaga o gasto. Adicione um `confirm()` ou um botão de desfazer.
- [ ] **Ações sem retorno visual.** Remover gasto e Marcar como pago não mostram estado de carregamento nem erro. Se a gravação falhar, nada acontece na tela.

## 3. Funcionalidades que faltam (P1)

São os itens de "Fora do escopo" do `PROMPT.md` e do README, mais o que faz falta no uso real.

- [ ] **Desfazer "marcar como pago".** Mostre uma lista de "Pagamentos feitos", cada um com o botão Desfazer, que apaga o registro em `pagamentos` filtrando por `role_id`.
- [ ] **Editar gasto.** Permita alterar descrição, valor, quem pagou e a divisão. Hoje a única opção é remover e lançar de novo.
- [ ] **Editar e remover participante.** Hoje não dá para corrigir um nome digitado errado nem adicionar a chave Pix depois.
  - Cuidado: pelo `on delete cascade`, remover uma pessoa apaga os gastos que ela pagou. Bloqueie a remoção quando a pessoa tiver gastos ou pagamentos, ou avise antes.
- [ ] **Lembrar "quem sou eu".** Guarde no `localStorage`, por rolê, qual participante é o usuário. Use isso para destacar "Você paga R$ X para Fulano" e já selecionar a pessoa no campo "Pago por".
- [ ] **QR Code do Pix.** Serve para quem está pagando pelo computador ou pelo celular de outra pessoa. O `PROMPT.md` proíbe dependências novas, então decida entre gerar o QR sem biblioteca e liberar uma exceção, como `qrcode`.
- [ ] **Pré-visualização do link no WhatsApp.** Adicione `generateMetadata` em [r/[id]/page.tsx](src/app/r/[id]/page.tsx) com título "Rolê: {nome}" e uma imagem Open Graph (`opengraph-image.tsx`). O link é a principal forma de divulgação, e hoje aparece sem preview.

## 4. Abuso e segurança (P1)

- [ ] **Limite de criação por IP.** Hoje qualquer um pode criar rolês e pessoas sem limite e encher o banco. Opções:
  - tabela `limites (ip, janela, contagem)` no Postgres, consultada nas actions;
  - Vercel Firewall / rate limit, se o deploy for na Vercel;
  - limites por rolê, como no máximo 50 pessoas e 500 gastos.
- [ ] **Cabeçalhos de segurança** em [next.config.ts](next.config.ts): `Content-Security-Policy` (liberando os domínios do AdSense), `X-Frame-Options: DENY` e `Referrer-Policy: no-referrer`. O último evita que o link do rolê, que funciona como senha, vaze pelo cabeçalho Referer para sites externos.
- [ ] **Retenção de dados.** Apague rolês sem atividade há, por exemplo, 180 dias, com `pg_cron` no Supabase ou um cron da Vercel. Isso diminui a exposição de dados pessoais e precisa constar na política de privacidade.
- [ ] **Senha do banco no `.env.local`.** A variável `DATABASE_URL` foi adicionada só para rodar a migration. Remova-a se não for usar, ou mantenha só na máquina local. Nunca coloque essa variável na Vercel.

## 5. Requisitos para o AdSense e a LGPD (P1, antes de pedir aprovação)

O AdSense reprova sites com pouco conteúdo ou sem páginas institucionais. O site também guarda dados pessoais: nomes e chaves Pix, que podem ser CPF, telefone ou e-mail.

- [ ] **Página "Como funciona"** (`/como-funciona`): passo a passo com exemplos, como o cálculo funciona, por que não precisa de cadastro e perguntas frequentes.
- [ ] **Política de privacidade** (`/privacidade`) explicando:
  - quais dados são coletados (nome, chave Pix, gastos);
  - que qualquer pessoa com o link vê esses dados;
  - quanto tempo os dados ficam guardados;
  - o uso de cookies pelo Google AdSense;
  - como pedir a exclusão.
- [ ] **Termos de uso** (`/termos`): o site não processa pagamentos, só calcula e gera o código Pix.
- [ ] **Aviso de cookies / consentimento.** O Google exige uma plataforma de consentimento (CMP) certificada para quem acessa do Espaço Econômico Europeu. Para o Brasil, um aviso simples atende à LGPD.
- [ ] **Aviso ao informar a chave Pix:** "Todos com o link verão sua chave". Recomende chave aleatória ou e-mail em vez de CPF.
- [ ] **Botão "Apagar este rolê"**, para o grupo remover os próprios dados quando terminar o acerto.
- [ ] **Rodapé** com links para as páginas acima.
- [ ] **`public/ads.txt`** com a linha que o AdSense indicar.

## 6. SEO e identidade (P2)

- [ ] Favicon e ícones (`src/app/icon.png`, `apple-icon.png`) e `manifest.ts`, para quem salvar o site na tela inicial.
- [ ] `src/app/robots.ts` e `src/app/sitemap.ts`, listando só as páginas públicas. Os rolês já usam `noindex`.
- [ ] Domínio próprio, como `dividerole.com.br`, e `NEXT_PUBLIC_APP_URL` apontando para ele. Hoje essa variável não é usada no código. Use-a no `metadataBase` do [layout.tsx](src/app/layout.tsx).
- [ ] Conteúdo extra na página inicial, como "Como dividir a conta do churrasco", para atrair busca orgânica.

## 7. Deploy (P0 para o lançamento)

- [ ] Criar um repositório remoto (GitHub). Hoje existe só o commit inicial local, e o `PROMPT.md` não está versionado.
- [ ] Criar o projeto na Vercel e configurar `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_APP_URL` e, depois da aprovação, `NEXT_PUBLIC_ADSENSE_*`.
- [ ] Projeto Supabase de produção. O atual está em `us-west-2`. Para usuários no Brasil, `sa-east-1` (São Paulo) dá menos latência. Vale recriar antes de ter dados reais.
- [ ] Usar a mesma região na Vercel (`gru1`) e no Supabase.
- [ ] Script de migration versionado (`npm run db:migrate`) ou Supabase CLI. Hoje a migration foi rodada por um script temporário fora do projeto.

## 8. Qualidade (P2)

- [ ] Testes das server actions: validação de UUID, participante de outro rolê e valor acima de R$ 100.000.
- [ ] Teste de ponta a ponta do fluxo completo. O `PROMPT.md` só permite `node --test`, então decida entre um roteiro manual documentado e uma exceção para o Playwright.
- [ ] CI (GitHub Actions) rodando typecheck, testes e build a cada push.
- [ ] Acessibilidade:
  - `label` nos campos (hoje só há `placeholder`);
  - contraste dos textos `zinc-500`;
  - anúncio "Copiado!" para leitores de tela (`aria-live`).
- [ ] Monitoramento de erros em produção, como os logs da Vercel ou o Sentry.

## 9. Ideias para depois (P3)

- Divisão desigual: por valor, porcentagem ou peso (por exemplo, "quem levou acompanhante paga em dobro").
- Gastos em outra moeda, para viagens.
- Anexar foto do comprovante.
- Histórico de alterações ("Fulano removeu o gasto X").
- Exportar o resumo do acerto como texto para colar no grupo.

---

## Ordem sugerida

1. Seção 1: validar o MVP.
2. Seção 2: corrigir os bugs.
3. Seção 7: deploy em domínio próprio.
4. Seções 3 e 4: funcionalidades e abuso.
5. Seção 5: páginas exigidas e pedido de aprovação no AdSense.
6. Seções 6, 8 e 9: SEO, qualidade e ideias.
