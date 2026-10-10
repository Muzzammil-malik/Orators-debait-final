create or replace function private.guard_match_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
	if old.status = 'completed' and new.status <> 'completed' then
		raise exception 'Completed match results are immutable.' using errcode = '23514';
	end if;
	if old.status <> 'upcoming'
		and (new.team_a_id is distinct from old.team_a_id or new.team_b_id is distinct from old.team_b_id) then
		raise exception 'Live or completed match assignments cannot be changed.' using errcode = '23514';
	end if;
	if (new.team_a_id is distinct from old.team_a_id or new.team_b_id is distinct from old.team_b_id)
		and exists (select 1 from public.match_scores score where score.match_id = old.id) then
		raise exception 'Clear the match scores before changing team assignments.' using errcode = '23514';
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
