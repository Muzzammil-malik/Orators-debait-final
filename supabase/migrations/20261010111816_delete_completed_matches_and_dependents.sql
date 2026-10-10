alter table public.match_scores
	drop constraint match_scores_match_id_fkey,
	add constraint match_scores_match_id_fkey
		foreign key (match_id) references public.matches (id) on delete cascade;

alter table public.audience_votes
	drop constraint audience_votes_match_id_fkey,
	add constraint audience_votes_match_id_fkey
		foreign key (match_id) references public.matches (id) on delete cascade;

alter table public.match_vote_totals
	drop constraint match_vote_totals_match_id_fkey,
	add constraint match_vote_totals_match_id_fkey
		foreign key (match_id) references public.matches (id) on delete cascade;

grant delete on public.matches to authenticated;

drop policy if exists matches_admin_delete on public.matches;
create policy matches_admin_delete on public.matches
for delete to authenticated using ((select private.is_admin()));
