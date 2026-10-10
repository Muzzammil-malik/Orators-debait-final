drop function public.save_team(uuid, text, text, jsonb);

create function public.save_team(
	p_team_id uuid,
	p_name text,
	p_stream text,
	p_status text,
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
	if p_status not in ('registered', 'qualified', 'eliminated', 'champion') then
		raise exception 'Invalid team status.' using errcode = '22023';
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
		insert into public.teams (registration_number, name, stream, status)
		values (
			registration_number,
			btrim(p_name),
			nullif(btrim(coalesce(p_stream, '')), ''),
			p_status
		)
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
		set name = btrim(p_name),
				stream = nullif(btrim(coalesce(p_stream, '')), ''),
				status = p_status,
				updated_at = now()
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

revoke all on function public.save_team(uuid, text, text, text, jsonb) from public, anon;
grant execute on function public.save_team(uuid, text, text, text, jsonb) to authenticated;
