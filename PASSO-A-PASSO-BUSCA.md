# Como colocar o Divide Rolê na busca do Google e do Bing

O código já está pronto para os buscadores. Este guia cobre o que precisa ser feito nos painéis da Vercel, do Google e do Bing. Reserve de 30 a 60 minutos.

Em todos os passos, troque `SEU-DOMINIO.com.br` pelo domínio real. Os nomes dos botões podem mudar um pouco, porque esses painéis são atualizados com frequência.

| Etapa | Onde | Resultado |
|---|---|---|
| 1. Escolher o endereço oficial | Vercel | O site abre em um único domínio |
| 2. Definir `NEXT_PUBLIC_APP_URL` | Vercel | Sitemap e URLs canônicas com o domínio certo |
| 3. Verificar o site no Google | Search Console e Vercel | Você passa a ter acesso aos dados do site |
| 4. Enviar o sitemap | Search Console | O Google recebe a lista de páginas |
| 5. Pedir a indexação | Search Console | As páginas principais entram na fila |
| 6. Cadastrar no Bing | Bing Webmaster Tools | O site também vai para o Bing |
| 7. Acompanhar | Search Console | Você descobre se algo deu errado |

## Antes de começar

Você precisa de:

- o projeto publicado na Vercel, com a branch `main` atualizada;
- uma conta Google e, para o Bing, uma conta Microsoft (ou entrar com a própria conta Google);
- acesso ao painel onde o domínio foi registrado (Registro.br, por exemplo), se ainda for configurar o DNS.

## 1. Escolher o endereço oficial do site

O site deve ter um único endereço principal. Escolha **com** ou **sem** `www` e use sempre a mesma forma nos passos seguintes. Para o Google, `https://www.seu-dominio.com.br/` e `https://seu-dominio.com.br/` são endereços diferentes.

1. Na Vercel, abra o projeto e vá em **Settings > Domains**.
2. Clique em **Add Domain** e digite o domínio.
3. Adicione também a outra versão (com ou sem `www`) e configure-a para **redirecionar** para a versão escolhida.
4. Crie no painel do seu registrador os registros DNS que a Vercel indicar.
5. Aguarde o domínio aparecer como válido. A propagação do DNS pode levar até 48 horas.
6. Abra `https://SEU-DOMINIO.com.br` e confirme que o site carrega com o cadeado de HTTPS.

Se ainda não tiver domínio, dá para fazer tudo com o endereço `.vercel.app`. Só que, ao trocar para um domínio próprio depois, você terá de refazer os passos 2 a 6.

## 2. Definir `NEXT_PUBLIC_APP_URL`

Essa variável é a base do sitemap, das URLs canônicas e da imagem de prévia.

1. Na Vercel, vá em **Settings > Environment Variables**.
2. Crie a variável:
   - **Key:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://SEU-DOMINIO.com.br` (com `https://`, sem barra no final)
   - **Environment:** marque **Production**
3. Salve.
4. Vá em **Deployments**, abra o menu **...** do deploy mais recente e clique em **Redeploy**. Se aparecer a opção de reaproveitar o cache de build, desmarque.

O redeploy é obrigatório. Variáveis `NEXT_PUBLIC_` entram no código durante o build, e um deploy antigo não recebe o valor novo.

**Confira:** abra `https://SEU-DOMINIO.com.br/sitemap.xml`. Todos os endereços listados devem começar com o seu domínio. Depois abra `https://SEU-DOMINIO.com.br/robots.txt`, e a última linha deve apontar para esse mesmo sitemap.

## 3. Verificar o site no Google Search Console

O Search Console oferece dois tipos de propriedade. Para usar a variável do projeto, escolha **Prefixo do URL**. O tipo **Domínio** só aceita verificação por DNS.

