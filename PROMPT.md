# Prompt: implementar o "Divide Rolê"

Você vai construir do zero um site chamado **Divide Rolê**, para dividir as despesas de um rolê entre amigos no Brasil. Leia todo este documento antes de começar. Ao terminar, o projeto precisa compilar (`npm run build`), passar na checagem de tipos (`tsc --noEmit`) e nos testes (`npm test`).

## 1. Problema e proposta

Num rolê (churrasco, viagem, bar), cada pessoa paga uma parte das coisas e depois ninguém sabe quem deve quanto a quem. Apps como Splitwise e Tricount resolvem isso, mas exigem instalação e cadastro de todos, e basta um amigo não baixar o app para o grupo voltar à calculadora.

**Proposta:** um **site, sem cadastro e sem instalar nada**. Alguém cria o rolê e manda o link no grupo do WhatsApp. Cada pessoa lança o que pagou, o site calcula **o menor número de transferências** e gera o **Pix copia e cola já com o valor**.

**Modelo de negócio:** projeto paralelo monetizado com **poucos anúncios** (Google AdSense): um banner no rodapé e, no máximo, um bloco na seção de acerto. Sem anúncio intrusivo.

## 2. Stack obrigatória

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router, Server Components, Server Actions) + React 19 + TypeScript estrito |
| Estilo | Tailwind CSS 4 (`@tailwindcss/postcss`, tema via `@theme`) |
| Banco | Supabase (Postgres), acessado **somente pelo servidor** com a service role |
| Validação | Zod 4 |
| Testes | `node --test --experimental-strip-types` (sem framework de teste extra) |
| Anúncios | Google AdSense |

Código, nomes e textos da interface **em português do Brasil**. Não adicione outras dependências além de `next`, `react`, `react-dom`, `@supabase/supabase-js`, `zod`, `server-only` e as do Tailwind/TypeScript.

## 3. Estrutura de pastas

```
src/
  app/
    layout.tsx            fonte, script do AdSense (se configurado), anúncio do rodapé
    page.tsx              página inicial: explicação + formulário "criar rolê"
    acoes.ts              server actions (todas as gravações)
    r/[id]/page.tsx       página do rolê: pessoas, gastos, acerto
  components/
    formularios.tsx       formulários (client, useActionState)
    botoes.tsx            copiar para a área de transferência; compartilhar no WhatsApp
    anuncio.tsx           bloco do AdSense (não renderiza nada sem configuração)
  lib/
    acerto.ts             cálculo de saldos e transferências (puro, sem dependências)
    acerto.test.ts
    pix.ts                geração do BR Code do Pix (puro, sem dependências)
    pix.test.ts
    db.ts                 cliente Supabase com service role + carregarRole(id)
supabase/migrations/0001_schema_inicial.sql
.env.example
README.md
```

No `tsconfig.json`, habilite `allowImportingTsExtensions` para que os testes importem `./acerto.ts` diretamente.

## 4. Banco de dados

Tabelas (UUID com `gen_random_uuid()`):

- **roles**: `id`, `nome` (1 a 80 caracteres), `criado_em`.
- **participantes**: `id`, `role_id`, `nome` (1 a 40 caracteres), `chave_pix` (até 77 caracteres, opcional), `criado_em`, com `unique (role_id, nome)`.
- **gastos**: `id`, `role_id`, `descricao` (1 a 80 caracteres), `valor_centavos integer > 0`, `pago_por` (participante), `criado_em`.
- **gasto_participantes**: `(gasto_id, participante_id)` como chave primária, indicando quem divide cada gasto.
- **pagamentos**: `id`, `role_id`, `de`, `para`, `valor_centavos > 0`, `criado_em`. São as transferências já feitas ("marcar como pago").

Todas as chaves estrangeiras usam `on delete cascade` e são indexadas por `role_id`.

**Modelo de segurança:** não há login. O **UUID do rolê no link funciona como senha do grupo**. Habilite RLS em todas as tabelas **sem nenhuma política**, o que bloqueia a chave anônima. O navegador nunca fala com o banco: toda leitura e gravação passa pelo servidor com a service role, **sempre filtrando por `role_id`** e validando que os participantes informados pertencem àquele rolê.

## 5. Regras de cálculo (`lib/acerto.ts`)

- **Todo valor em centavos inteiros.** Nunca use float para dinheiro.
- `calcularSaldos(participantes, gastos, pagamentos)` → `Map<id, saldo>`, em que positivo significa ter a receber e negativo significa dever.
  - Quem pagou o gasto recebe `+valor`.
  - O valor é dividido entre `divididoEntre` (se a lista estiver vazia, entre todos). Parte = `floor(valor / n)`, e os centavos que sobram vão **um para cada**, na ordem. **A soma dos saldos é sempre zero.**
  - Um pagamento já feito soma `+valor` para quem pagou (`de`) e `-valor` para quem recebeu (`para`).
- `calcularTransferencias(saldos)`: algoritmo guloso em que o maior devedor paga o maior credor até zerar um dos dois. Gera no máximo `n - 1` transferências.
- `reaisParaCentavos("12,50" | "12.5" | "R$ 1.234,56" | "7")` → 1250, 1250, 123456, 700. Retorna `null` se o valor for inválido (ex.: `"1,234"`, `"abc"`).
- `formatarCentavos` usa `Intl.NumberFormat` com `pt-BR` e `BRL`.

## 6. Pix copia e cola (`lib/pix.ts`)

Gere o **BR Code estático** no padrão EMV do Banco Central:

