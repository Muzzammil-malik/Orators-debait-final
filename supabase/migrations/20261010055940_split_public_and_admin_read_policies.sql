drop policy if exists settings_public_read on public.tournament_settings;
create policy settings_public_read on public.tournament_settings
for select to anon using (is_public);
create policy settings_authenticated_read on public.tournament_settings
for select to authenticated using (is_public or (select private.is_admin()));

drop policy if exists teams_public_read on public.teams;
create policy teams_public_read on public.teams
for select to anon using (
	is_active or exists (
		select 1 from public.matches match
		where match.is_public and (match.team_a_id = teams.id or match.team_b_id = teams.id)
	)
);
create policy teams_authenticated_read on public.teams
for select to authenticated using (
	is_active or exists (
		select 1 from public.matches match
		where match.is_public and (match.team_a_id = teams.id or match.team_b_id = teams.id)
	) or (select private.is_admin())
);

drop policy if exists matches_public_read on public.matches;
create policy matches_public_read on public.matches
for select to anon using (
	is_public and exists (
		select 1 from public.tournament_settings settings
		where settings.id = 1 and settings.is_public
	)
);
create policy matches_authenticated_read on public.matches
for select to authenticated using (
	(is_public and exists (
		select 1 from public.tournament_settings settings
		where settings.id = 1 and settings.is_public
	)) or (select private.is_admin())
);

drop policy if exists scores_public_read on public.match_scores;
create policy scores_public_read on public.match_scores
for select to anon using (
	exists (select 1 from public.matches match where match.id = match_scores.match_id and match.is_public)
);
create policy scores_authenticated_read on public.match_scores
for select to authenticated using (
	exists (select 1 from public.matches match where match.id = match_scores.match_id and match.is_public)
	or (select private.is_admin())
);

drop policy if exists vote_totals_public_read on public.match_vote_totals;
create policy vote_totals_public_read on public.match_vote_totals
for select to anon using (
	exists (select 1 from public.matches match where match.id = match_vote_totals.match_id and match.is_public)
);
create policy vote_totals_authenticated_read on public.match_vote_totals
for select to authenticated using (
	exists (select 1 from public.matches match where match.id = match_vote_totals.match_id and match.is_public)
	or (select private.is_admin())
);