1. Acesse [search.google.com/search-console](https://search.google.com/search-console).
2. No seletor de propriedades, clique em **Adicionar propriedade**.
3. Em **Prefixo do URL**, digite `https://SEU-DOMINIO.com.br/` e clique em **Continuar**.
4. Em **Outros métodos de verificação**, escolha **Tag HTML**. O Google mostra algo assim:

   ```html
   <meta name="google-site-verification" content="AbCdEf123456" />
   ```

5. Copie **só o valor de `content`** (no exemplo, `AbCdEf123456`). Deixe essa tela aberta.
6. Na Vercel, em **Settings > Environment Variables**, crie:
   - **Key:** `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value:** o código copiado
   - **Environment:** **Production**
7. Faça o **Redeploy**, como no passo 2, e espere terminar.
8. Confira se a tag está no ar:

   ```bash
   curl -s https://SEU-DOMINIO.com.br | grep -o '<meta name="google-site-verification"[^>]*>'
   ```

   O comando deve imprimir a tag com o seu código. Sem terminal, abra `view-source:https://SEU-DOMINIO.com.br` no navegador e procure por `google-site-verification`.
9. Volte ao Search Console e clique em **Verificar**.

**Mantenha a variável depois de verificar.** Se a tag sair do site, a verificação expira e você perde o acesso aos dados.

### Alternativa: verificar pelo arquivo HTML

O repositório já tem o arquivo `google38703c4ef62fc1d9.html`, do método **Arquivo HTML**. Ele está na raiz do projeto, e o Next.js só publica o que está em `public/`. Do jeito que está, o endereço responde 404 e a verificação falha.

Para usar esse método em vez da tag:

```bash
mkdir -p public
git mv google38703c4ef62fc1d9.html public/
git commit -m "fix: publica o arquivo de verificação do Google"
git push
```

Depois do deploy, abra `https://SEU-DOMINIO.com.br/google38703c4ef62fc1d9.html`. A página deve mostrar o texto `google-site-verification: google38703c4ef62fc1d9.html`. Então clique em **Verificar** e mantenha o arquivo no projeto.

O nome desse arquivo **não** é o código da tag HTML. Não coloque `google38703c4ef62fc1d9` em `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Use um dos dois métodos; basta um.

## 4. Enviar o sitemap

1. No Search Console, com a propriedade selecionada, abra **Indexação > Sitemaps**.
2. Em **Adicionar um novo sitemap**, digite `sitemap.xml`.
3. Clique em **Enviar**.
4. O status esperado é **Sucesso**, com **9** páginas descobertas.

Se aparecer **Não foi possível buscar** logo após o envio, confira se o sitemap abre no navegador e aguarde um dia. Em sites novos, esse status costuma ser passageiro.

## 5. Pedir a indexação das páginas principais

1. No Search Console, cole o endereço na barra **Inspecionar qualquer URL**, no topo da tela, e pressione Enter.
2. Aguarde a consulta. Em um site novo, o resultado normal é **O URL não está no Google**.
3. Clique em **Solicitar indexação** e aguarde a confirmação.
4. Repita para cada endereço abaixo:

```text
https://SEU-DOMINIO.com.br/
https://SEU-DOMINIO.com.br/como-funciona
https://SEU-DOMINIO.com.br/guias
https://SEU-DOMINIO.com.br/guias/como-dividir-a-conta-do-churrasco
https://SEU-DOMINIO.com.br/guias/como-dividir-despesas-de-viagem
https://SEU-DOMINIO.com.br/guias/como-dividir-a-conta-do-bar
https://SEU-DOMINIO.com.br/guias/como-dividir-as-contas-da-casa
```

Há um limite diário de pedidos. Se ele aparecer, continue no dia seguinte. Pedir de novo para o mesmo endereço não acelera a indexação.

As páginas `/privacidade` e `/termos` não precisam de pedido, porque o sitemap já cobre. Não peça a indexação de links `/r/...`: são os rolês privados, marcados de propósito para ficar fora da busca.

## 6. Cadastrar no Bing Webmaster Tools

Acesse [bing.com/webmasters](https://www.bing.com/webmasters) e entre com sua conta.

### Opção A: importar do Google (recomendada)

Exige que o passo 3 já esteja concluído e não usa variável nenhuma.

1. Na área de adicionar site, escolha importar do **Google Search Console**.
2. Autorize o acesso com a conta Google usada no passo 3.
3. Selecione o site e clique em **Importar**. O sitemap vem junto.

Mantenha essa autorização ativa. O Bing a usa para reconfirmar periodicamente que o site é seu.

### Opção B: verificar com a meta tag

1. Em **Adicionar site manualmente**, digite `https://SEU-DOMINIO.com.br/`.
2. Escolha o método **Meta tag HTML**. O Bing mostra algo assim:

   ```html
   <meta name="msvalidate.01" content="ABC123DEF456" />
   ```

3. Copie **só o valor de `content`**.
4. Na Vercel, crie `NEXT_PUBLIC_BING_SITE_VERIFICATION` com esse valor, em **Production**.
5. Faça o **Redeploy** e espere terminar.
6. Volte ao Bing e clique em **Verificar**.
7. Em **Sitemaps**, envie `https://SEU-DOMINIO.com.br/sitemap.xml`.

### Depois de cadastrar

Em **Enviar URLs** (URL Submission), cole a lista do passo 5 para adiantar a descoberta das páginas. Os dados do site podem levar até 48 horas para aparecer no painel.

## 7. Acompanhar os resultados

| Quando | O que olhar |
|---|---|
| Depois de alguns dias | Em **Indexação > Páginas**, veja quantas páginas foram indexadas |
| Depois de 1 a 2 semanas | Pesquise `site:SEU-DOMINIO.com.br` no Google |
| Depois de algumas semanas | Em **Desempenho**, veja buscas, impressões e cliques |

A indexação costuma levar de alguns dias a algumas semanas e não é garantida. Estar indexado também não significa aparecer no topo. Links de outros sites são o que mais ajuda um domínio novo, então divulgue o site em grupos, redes sociais e blogs.

Para checar os dados estruturados, teste a página inicial e um guia no [Teste de resultados avançados](https://search.google.com/test/rich-results) e no [validador do Schema.org](https://validator.schema.org/).

## Se algo der errado

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Sitemap com `localhost` ou `.vercel.app` | Variável ausente ou sem redeploy | Refaça o passo 2, incluindo o redeploy |
| "Não foi possível encontrar a meta tag" | Redeploy não feito ou ainda em andamento | Rode o `curl` do passo 3 e clique em **Verificar** de novo |
| A tag está no ar, mas a verificação falha | Propriedade com outra forma do endereço (com/sem `www`) | Use na propriedade o endereço final, depois dos redirecionamentos |
| Arquivo `google...html` responde 404 | Arquivo fora de `public/` | Siga a alternativa do passo 3 |
| "Detectada, mas não indexada no momento" | Normal em site novo | Aguarde. Mais conteúdo e links externos ajudam |
| "Excluída pela tag noindex" em `/r/...` | Comportamento esperado | Nada a fazer, os rolês são privados |
| Canonical apontando para outro domínio | `NEXT_PUBLIC_APP_URL` diferente do endereço oficial | Corrija a variável e faça o redeploy |

## Referências

- [Verificar a propriedade do site (Search Console)](https://support.google.com/webmasters/answer/9008080?hl=pt-BR)
- [Adicionar uma propriedade ao Search Console](https://support.google.com/webmasters/answer/34592?hl=pt-BR)
- [Adicionar e verificar um site (Bing)](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)
- [Importar sites do Search Console para o Bing](https://blogs.bing.com/webmaster/september-2019/Import-sites-from-Search-Console-to-Bing-Webmaster-Tools)
- [Variáveis de ambiente na Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables)
- [Adicionar um domínio na Vercel](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
