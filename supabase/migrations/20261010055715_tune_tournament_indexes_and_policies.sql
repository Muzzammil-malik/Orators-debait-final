create index if not exists matches_winner_team_id_idx on public.matches (winner_team_id);
create index if not exists audience_votes_team_id_idx on public.audience_votes (team_id);

drop policy if exists scores_admin_all on public.match_scores;
create policy scores_admin_insert on public.match_scores
for insert to authenticated with check ((select private.is_admin()));
create policy scores_admin_update on public.match_scores
for update to authenticated using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy scores_admin_delete on public.match_scores
for delete to authenticated using ((select private.is_admin()));

drop policy if exists votes_admin_read on public.audience_votes;
drop policy if exists votes_own_read on public.audience_votes;
create policy votes_private_read on public.audience_votes
for select to authenticated using (
	(voter_id = (select auth.uid()) and (select private.is_anonymous_voter()))
	or (select private.is_admin())
);
