create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.tournament_settings (
	id smallint primary key default 1 check (id = 1),
	title text not null default 'DE''BAIT 2026',
	is_public boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

insert into public.tournament_settings (id)
values (1)
on conflict (id) do nothing;

create table public.admin_profiles (
	user_id uuid primary key references auth.users (id) on delete cascade,
	role text not null default 'admin' check (role = 'admin'),
	created_at timestamptz not null default now()
);

create table public.teams (
	id uuid primary key default gen_random_uuid(),
	registration_number smallint not null check (registration_number between 1 and 16),
	name text not null check (char_length(btrim(name)) between 1 and 80),
	stream text,
	status text not null default 'registered'
		check (status in ('registered', 'qualified', 'eliminated', 'champion')),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create unique index teams_active_registration_number_key
	on public.teams (registration_number) where is_active;
create unique index teams_name_ci_key on public.teams (lower(name));

create table public.team_members (
	id uuid primary key default gen_random_uuid(),
	team_id uuid not null references public.teams (id) on delete restrict,
	name text not null check (char_length(btrim(name)) between 1 and 100),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (team_id, id)
);

create index team_members_team_id_idx on public.team_members (team_id);

create table public.matches (
	id uuid primary key default gen_random_uuid(),
	match_number smallint not null unique check (match_number between 1 and 11),
	round text not null check (round in ('preliminary', 'semifinal', 'final')),
	round_label text not null,
	stage_name text not null,
	motion text,
	zone smallint not null default 1 check (zone between 1 and 3),
	switch_round_triggered boolean not null default false,
	status text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed')),
	team_a_id uuid references public.teams (id) on delete restrict,
	team_b_id uuid references public.teams (id) on delete restrict,
	winner_team_id uuid references public.teams (id) on delete restrict,
	scheduled_at timestamptz,
	completed_at timestamptz,
	court text,
	voting_status text not null default 'upcoming'
		check (voting_status in ('upcoming', 'open', 'closed')),
	is_public boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	check (team_a_id is null or team_b_id is null or team_a_id <> team_b_id),
	check (winner_team_id is null or winner_team_id in (team_a_id, team_b_id)),
	check (status <> 'completed' or winner_team_id is not null)
);

create index matches_status_match_number_idx on public.matches (status, match_number);
create index matches_team_a_id_idx on public.matches (team_a_id);
create index matches_team_b_id_idx on public.matches (team_b_id);

create table public.match_scores (
	match_id uuid not null references public.matches (id) on delete restrict,
	team_id uuid not null references public.teams (id) on delete restrict,
	side text not null check (side in ('team_a', 'team_b')),
	content_score smallint not null check (content_score between 0 and 40),
	strategy_score smallint not null check (strategy_score between 0 and 30),
	style_score smallint not null check (style_score between 0 and 30),
	total_score smallint generated always as (content_score + strategy_score + style_score) stored,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	primary key (match_id, side),
	unique (match_id, team_id)
);

create index match_scores_team_id_idx on public.match_scores (team_id);

create table public.audience_votes (
	id uuid primary key default gen_random_uuid(),
	match_id uuid not null references public.matches (id) on delete restrict,
	team_id uuid not null references public.teams (id) on delete restrict,
	voter_id uuid not null,
	created_at timestamptz not null default now(),
	unique (match_id, voter_id)
);

create index audience_votes_match_id_idx on public.audience_votes (match_id);

create table public.match_vote_totals (
	match_id uuid primary key references public.matches (id) on delete restrict,
	team_a_votes bigint not null default 0 check (team_a_votes >= 0),
	team_b_votes bigint not null default 0 check (team_b_votes >= 0),
	total_votes bigint generated always as (team_a_votes + team_b_votes) stored,
	updated_at timestamptz not null default now()
);

create or replace function private.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
	select exists (
		select 1
		from public.admin_profiles profile
		where profile.user_id = (select auth.uid())
			and profile.role = 'admin'
	);
$$;

create or replace function private.is_anonymous_voter()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
	select coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false);
$$;

revoke all on function private.is_admin() from public, anon, authenticated;
revoke all on function private.is_anonymous_voter() from public, anon, authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_anonymous_voter() to authenticated;

create or replace function private.enforce_team_member_count()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
	checked_team_id uuid;
	member_count integer;
begin
	if tg_op <> 'INSERT' then
		checked_team_id := old.team_id;
		select count(*) into member_count
		from public.team_members member
		where member.team_id = checked_team_id;
		if member_count < 3 or member_count > 5 then
			raise exception 'A team must have between 3 and 5 members.' using errcode = '23514';
		end if;
	end if;

	if tg_op <> 'DELETE' and (tg_op = 'INSERT' or new.team_id is distinct from old.team_id) then
		checked_team_id := new.team_id;
		select count(*) into member_count
		from public.team_members member
		where member.team_id = checked_team_id;
		if member_count < 3 or member_count > 5 then
			raise exception 'A team must have between 3 and 5 members.' using errcode = '23514';
		end if;
	end if;
	return null;
end;
$$;

create constraint trigger team_member_count_constraint
after insert or update or delete on public.team_members
deferrable initially deferred
for each row execute function private.enforce_team_member_count();

create or replace function private.enforce_new_team_member_count()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
	member_count integer;
begin
	select count(*) into member_count
	from public.team_members member
	where member.team_id = new.id;
	if member_count < 3 or member_count > 5 then
		raise exception 'A team must have between 3 and 5 members.' using errcode = '23514';
	end if;
	return null;
end;
$$;

create constraint trigger new_team_member_count_constraint
after insert on public.teams
deferrable initially deferred
for each row execute function private.enforce_new_team_member_count();

create or replace function private.guard_team_archive()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
	if old.is_active and not new.is_active and exists (
		select 1
		from public.matches match
		where match.status <> 'completed'
			and (match.team_a_id = old.id or match.team_b_id = old.id)
	) then
		raise exception 'Resolve this team''s upcoming or live match assignments before archiving it.'
			using errcode = '23514';
	end if;
	new.updated_at := now();
	return new;
end;
$$;

create trigger teams_guard_archive
before update on public.teams
for each row execute function private.guard_team_archive();

create or replace function private.guard_match_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
	if old.status <> 'upcoming'
		and (new.team_a_id is distinct from old.team_a_id or new.team_b_id is distinct from old.team_b_id) then
		raise exception 'Live or completed match assignments cannot be changed.' using errcode = '23514';
	end if;
	if new.status = 'live' and (new.team_a_id is null or new.team_b_id is null) then
		raise exception 'Assign two distinct teams before setting a match live.' using errcode = '23514';
	end if;
	if new.voting_status = 'open' and new.status <> 'live' then
		raise exception 'Audience voting can only be opened for a live match.' using errcode = '23514';
	end if;
	new.updated_at := now();
	if new.status = 'completed' and old.status <> 'completed' then
		new.completed_at := coalesce(new.completed_at, now());
	end if;
	return new;
end;
$$;

create trigger matches_guard_update
before update on public.matches
for each row execute function private.guard_match_update();

create or replace function private.guard_match_score()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
	assigned_team_id uuid;
begin
	select case new.side
		when 'team_a' then match.team_a_id
		else match.team_b_id
	end into assigned_team_id
	from public.matches match
	where match.id = new.match_id;

	if assigned_team_id is null or assigned_team_id <> new.team_id then
		raise exception 'Score team must match its assigned side in the match.' using errcode = '23514';
	end if;
	new.updated_at := now();
	return new;
end;
$$;

create trigger match_scores_guard_assignment
before insert or update on public.match_scores
for each row execute function private.guard_match_score();

create or replace function private.update_match_vote_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	assigned_a uuid;
	assigned_b uuid;
begin
	select match.team_a_id, match.team_b_id
	into assigned_a, assigned_b
	from public.matches match
	where match.id = new.match_id
		and match.status = 'live'
		and match.voting_status = 'open';

	if new.team_id = assigned_a then
		insert into public.match_vote_totals (match_id, team_a_votes)
		values (new.match_id, 1)
		on conflict (match_id) do update
			set team_a_votes = public.match_vote_totals.team_a_votes + 1,
					updated_at = now();
	elsif new.team_id = assigned_b then
		insert into public.match_vote_totals (match_id, team_b_votes)
		values (new.match_id, 1)
		on conflict (match_id) do update
			set team_b_votes = public.match_vote_totals.team_b_votes + 1,
					updated_at = now();
	else
		raise exception 'Vote target is not assigned to the live match.' using errcode = '23514';
	end if;
	return new;
end;
$$;

revoke all on function private.enforce_team_member_count() from public, anon, authenticated;
revoke all on function private.enforce_new_team_member_count() from public, anon, authenticated;
revoke all on function private.guard_team_archive() from public, anon, authenticated;
revoke all on function private.guard_match_update() from public, anon, authenticated;
revoke all on function private.guard_match_score() from public, anon, authenticated;
revoke all on function private.update_match_vote_totals() from public, anon, authenticated;

create trigger audience_votes_update_totals
after insert on public.audience_votes
for each row execute function private.update_match_vote_totals();

create or replace function public.save_team(
	p_team_id uuid,
	p_name text,
	p_stream text,
	p_members jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
	team_id uuid;
	registration_number smallint;
	member_count integer;
begin
	if not private.is_admin() then
		raise exception 'Administrator access required.' using errcode = '42501';
	end if;
	if char_length(btrim(coalesce(p_name, ''))) not between 1 and 80 then
		raise exception 'Team name must be between 1 and 80 characters.' using errcode = '22023';
	end if;
	if jsonb_typeof(p_members) <> 'array' then
		raise exception 'Team members must be supplied as an array.' using errcode = '22023';
	end if;
	member_count := jsonb_array_length(p_members);
	if member_count not between 3 and 5 then
		raise exception 'A team must have between 3 and 5 members.' using errcode = '22023';
	end if;
	if exists (
		select 1 from jsonb_array_elements(p_members) as member(value)
		where char_length(btrim(coalesce(member.value ->> 'name', ''))) not between 1 and 100
	) then
		raise exception 'Every member name must be between 1 and 100 characters.' using errcode = '22023';
	end if;

	if p_team_id is null then
		perform settings.id from public.tournament_settings settings where settings.id = 1 for update;
		select min(available.slot)::smallint into registration_number
		from generate_series(1, 16) as available(slot)
		where not exists (
			select 1 from public.teams team
			where team.registration_number = available.slot and team.is_active
		);
		if registration_number is null then
			raise exception 'The 16-team tournament is at capacity.' using errcode = '23514';
		end if;
		insert into public.teams (registration_number, name, stream)
		values (registration_number, btrim(p_name), nullif(btrim(coalesce(p_stream, '')), ''))
		returning id into team_id;
	else
		select team.registration_number into registration_number
		from public.teams team
		where team.id = p_team_id and team.is_active
		for update;
		if not found then
			raise exception 'Active team was not found.' using errcode = 'P0002';
		end if;
		team_id := p_team_id;
		update public.teams
		set name = btrim(p_name), stream = nullif(btrim(coalesce(p_stream, '')), ''), updated_at = now()
		where id = team_id;
		delete from public.team_members member where member.team_id = team_id;
	end if;

	insert into public.team_members (id, team_id, name)
	select coalesce(nullif(member.value ->> 'id', '')::uuid, gen_random_uuid()),
				 team_id,
				 btrim(member.value ->> 'name')
	from jsonb_array_elements(p_members) as member(value);

	return team_id;
end;
$$;

create or replace function public.archive_team(p_team_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
	if not private.is_admin() then
		raise exception 'Administrator access required.' using errcode = '42501';
	end if;
	update public.teams set is_active = false where id = p_team_id and is_active;
	if not found then
		raise exception 'Active team was not found.' using errcode = 'P0002';
	end if;
end;
$$;

revoke all on function public.save_team(uuid, text, text, jsonb) from public, anon;
revoke all on function public.archive_team(uuid) from public, anon;
grant execute on function public.save_team(uuid, text, text, jsonb) to authenticated;
grant execute on function public.archive_team(uuid) to authenticated;

alter table public.tournament_settings enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.matches enable row level security;
alter table public.match_scores enable row level security;
alter table public.audience_votes enable row level security;
alter table public.match_vote_totals enable row level security;

create policy settings_public_read on public.tournament_settings
for select to anon, authenticated using (is_public or (select private.is_admin()));
create policy settings_admin_update on public.tournament_settings
for update to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy admin_profiles_self_read on public.admin_profiles
for select to authenticated using (user_id = (select auth.uid()));

create policy teams_public_read on public.teams
for select to anon, authenticated using (
	is_active
	or exists (
		select 1 from public.matches match
		where match.is_public
			and (match.team_a_id = teams.id or match.team_b_id = teams.id)
	)
	or (select private.is_admin())
);
create policy teams_admin_update on public.teams
for update to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy teams_admin_insert on public.teams
for insert to authenticated with check ((select private.is_admin()));
create policy team_members_admin_all on public.team_members
for all to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy matches_public_read on public.matches
for select to anon, authenticated using (
	is_public and exists (
		select 1 from public.tournament_settings settings
		where settings.id = 1 and settings.is_public
	)
	or (select private.is_admin())
);
create policy matches_admin_update on public.matches
for update to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy scores_public_read on public.match_scores
for select to anon, authenticated using (
	exists (select 1 from public.matches match where match.id = match_scores.match_id and match.is_public)
	or (select private.is_admin())
);
create policy scores_admin_all on public.match_scores
for all to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy votes_own_read on public.audience_votes
for select to authenticated using (
	voter_id = (select auth.uid()) and (select private.is_anonymous_voter())
);
create policy votes_admin_read on public.audience_votes
for select to authenticated using ((select private.is_admin()));
create policy votes_submit on public.audience_votes
for insert to authenticated with check (
	voter_id = (select auth.uid())
	and (select private.is_anonymous_voter())
	and exists (
		select 1 from public.matches match
		where match.id = audience_votes.match_id
			and match.is_public
			and match.status = 'live'
			and match.voting_status = 'open'
			and audience_votes.team_id in (match.team_a_id, match.team_b_id)
	)
);

create policy vote_totals_public_read on public.match_vote_totals
for select to anon, authenticated using (
	exists (select 1 from public.matches match where match.id = match_vote_totals.match_id and match.is_public)
	or (select private.is_admin())
);

revoke all on public.tournament_settings from anon, authenticated;
grant select on public.tournament_settings to anon, authenticated;
grant update (title, is_public) on public.tournament_settings to authenticated;

revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;

revoke all on public.teams from anon, authenticated;
grant select (id, registration_number, name, stream, status, is_active, created_at, updated_at)
	on public.teams to anon, authenticated;
grant insert on public.teams to authenticated;
grant update (name, stream, status, is_active) on public.teams to authenticated;

revoke all on public.team_members from anon, authenticated;
grant select, insert, update, delete on public.team_members to authenticated;

revoke all on public.matches from anon, authenticated;
grant select on public.matches to anon, authenticated;
grant update (round, round_label, stage_name, motion, zone, switch_round_triggered, status,
	team_a_id, team_b_id, winner_team_id, scheduled_at, completed_at, court, voting_status, is_public)
	on public.matches to authenticated;

revoke all on public.match_scores from anon, authenticated;
grant select (match_id, team_id, side, content_score, strategy_score, style_score, total_score, created_at, updated_at)
	on public.match_scores to anon, authenticated;
grant select, insert, update on public.match_scores to authenticated;

revoke all on public.audience_votes from anon, authenticated;
grant select (id, match_id, team_id, voter_id, created_at), insert (match_id, team_id, voter_id)
	on public.audience_votes to authenticated;

revoke all on public.match_vote_totals from anon, authenticated;
grant select on public.match_vote_totals to anon, authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

insert into public.matches (match_number, round, round_label, stage_name)
select match_number,
			 case
				 when match_number <= 8 then 'preliminary'
				 when match_number <= 10 then 'semifinal'
				 else 'final'
			 end,
			 case
				 when match_number <= 8 then 'Prelim ' || lpad(match_number::text, 2, '0')
				 when match_number <= 10 then 'Semifinal ' || lpad((match_number - 8)::text, 2, '0')
				 else 'Grand Final'
			 end,
			 case
				 when match_number <= 8 then 'Preliminaries · Match ' || lpad(match_number::text, 2, '0')
				 when match_number <= 10 then 'Final Four · Match ' || lpad(match_number::text, 2, '0')
				 else 'Championship Debate'
			 end
from generate_series(1, 11) as match_number
on conflict (match_number) do nothing;

do $$
declare
	table_name text;
begin
	if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime') then
		foreach table_name in array array['teams', 'matches', 'match_scores', 'match_vote_totals'] loop
			if not exists (
				select 1 from pg_catalog.pg_publication_tables
				where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = table_name
			) then
				execute format('alter publication supabase_realtime add table public.%I', table_name);
			end if;
		end loop;
	end if;
end;
$$;
