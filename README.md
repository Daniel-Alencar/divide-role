# Divide Rolê

Site para dividir as contas do rolê com os amigos: cada um lança o que pagou, o site calcula **quem paga quanto para quem** e gera o **Pix copia e cola já com o valor**. Sem cadastro e sem instalar nada: o link do rolê é compartilhado no grupo do WhatsApp.

Projeto paralelo, monetizado com poucos anúncios (Google AdSense).

## Stack

Next.js 16 + React 19 + Tailwind 4 + Supabase (Postgres). Mesma base do Assistente Clínico.

## Estrutura

```
src/
  app/
    page.tsx            página inicial: criar rolê
    r/[id]/page.tsx     página do rolê: pessoas, gastos e acerto
    acoes.ts            server actions (todas as gravações no banco)
  components/           formulários, botões (copiar Pix, WhatsApp), anúncio
  lib/
    acerto.ts           cálculo de saldos e transferências (centavos) + testes
    pix.ts              geração do BR Code (Pix copia e cola) + testes
    db.ts               leitura do rolê no Supabase
supabase/migrations/    schema do banco
```

## Como rodar

1. Node.js 22+ (`nvm install 22`) e `npm install`
2. Crie um projeto no [Supabase](https://supabase.com) e rode `supabase/migrations/0001_schema_inicial.sql` no SQL Editor
3. `cp .env.example .env.local` e preencha a URL e a chave secret (`sb_secret_...`)
4. `npm run dev` e acesse http://localhost:3000
5. `npm test` roda os testes do cálculo e do Pix

## Segurança

Não há login. O **link do rolê** (UUID impossível de adivinhar) funciona como senha do grupo: quem tem o link pode editar. Por isso:
- o navegador nunca acessa o banco direto (RLS ligado sem políticas bloqueia a chave anônima);
- todas as gravações passam por server actions, que validam se as pessoas pertencem ao rolê;
- as páginas de rolê não são indexadas pelos buscadores.

## Anúncios

1. Publique o site com domínio próprio e conteúdo (a página inicial explica o uso).
2. Cadastre no [Google AdSense](https://adsense.google.com) e aguarde a aprovação.
3. Crie dois blocos de anúncio (rodapé e acerto) e preencha `NEXT_PUBLIC_ADSENSE_*`.
4. Adicione o arquivo `public/ads.txt` que o AdSense indicar.

Sem as variáveis configuradas, nenhum anúncio é exibido.

## Próximos passos

- [ ] Desfazer "marcar como pago" e editar gasto
- [ ] Lembrar no navegador "quem sou eu" para destacar o que a pessoa deve
- [ ] QR Code do Pix além do copia e cola
- [ ] Limite de criação por IP (evitar abuso)
- [ ] Página "Como funciona" e política de privacidade (exigidas pelo AdSense)
