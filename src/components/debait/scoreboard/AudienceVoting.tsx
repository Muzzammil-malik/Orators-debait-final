import { useState } from "react";
import type { Match, UserVote } from "@/content/tournament";

interface AudienceVotingProps {
  match?: Match;
  userVote?: UserVote;
  onCastVote: (matchId: string, teamId: string) => Promise<{ success: boolean; error?: string }>;
}

export function AudienceVoting({ match, userVote, onCastVote }: AudienceVotingProps) {
  const [submitting, setSubmitting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);

  // If no match selected or match is not live/closed
  const hasMatch = !!match;
  const isVotingOpen = match?.votingStatus === "open" && match?.status === "live";
  const isVotingClosed = match?.votingStatus === "closed" || match?.status === "completed";
  const teamA = match?.teamA;
  const teamB = match?.teamB;

  const hasVoted = !!userVote && userVote.matchId === match?.id;
  const votedTeamA = hasVoted && userVote?.teamId === teamA?.id;
  const votedTeamB = hasVoted && userVote?.teamId === teamB?.id;

  const votesA = match?.votes.teamA ?? 50;
  const votesB = match?.votes.teamB ?? 50;
  const totalVotes = match?.votes.totalVotes ?? 0;

  const handleVote = async (teamId: string) => {
    if (!match || !teamId || hasVoted || submitting) return;
    setSubmitting(true);
    setVoteError(null);
    try {
      const result = await onCastVote(match.id, teamId);
      if (!result.success) setVoteError(result.error ?? "Your ballot could not be recorded.");
    } catch {
      setVoteError("Your ballot could not be recorded. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="voting" className="py-12" aria-label="Audience Voting">
      <div className="border-4 border-ink bg-sun p-6 md:p-10 shadow-[8px_8px_0_var(--ink)]">
        {/* Top Disclaimer / Clear Separation Alert */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-ink px-2.5 py-1 font-type text-xs font-bold uppercase tracking-wider !text-white">
              AUDIENCE PULSE
            </span>
            <span className="font-type text-xs uppercase tracking-widest text-ink">
              CROWD OPINION POLL
            </span>
          </div>

          <div className="border border-ink bg-paper px-3 py-1 font-type text-xs !text-white shadow-[2px_2px_0_var(--ink)]">
            ⚠️ <strong>NOTE:</strong> Official judge scoring (Content / Strategy / Style) is
            independent and does not alter based on audience polling.
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-8">
          <h2 className="display text-4xl text-ink md:text-6xl">
            Who do you think <span className="text-hot">should win?</span>
          </h2>
          <p className="mt-2 font-serif text-lg text-ink/80 max-w-2xl">
            Cast your instant vote for the team with the sharper reasoning and commanding floor
            presence. The audience vote reveals real-time room sentiment as arguments unfold.
          </p>
        </div>

        {/* MATCH ACTIVE & VOTING OPEN */}
        {hasMatch && isVotingOpen && (
          <div className="space-y-8">
            {voteError && (
              <p
                role="alert"
                className="border-2 border-ink bg-paper px-4 py-3 font-type text-sm text-hot"
              >
                {voteError}
              </p>
            )}
            {/* Match info pill */}
            <div className="flex flex-wrap items-center gap-3 font-type text-xs text-ink">
              <span className="border border-ink bg-paper px-2 py-0.5 font-bold !text-paper">
                {match.roundLabel}
              </span>
              <span className="italic truncate max-w-md">&ldquo;{match.motion}&rdquo;</span>
            </div>

            {/* Voting Action or Result View */}
            {!hasVoted ? (
              /* State: BEFORE VOTING */
              <div>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Button for Team A */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => teamA && handleVote(teamA.id)}
                    className="group relative flex flex-col items-center justify-center border-3 border-ink bg-paper p-8 text-center transition-all shadow-[6px_6px_0_var(--ink)] hover:-translate-y-1 hover:shadow-[9px_9px_0_var(--ink)] active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)]"
                  >
                    <span className="font-type text-xs uppercase tracking-widest !text-paper">
                      PROPOSITION
                    </span>
                    <span className="display mt-2 text-4xl !text-paper group-hover:text-hot md:text-5xl">
                      {teamA?.name || "Team A"}
                    </span>
                    {teamA?.stream && (
                      <span className="mt-1 font-type text-xs !text-paper uppercase">
                        {teamA.stream}
                      </span>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 border-2 border-ink bg-hot px-6 py-2.5 font-type text-sm font-bold uppercase tracking-wider !text-paper shadow-[2px_2px_0_var(--ink)] group-hover:bg-ink group-hover:text-sun">
                      <span className="!text-paper">VOTE {teamA?.name || "TEAM A"}</span>
                      <span className="!text-paper">→</span>
                    </span>
                  </button>

                  {/* Button for Team B */}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => teamB && handleVote(teamB.id)}
                    className="group relative flex flex-col items-center justify-center border-3 border-ink bg-paper p-8 text-center transition-all shadow-[6px_6px_0_var(--ink)] hover:-translate-y-1 hover:shadow-[9px_9px_0_var(--ink)] active:translate-y-1 active:shadow-[2px_2px_0_var(--ink)]"
                  >
                    <span className="font-type text-xs uppercase tracking-widest !text-paper">
                      OPPOSITION
                    </span>
                    <span className="display mt-2 text-4xl !text-paper group-hover:text-hot md:text-5xl">
                      {teamB?.name || "Team B"}
                    </span>
                    {teamB?.stream && (
                      <span className="mt-1 font-type text-xs !text-paper uppercase">
                        {teamB.stream}
                      </span>
                    )}
                    <span className="mt-6 inline-flex items-center gap-2 border-2 border-ink bg-hot px-6 py-2.5 font-type text-sm font-bold uppercase tracking-wider !text-paper shadow-[2px_2px_0_var(--ink)] group-hover:bg-ink group-hover:text-sun">
                      <span className="!text-paper">VOTE {teamB?.name || "TEAM B"}</span>
                      <span className="!text-paper">→</span>
                    </span>
                  </button>
                </div>

                <div className="mt-4 text-center font-type text-xs text-ink/70">
                  Select a team to register your ballot. Votes are locked to one per session.
                </div>
              </div>
            ) : (
              /* State: AFTER USER VOTES */
              <div className="border-3 border-ink bg-paper p-6 md:p-8 shadow-[6px_6px_0_var(--ink)]">
                {/* Voted Confirmation Badge */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hot text-xs text-paper font-bold">
                      ✓
                    </span>
                    <span className="font-type text-sm font-bold uppercase tracking-wider !text-paper">
                      YOUR BALLOT IS RECORDED:{" "}
                      <span className="text-hot font-bold">
                        {votedTeamA ? teamA?.name : teamB?.name}
                      </span>
                    </span>
                  </div>
                  <div className="font-type text-xs !text-paper">
                    Ballot ID: #{userVote?.timestamp.toString().slice(-6)}
                  </div>
                </div>

                {/* Vote Distribution Bar */}
                <div className="space-y-4">
                  <div className="flex items-end justify-between font-type">
                    <div>
                      <span className="text-xs uppercase !text-paper">
                        {teamA?.name} (Proposition)
                      </span>
                      <div className="display text-4xl !text-paper">{votesA}%</div>
                    </div>
                    <div className="text-center text-xs uppercase tracking-widest text-stone">
                      <span>{totalVotes} TOTAL AUDIENCE VOTES</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase !text-paper">
                        {teamB?.name} (Opposition)
                      </span>
                      <div className="display text-4xl !text-paper">{votesB}%</div>
                    </div>
                  </div>

                  {/* Dual-color Bar with smooth transition */}
                  <div className="relative flex h-8 overflow-hidden border-3 border-ink bg-ivory shadow-[3px_3px_0_var(--ink)]">
                    <div
                      className="flex items-center justify-start bg-sun px-3 font-type text-xs font-bold text-ink transition-all duration-700 ease-out"
                      style={{ width: `${votesA}%` }}
                    >
                      {votesA > 15 && `${votesA}%`}
                    </div>
                    <div className="w-1 bg-ink" />
                    <div
                      className="flex items-center justify-end bg-hot px-3 font-type text-xs font-bold text-paper transition-all duration-700 ease-out"
                      style={{ width: `${votesB}%` }}
                    >
                      {votesB > 15 && `${votesB}%`}
                    </div>
                  </div>

                  <div className="flex justify-between font-type text-xs !text-paper">
                    <span>{votedTeamA ? "★ You voted for this side" : ""}</span>
                    <span>{votedTeamB ? "★ You voted for this side" : ""}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* State: VOTING CLOSED */}
        {hasMatch && isVotingClosed && (
          <div className="border-3 border-ink bg-paper p-8 shadow-[6px_6px_0_var(--ink)]">
            <div className="mb-4 inline-block bg-ink px-3 py-1 font-type text-xs font-bold uppercase tracking-wider !text-white">
              AUDIENCE VOTING CLOSED FOR THIS MATCH
            </div>
            <h3 className="display text-3xl !text-paper md:text-4xl">
              Final Audience Sentiment Result
            </h3>
            <p className="mt-1 font-serif !text-paper text-sm">
              Voting has concluded for {match.roundLabel}. Below is the final audience distribution
              recorded before closing statements.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between gap-4 font-type text-base font-bold text-white">
                {/* The scoreboard theme can force dark text on this final-result card; keep the
                    rendered labels/percentages explicitly white for the closed-voting state. */}
                <span
                  className="text-white"
                  style={{ color: "#FFFFFF", opacity: 1, fontWeight: 800 }}
                >
                  {teamA?.name}: {votesA}%
                </span>
                <span
                  className="text-white"
                  style={{ color: "#FFFFFF", opacity: 1, fontWeight: 800 }}
                >
                  {teamB?.name}: {votesB}%
                </span>
              </div>
              <div className="flex h-6 overflow-hidden border-2 border-ink">
                <div className="bg-sun" style={{ width: `${votesA}%` }} />
                <div className="w-0.5 bg-ink" />
                <div className="bg-hot" style={{ width: `${votesB}%` }} />
              </div>
              <div
                className="text-right font-type text-sm font-semibold text-white"
                style={{ color: "#FFFFFF", opacity: 1 }}
              >
                Total ballots cast: {totalVotes}
              </div>
            </div>
          </div>
        )}

        {/* State: NO ACTIVE MATCH */}
        {(!hasMatch || (!isVotingOpen && !isVotingClosed)) && (
          <div className="border-2 border-dashed border-ink/40 bg-paper/60 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-paper text-xl !text-paper shadow-[2px_2px_0_var(--ink)]">
              🗳️
            </div>
            <h3 className="display mt-4 text-3xl !text-paper">AUDIENCE VOTING STANDBY</h3>
            <p className="mx-auto mt-2 max-w-lg font-serif text-base !text-paper">
              Voting becomes active on this screen the moment a match transitions to the floor.
              Audience members will be invited to cast ballots from their mobile devices during Zone
              02 Open Crossfire.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
