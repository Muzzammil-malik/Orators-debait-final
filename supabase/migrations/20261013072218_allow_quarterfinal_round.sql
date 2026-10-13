alter table public.matches
	drop constraint matches_round_check;

alter table public.matches
	add constraint matches_round_check
		check (round in ('preliminary', 'quarterfinal', 'semifinal', 'final'));