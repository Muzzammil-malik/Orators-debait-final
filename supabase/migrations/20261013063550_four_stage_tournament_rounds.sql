alter table public.matches
	drop constraint matches_round_check;

alter table public.matches
	add constraint matches_round_check
		check (round in ('preliminary', 'quarterfinal', 'semifinal', 'final'));

update public.matches
set
	round = 'quarterfinal',
	round_label = regexp_replace(
		round_label,
		'(?i)semi[- ]?finals?',
		'Quarter-final',
		'g'
	)
where round = 'semifinal';

with existing as (
	select count(*)::integer as match_count
	from public.matches
	where round = 'quarterfinal'
)
insert into public.matches (round, round_label, stage_name)
select
	'quarterfinal',
	'Quarter-final ' || lpad((existing.match_count + missing.match_number)::text, 2, '0'),
	'Quarter-finals · Match ' || lpad((existing.match_count + missing.match_number)::text, 2, '0')
from existing
cross join lateral generate_series(1, greatest(0, 4 - existing.match_count)) as missing(match_number);

insert into public.matches (round, round_label, stage_name)
select
	'semifinal',
	'Semi-final ' || lpad(match_number::text, 2, '0'),
	'Semi-finals · Match ' || lpad(match_number::text, 2, '0')
from generate_series(1, 2) as semifinal(match_number);