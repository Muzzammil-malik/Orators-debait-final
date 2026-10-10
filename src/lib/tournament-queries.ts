export const tournamentQueryKey = ["tournament", "snapshot"] as const;
export const adminTeamsQueryKey = ["tournament", "admin-teams"] as const;
export const adminProfileQueryKey = ["tournament", "admin-profile"] as const;
export const audienceVoteQueryKey = (matchId: string, userId: string) =>
  ["tournament", "audience-vote", matchId, userId] as const;
