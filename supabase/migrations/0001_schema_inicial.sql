-- Schema do Divide Rolê.
-- Não há login: quem tem o link do rolê (UUID impossível de adivinhar) pode editá-lo.
-- Por isso o navegador nunca acessa o banco direto: RLS ligado sem políticas
-- bloqueia a chave anônima, e o servidor usa a service role filtrando sempre por rolê.

create extension if not exists "pgcrypto";

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 80),
  criado_em timestamptz not null default now()
);

create table public.participantes (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 40),
  chave_pix text check (char_length(chave_pix) <= 77),
  criado_em timestamptz not null default now(),
  unique (role_id, nome)
);
create index on public.participantes (role_id);

-- Valores sempre em centavos (inteiro) para evitar erro de arredondamento.
create table public.gastos (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  descricao text not null check (char_length(descricao) between 1 and 80),
  valor_centavos integer not null check (valor_centavos > 0),
  pago_por uuid not null references public.participantes (id) on delete cascade,
  criado_em timestamptz not null default now()
);
create index on public.gastos (role_id);

-- Quem divide cada gasto (quem não bebe não paga a cerveja).
create table public.gasto_participantes (
  gasto_id uuid not null references public.gastos (id) on delete cascade,
  participante_id uuid not null references public.participantes (id) on delete cascade,
  primary key (gasto_id, participante_id)
);

-- Transferências já feitas no acerto ("marcar como pago").
create table public.pagamentos (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles (id) on delete cascade,
  de uuid not null references public.participantes (id) on delete cascade,
  para uuid not null references public.participantes (id) on delete cascade,
  valor_centavos integer not null check (valor_centavos > 0),
  criado_em timestamptz not null default now()
);
create index on public.pagamentos (role_id);

alter table public.roles enable row level security;
alter table public.participantes enable row level security;
alter table public.gastos enable row level security;
alter table public.gasto_participantes enable row level security;
alter table public.pagamentos enable row level security;
