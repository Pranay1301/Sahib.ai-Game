-- Sahib AI base-building V1 Supabase schema.
-- Source of truth: Logic/BASE_BACKEND_SUPABASE.md and the 29th backend/cost PDF.
-- Keep this lean: no XP, gems, resources, per-word history, quiz-attempt logs,
-- analytics events, heavy media storage, or separate free/pro tables.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'en' check (language in ('en', 'ar')),
  learning_track text not null default 'english' check (learning_track in ('english', 'ai_agents')),
  is_pro boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.user_game_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  coins integer not null default 0 check (coins >= 0),
  hearts_remaining integer not null default 4 check (hearts_remaining between 0 and 4),
  next_refill_at timestamptz,
  skill_challenges_completed integer not null default 0 check (skill_challenges_completed >= 0),
  last_skill_result jsonb,
  has_seen_first_upgrade_pro_message boolean not null default false
);

create table if not exists public.user_buildings (
  user_id uuid not null references auth.users(id) on delete cascade,
  building_id text not null check (
    building_id in (
      'palace',
      'learning_hall',
      'attack_tower',
      'treasury',
      'wall_gate',
      'drone_station',
      'trophy_hall'
    )
  ),
  level integer not null default 1 check (level between 1 and 6),
  state text not null check (
    state in (
      'locked',
      'available',
      'quiz_required',
      'upgrading',
      'completed',
      'max_level'
    )
  ),
  primary key (user_id, building_id)
);

create table if not exists public.active_upgrades (
  user_id uuid primary key references auth.users(id) on delete cascade,
  building_id text not null check (
    building_id in (
      'palace',
      'learning_hall',
      'attack_tower',
      'treasury',
      'wall_gate',
      'drone_station',
      'trophy_hall'
    )
  ),
  from_level integer not null check (from_level between 1 and 5),
  to_level integer not null check (to_level between 2 and 6),
  started_at timestamptz not null,
  finishes_at timestamptz not null check (finishes_at >= started_at),
  timer_duration_minutes integer not null check (timer_duration_minutes > 0),
  check (to_level = from_level + 1)
);

create table if not exists public.battle_reward_claims (
  user_id uuid not null references auth.users(id) on delete cascade,
  battle_result_id text not null,
  outcome text not null check (outcome in ('win', 'draw', 'loss')),
  reason text not null,
  base_coins integer not null check (base_coins >= 0),
  final_coins_awarded integer not null check (final_coins_awarded >= 0),
  claimed_at timestamptz not null default now(),
  primary key (user_id, battle_result_id)
);

create index if not exists user_buildings_user_id_idx
  on public.user_buildings (user_id);

create index if not exists battle_reward_claims_user_claimed_at_idx
  on public.battle_reward_claims (user_id, claimed_at desc);

alter table public.profiles enable row level security;
alter table public.user_game_state enable row level security;
alter table public.user_buildings enable row level security;
alter table public.active_upgrades enable row level security;
alter table public.battle_reward_claims enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_game_state_select_own"
  on public.user_game_state
  for select
  using (auth.uid() = user_id);

create policy "user_game_state_insert_own"
  on public.user_game_state
  for insert
  with check (auth.uid() = user_id);

create policy "user_game_state_update_own"
  on public.user_game_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_buildings_select_own"
  on public.user_buildings
  for select
  using (auth.uid() = user_id);

create policy "user_buildings_insert_own"
  on public.user_buildings
  for insert
  with check (auth.uid() = user_id);

create policy "user_buildings_update_own"
  on public.user_buildings
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "active_upgrades_select_own"
  on public.active_upgrades
  for select
  using (auth.uid() = user_id);

create policy "active_upgrades_insert_own"
  on public.active_upgrades
  for insert
  with check (auth.uid() = user_id);

create policy "active_upgrades_update_own"
  on public.active_upgrades
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "active_upgrades_delete_own"
  on public.active_upgrades
  for delete
  using (auth.uid() = user_id);

create policy "battle_reward_claims_select_own"
  on public.battle_reward_claims
  for select
  using (auth.uid() = user_id);

create policy "battle_reward_claims_insert_own"
  on public.battle_reward_claims
  for insert
  with check (auth.uid() = user_id);

create or replace function public.base_server_now()
returns timestamptz
language sql
stable
security invoker
set search_path = public
as $$
  select now();
$$;

create or replace function public.claim_base_battle_reward(
  p_battle_result_id text,
  p_outcome text,
  p_reason text,
  p_base_coins integer,
  p_final_coins_awarded integer
)
returns table (
  accepted boolean,
  result_reason text,
  coins integer,
  final_coins_awarded integer,
  claimed_at timestamptz
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_claimed_at timestamptz := now();
  v_coins integer;
begin
  if v_user_id is null then
    raise exception 'Authenticated user required';
  end if;

  if p_battle_result_id is null or length(p_battle_result_id) = 0 then
    raise exception 'battle_result_id is required';
  end if;

  if p_outcome not in ('win', 'draw', 'loss') then
    raise exception 'invalid battle outcome';
  end if;

  if p_base_coins < 0 or p_final_coins_awarded < 0 then
    raise exception 'coin values must be non-negative';
  end if;

  insert into public.battle_reward_claims (
    user_id,
    battle_result_id,
    outcome,
    reason,
    base_coins,
    final_coins_awarded,
    claimed_at
  )
  values (
    v_user_id,
    p_battle_result_id,
    p_outcome,
    p_reason,
    p_base_coins,
    p_final_coins_awarded,
    v_claimed_at
  )
  on conflict (user_id, battle_result_id) do nothing;

  if not found then
    select state.coins
      into v_coins
      from public.user_game_state as state
      where state.user_id = v_user_id;

    return query
      select
        false,
        'duplicate_battle_reward_claim'::text,
        coalesce(v_coins, 0),
        0,
        null::timestamptz;
    return;
  end if;

  update public.user_game_state as state
    set coins = state.coins + p_final_coins_awarded
    where state.user_id = v_user_id
    returning state.coins into v_coins;

  if not found then
    insert into public.user_game_state (user_id, coins)
      values (v_user_id, p_final_coins_awarded)
      returning user_game_state.coins into v_coins;
  end if;

  return query
    select
      true,
      'claimed'::text,
      v_coins,
      p_final_coins_awarded,
      v_claimed_at;
end;
$$;