- Cada campo é `ID (2 dígitos) + tamanho (2 dígitos) + valor`.
- Campos, nesta ordem:
  - `00` = `"01"`
  - `26` = conta Pix: subcampo `00` = `"br.gov.bcb.pix"`, `01` = chave, `02` = descrição opcional (até 40 caracteres)
  - `52` = `"0000"`
  - `53` = `"986"` (BRL)
  - `54` = valor com 2 casas (ex.: `"42.50"`)
  - `58` = `"BR"`
  - `59` = nome do recebedor (somente ASCII, sem acento, até 25 caracteres)
  - `60` = cidade (ASCII, até 15 caracteres, padrão `"BRASIL"`)
  - `62` = subcampo `05` = `"***"`
  - `6304` + CRC
- **CRC16-CCITT** (polinômio `0x1021`, valor inicial `0xFFFF`), em hexadecimal maiúsculo com 4 dígitos, calculado sobre todo o payload incluindo `"6304"`. Vetor de teste: `crc16("123456789") === "29B1"`.
- `normalizarChavePix(tipo, chave)`, retornando `null` se inválida:
  - `cpf_cnpj`: só dígitos, 11 ou 14
  - `celular`: `"(11) 99999-8888"` → `"+5511999998888"`
  - `email`: minúsculo e válido
  - `aleatoria`: UUID em minúsculo

## 7. Funcionalidades e telas

### Página inicial (`/`)
Título, explicação curta ("Cada um lança o que pagou, a gente calcula quem deve para quem e gera o Pix com o valor certo. Sem cadastro e sem instalar nada."), o formulário "Criar rolê" (nome) e um passo a passo de 3 itens. Criar redireciona para `/r/{id}`.

### Página do rolê (`/r/[id]`)
- Valide que o `id` é um UUID e responda 404 se não for ou se não existir.
- Use `robots: noindex, nofollow`.
- **Cabeçalho:** nome, total do rolê e o botão "**Enviar link no WhatsApp**", que abre `https://wa.me/?text=` com a mensagem e a URL atual.
- **Quem está no rolê:** lista de pessoas (indicando quem tem Pix) e o formulário com nome, tipo de chave e chave Pix opcional. Nome repetido gera o erro "Já existe alguém com esse nome".
- **Gastos** (aparece quando há pessoas): lista com descrição, valor, quem pagou, entre quem foi dividido e botão Remover; formulário com descrição, valor, "Pago por" e caixas "Dividido entre" (todas marcadas por padrão).
- **Acerto** (aparece quando há gastos): para cada transferência, mostre "**Fulano paga R$ X para Ciclano**", o botão "**Copiar Pix com valor**" (se o recebedor tiver chave; senão, o aviso "ainda não informou a chave Pix") e o botão "**Marcar como pago**", que grava em `pagamentos` e faz a transferência sumir. Sem pendências, mostre "Tudo certo! Ninguém deve nada. 🎉". Abaixo, o bloco de anúncio do acerto.

### Server actions (`app/acoes.ts`)
`criarRole`, `adicionarParticipante(roleId)`, `adicionarGasto(roleId)`, `removerGasto(roleId, gastoId)` e `marcarPago(roleId, de, para, valorCentavos)`. Todas validam UUIDs, tamanhos e valores (até R$ 100.000), confirmam que os participantes pertencem ao rolê, chamam `revalidatePath` e devolvem `{ erro }` ou `{ ok }` para os formulários. Os formulários se limpam após sucesso. Se a inserção da divisão do gasto falhar, apague o gasto criado.

### Anúncios
- O script do AdSense só é carregado se `NEXT_PUBLIC_ADSENSE_CLIENT` existir.
- O componente `Anuncio({ slot })` não renderiza nada sem cliente e slot e trata bloqueadores de anúncio com try/catch.
- Slots: `NEXT_PUBLIC_ADSENSE_SLOT_RODAPE` e `NEXT_PUBLIC_ADSENSE_SLOT_ACERTO`.

## 8. Design

Visual limpo e mobile-first, com largura máxima de `max-w-xl` centralizada. Cor de destaque roxa (`#6d28d9`, hover `#5b21b6`) definida no `@theme`, fundo `zinc-50`, cards brancos com sombra leve, botão verde para o WhatsApp e botão escuro para "Marcar como pago". O feedback de "Copiado!" dura 2 segundos.

## 9. Testes obrigatórios

`acerto.test.ts`:
- divisão igual, em que quem pagou recebe
- centavos que sobram não somem (soma zero)
- quem não participou do gasto não paga
- as transferências zeram todos os saldos e são no máximo `n - 1`
- pagamentos abatem o que falta
- conversão de reais para centavos, incluindo os casos inválidos

`pix.test.ts`:
- vetor do CRC
- BR Code contém chave, valor e nome sem acento, e o CRC confere
- normalização de cada tipo de chave

## 10. Critérios de aceite

1. `npm test`, `tsc --noEmit` e `npm run build` sem erros.
2. Fluxo completo: criar rolê → 3 pessoas → gastos com divisões diferentes → acerto correto → copiar Pix → marcar como pago → "Tudo certo!".
3. O Pix gerado é aceito ao colar no app de um banco brasileiro (teste manual).
4. A chave anônima do Supabase não consegue ler nenhuma tabela.
5. Sem variáveis do AdSense, nenhum anúncio nem script de anúncio aparece.

## 11. Fora do escopo (próximos passos)

Desfazer pagamento, editar gasto, lembrar "quem sou eu" no navegador, QR Code do Pix, limite de criação por IP, página "Como funciona" e política de privacidade (exigidas pelo AdSense).
