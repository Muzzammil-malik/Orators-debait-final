alter table public.matches
	drop constraint matches_match_number_check;

alter table public.matches
	add constraint matches_match_number_check check (match_number >= 1);

create sequence public.matches_match_number_seq as smallint;

select setval(
	'public.matches_match_number_seq'::regclass,
	coalesce(max(match_number), 1),
	max(match_number) is not null
)
from public.matches;

alter table public.matches
	alter column match_number set default nextval('public.matches_match_number_seq'::regclass);

alter sequence public.matches_match_number_seq
	owned by public.matches.match_number;

revoke all on sequence public.matches_match_number_seq from public, anon, authenticated;
grant usage, select on sequence public.matches_match_number_seq to authenticated;

grant insert on public.matches to authenticated;
grant update (updated_at) on public.matches to authenticated;

drop policy if exists matches_admin_insert on public.matches;
create policy matches_admin_insert on public.matches
for insert to authenticated
with check ((select private.is_admin()));