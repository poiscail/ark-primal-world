-- ARK: Primal World — schéma Supabase
-- À coller dans Supabase > SQL Editor > New query > Run.
-- Le script peut être relancé sans danger (idempotent).

-- 1) TABLES ---------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'player' check (role in ('player','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.game_saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint game_saves_size check (pg_column_size(data) < 200000)
);

-- une seule ligne (id = 1) : la configuration partagée du jeu
create table if not exists public.game_config (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint game_config_size check (pg_column_size(data) < 200000)
);

-- 2) FONCTIONS ET TRIGGERS -----------------------------------------------

-- Création automatique du profil (toujours "player") à l'inscription.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profils pour les comptes déjà existants (si tu relances le script plus tard).
insert into public.profiles (id) select id from auth.users on conflict do nothing;

-- Horodatage fiable côté serveur.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_saves_touch on public.game_saves;
create trigger trg_saves_touch before insert or update on public.game_saves
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_config_touch on public.game_config;
create trigger trg_config_touch before insert or update on public.game_config
  for each row execute function public.touch_updated_at();

-- Test "suis-je admin ?" utilisé par les règles RLS.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 3) DROITS ET RLS ---------------------------------------------------------

alter table public.profiles    enable row level security;
alter table public.game_saves  enable row level security;
alter table public.game_config enable row level security;

revoke all on public.profiles, public.game_saves, public.game_config from anon, authenticated;

-- profiles : lecture de SON profil uniquement. Aucun droit d'écriture depuis
-- l'API : impossible de se promouvoir admin en modifiant son profil.
grant select on public.profiles to authenticated;
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

-- game_saves : chaque joueur lit / crée / modifie uniquement sa propre sauvegarde.
grant select, insert, update on public.game_saves to authenticated;
drop policy if exists "saves_select_own" on public.game_saves;
drop policy if exists "saves_insert_own" on public.game_saves;
drop policy if exists "saves_update_own" on public.game_saves;
create policy "saves_select_own" on public.game_saves
  for select to authenticated using (user_id = auth.uid());
create policy "saves_insert_own" on public.game_saves
  for insert to authenticated with check (user_id = auth.uid());
create policy "saves_update_own" on public.game_saves
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- game_config : lecture pour tout le monde (nécessaire avant connexion),
-- écriture réservée aux administrateurs.
grant select on public.game_config to anon, authenticated;
grant insert, update on public.game_config to authenticated;
drop policy if exists "config_select_all"  on public.game_config;
drop policy if exists "config_insert_admin" on public.game_config;
drop policy if exists "config_update_admin" on public.game_config;
create policy "config_select_all" on public.game_config
  for select to anon, authenticated using (true);
create policy "config_insert_admin" on public.game_config
  for insert to authenticated with check (public.is_admin());
create policy "config_update_admin" on public.game_config
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) DEVENIR ADMINISTRATEUR ------------------------------------------------
-- 1. Crée d'abord ton compte normalement depuis le jeu (e-mail + mot de passe).
-- 2. Dans le SQL Editor, exécute (en remplaçant l'adresse) :
--
--   update public.profiles
--   set role = 'admin'
--   where id = (select id from auth.users where email = 'ton-email@exemple.com');
--
-- Le SQL Editor tourne avec les droits du propriétaire du projet : c'est le
-- seul endroit prévu pour attribuer ce rôle. Reconnecte-toi ensuite dans le jeu.
