-- Gravações atômicas, controle de concorrência, limites contra abuso e limpeza de dados antigos.
-- Todas as funções são chamadas só pelo servidor (service role); anon e authenticated não executam nada.

-- Versão do rolê: muda a cada alteração. Usada para não registrar pagamento sobre um acerto desatualizado.
alter table public.roles
  add column versao integer not null default 0,
  add column atualizado_em timestamptz not null default now();

create index on public.roles (atualizado_em);
create index on public.gasto_participantes (participante_id);
create index on public.gastos (pago_por);
create index on public.pagamentos (de);
create index on public.pagamentos (para);

create function public.tocar_role() returns trigger
language plpgsql as $$
begin
  update public.roles
     set versao = versao + 1, atualizado_em = now()
   where id = coalesce(new.role_id, old.role_id);
  return null;
end $$;

create trigger tocar_role after insert or update or delete on public.participantes
  for each row execute function public.tocar_role();
create trigger tocar_role after insert or update or delete on public.gastos
  for each row execute function public.tocar_role();
create trigger tocar_role after insert or update or delete on public.pagamentos
  for each row execute function public.tocar_role();

-- Cria (p_gasto_id nulo) ou edita um gasto junto com a divisão, numa transação só.
-- Retorna o id do gasto, ou nulo se algum participante não for do rolê ou o limite de gastos foi atingido.
create function public.salvar_gasto(
  p_role_id uuid,
  p_gasto_id uuid,
  p_descricao text,
  p_valor_centavos integer,
  p_pago_por uuid,
  p_dividido_entre uuid[]
) returns uuid
language plpgsql as $$
declare
  v_gasto_id uuid := p_gasto_id;
  v_ids uuid[] := array(select distinct unnest(p_dividido_entre || p_pago_por));
begin
  if coalesce(array_length(p_dividido_entre, 1), 0) = 0 then
    return null;
  end if;

  -- Trava o rolê para serializar alterações concorrentes.
  perform 1 from public.roles where id = p_role_id for update;
  if not found then
    return null;
  end if;

  if (select count(*) from public.participantes where role_id = p_role_id and id = any (v_ids))
     <> array_length(v_ids, 1) then
    return null;
  end if;

  if v_gasto_id is null then
    if (select count(*) from public.gastos where role_id = p_role_id) >= 300 then
      return null;
    end if;
    insert into public.gastos (role_id, descricao, valor_centavos, pago_por)
    values (p_role_id, p_descricao, p_valor_centavos, p_pago_por)
    returning id into v_gasto_id;
  else
    update public.gastos
       set descricao = p_descricao, valor_centavos = p_valor_centavos, pago_por = p_pago_por
     where id = v_gasto_id and role_id = p_role_id;
    if not found then
      return null;
    end if;
    delete from public.gasto_participantes where gasto_id = v_gasto_id;
  end if;

  insert into public.gasto_participantes (gasto_id, participante_id)
  select v_gasto_id, unnest(array(select distinct unnest(p_dividido_entre)));

  return v_gasto_id;
end $$;

-- Registra um pagamento só se o rolê ainda está na versão em que o acerto foi calculado.
-- Evita pagamento em dobro (clique duplo ou duas pessoas ao mesmo tempo).
create function public.registrar_pagamento(
  p_role_id uuid,
  p_de uuid,
  p_para uuid,
  p_valor_centavos integer,
  p_versao integer
) returns boolean
language plpgsql as $$
begin
  perform 1 from public.roles where id = p_role_id and versao = p_versao for update;
  if not found then
    return false;
  end if;
  insert into public.pagamentos (role_id, de, para, valor_centavos)
  values (p_role_id, p_de, p_para, p_valor_centavos);
  return true;
end $$;

-- Remove a pessoa só se ela não aparece em nenhum gasto ou pagamento
-- (o cascade apagaria os gastos que ela pagou).
create function public.remover_participante(p_role_id uuid, p_participante_id uuid) returns boolean
language plpgsql as $$
begin
  perform 1 from public.roles where id = p_role_id for update;
  if exists (select 1 from public.gastos where role_id = p_role_id and pago_por = p_participante_id)
     or exists (select 1 from public.gasto_participantes where participante_id = p_participante_id)
     or exists (select 1 from public.pagamentos
                 where role_id = p_role_id and p_participante_id in (de, para)) then
    return false;
  end if;
  delete from public.participantes where id = p_participante_id and role_id = p_role_id;
  return found;
end $$;

-- Limite de requisições por janela de tempo. A chave é um hash (ação + IP), nunca o IP puro.
create table public.limites (
  chave text not null,
  janela timestamptz not null,
  contagem integer not null default 1,
  primary key (chave, janela)
);
alter table public.limites enable row level security;

create function public.consumir_limite(p_chave text, p_maximo integer, p_janela_segundos integer)
returns boolean
language plpgsql as $$
declare
  v_janela timestamptz := to_timestamp(
    floor(extract(epoch from now()) / p_janela_segundos) * p_janela_segundos
  );
  v_contagem integer;
begin
  insert into public.limites (chave, janela) values (p_chave, v_janela)
  on conflict (chave, janela) do update set contagem = public.limites.contagem + 1
  returning contagem into v_contagem;
  return v_contagem <= p_maximo;
end $$;

-- Retenção: rolês sem alteração há 180 dias são apagados (com tudo o que pertence a eles).
create function public.limpar_dados_antigos() returns void
language sql as $$
  delete from public.roles where atualizado_em < now() - interval '180 days';
  delete from public.limites where janela < now() - interval '1 day';
$$;

revoke execute on function
  public.tocar_role(),
  public.salvar_gasto(uuid, uuid, text, integer, uuid, uuid[]),
  public.registrar_pagamento(uuid, uuid, uuid, integer, integer),
  public.remover_participante(uuid, uuid),
  public.consumir_limite(text, integer, integer),
  public.limpar_dados_antigos()
from public, anon, authenticated;

grant execute on function
  public.salvar_gasto(uuid, uuid, text, integer, uuid, uuid[]),
  public.registrar_pagamento(uuid, uuid, uuid, integer, integer),
  public.remover_participante(uuid, uuid),
  public.consumir_limite(text, integer, integer),
  public.limpar_dados_antigos()
to service_role;

-- Agenda a limpeza diária às 4h (UTC) com pg_cron, disponível no Supabase.
create extension if not exists pg_cron;
select cron.schedule('divide-role-limpeza', '0 4 * * *', 'select public.limpar_dados_antigos()');
