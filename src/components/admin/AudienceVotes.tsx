import { useState } from "react";
import { Users, Vote, CheckCircle, Ban, Clock } from "lucide-react";
import type { Match, VotingStatus } from "@/content/tournament";

interface AudienceVotesProps {
  allMatches: Match[];
  activeMatch?: Match | undefined;
  onSetVoting: (
    matchId: string,
    status: VotingStatus,
  ) => Promise<{ success: boolean; error?: string }>;
  onSelectMatch: (matchId: string) => void;
}

export function AudienceVotes({
  allMatches,
  activeMatch,
  onSetVoting,
  onSelectMatch,
}: AudienceVotesProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingMatchId, setSavingMatchId] = useState<string | null>(null);

  const updateVoting = async (matchId: string, status: VotingStatus) => {
    if (savingMatchId) return;
    setSavingMatchId(matchId);
    try {
      const result = await onSetVoting(matchId, status);
      setFeedback(result.success ? null : (result.error ?? "Voting state could not be updated."));
    } catch {
      setFeedback("Voting state could not be updated. Check the connection and retry.");
    } finally {
      setSavingMatchId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="border-2 border-line bg-surface p-4">
        <h2 className="display text-xl text-paper tracking-wide">
          AUDIENCE VOTING CONTROL <span className="text-sun">& ENGAGEMENT</span>
        </h2>
        <p className="mt-0.5 font-type text-xs uppercase tracking-wider text-mist/60">
          Live audience pulse, real-time percentages, and voting state toggles
        </p>
      </div>

      {feedback && (
        <p
          role="alert"
          className="border border-hot/60 bg-hot/10 px-4 py-2 font-mono text-xs text-hot"
        >
          {feedback}
        </p>
      )}

      {/* Active Match Voting Card */}
      {activeMatch && (
        <div className="border-2 border-sun bg-surface p-6 shadow-[4px_4px_0_rgba(255,214,0,0.25)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sun uppercase">
                  {activeMatch.roundLabel}
                </span>
                <span className="font-type text-xs uppercase text-mist/60">
                  {activeMatch.stageName}
                </span>
              </div>
              <h3 className="display mt-1 text-2xl text-paper">
                {activeMatch.teamA?.name ?? "Proposition"} vs{" "}
                {activeMatch.teamB?.name ?? "Opposition"}
              </h3>
            </div>

            {/* Voting Status and Action Toggles */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border border-line bg-canvas px-3 py-1 font-mono text-xs">
                <span className="text-mist/70">STATUS:</span>
                <span
                  className={`font-bold uppercase ${
                    activeMatch.votingStatus === "open"
                      ? "text-sun animate-pulse"
                      : activeMatch.votingStatus === "closed"
                        ? "text-mist/50"
                        : "text-hot"
                  }`}
                >
                  {activeMatch.votingStatus.toUpperCase()}
                </span>
              </div>

              {/* Status change buttons */}
              <button
                type="button"
                onClick={() => void updateVoting(activeMatch.id, "open")}
                disabled={activeMatch.votingStatus === "open" || savingMatchId !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-type text-xs uppercase tracking-wider transition-colors ${
                  activeMatch.votingStatus === "open"
                    ? "border border-sun/40 bg-sun/10 text-sun cursor-not-allowed opacity-60"
                    : "border-2 border-sun bg-sun text-canvas font-bold hover:bg-sun/90"
                }`}
              >
                <CheckCircle size={13} />
                <span>Open Voting</span>
              </button>

              <button
                type="button"
                onClick={() => void updateVoting(activeMatch.id, "closed")}
                disabled={activeMatch.votingStatus === "closed" || savingMatchId !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-type text-xs uppercase tracking-wider transition-colors ${
                  activeMatch.votingStatus === "closed"
                    ? "border border-line bg-surface-raised text-mist/40 cursor-not-allowed"
                    : "border border-line bg-surface-raised text-mist hover:border-hot hover:text-hot"
                }`}
              >
                <Ban size={13} />
                <span>Close Voting</span>
              </button>

              <button
                type="button"
                onClick={() => void updateVoting(activeMatch.id, "upcoming")}
                disabled={activeMatch.votingStatus === "upcoming" || savingMatchId !== null}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-type text-xs uppercase tracking-wider transition-colors ${
                  activeMatch.votingStatus === "upcoming"
                    ? "border border-line bg-surface-raised text-mist/40 cursor-not-allowed"
                    : "border border-line bg-canvas text-mist/70 hover:text-paper"
                }`}
              >
                <Clock size={13} />
                <span>Upcoming</span>
              </button>
            </div>
          </div>

          {/* Voting Gauge */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between font-mono text-sm">
              <div className="text-left">
                <span className="text-xs uppercase text-sun font-bold block">
                  {activeMatch.teamA?.name ?? "Proposition"}
                </span>
                <span className="text-2xl font-bold text-sun">{activeMatch.votes.teamA}%</span>
              </div>
              <div className="flex items-center gap-1 font-type text-xs uppercase text-mist/60">
                <Users size={14} className="text-sun" />
                <span>{activeMatch.votes.totalVotes} AUDIENCE VOTES CAST</span>
              </div>
              <div className="text-right">
                <span className="text-xs uppercase text-hot font-bold block">
                  {activeMatch.teamB?.name ?? "Opposition"}
                </span>
                <span className="text-2xl font-bold text-hot">{activeMatch.votes.teamB}%</span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="h-4 w-full overflow-hidden border border-line bg-canvas flex">
              <div
                className="h-full bg-sun transition-all duration-300"
                style={{ width: `${activeMatch.votes.teamA}%` }}
              />
              <div
                className="h-full bg-hot transition-all duration-300"
                style={{ width: `${activeMatch.votes.teamB}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* All Matches Voting Breakdown Table */}
      <div className="border-2 border-line bg-surface">
        <div className="border-b border-line px-4 py-3">
          <h3 className="display text-base text-paper tracking-wide">
            AUDIENCE VOTING ROSTER ACROSS MATCHES
          </h3>
        </div>

        <div className="divide-y divide-line/60">
          {allMatches.map((m) => (
            <div
              key={m.id}
              className={`flex flex-wrap items-center justify-between gap-4 p-4 transition-colors ${
                m.id === activeMatch?.id ? "bg-surface-raised" : "hover:bg-canvas/40"
              }`}
            >
              <div className="flex items-center gap-3 min-w-[200px]">
                <span className="font-mono text-xs font-bold text-sun">{m.roundLabel}</span>
                <span className="font-serif text-xs text-mist line-clamp-1 max-w-xs">
                  {m.teamA?.name ?? "TBD"} vs {m.teamB?.name ?? "TBD"}
                </span>
              </div>

              {/* Vote Stats */}
              <div className="flex items-center gap-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-sun font-bold">{m.votes.teamA}%</span>
                  <span className="text-mist/40">/</span>
                  <span className="text-hot font-bold">{m.votes.teamB}%</span>
                </div>
                <span className="text-mist/50">({m.votes.totalVotes} votes)</span>
                <span
                  className={`border px-2 py-0.5 text-[10px] uppercase font-bold ${
                    m.votingStatus === "open"
                      ? "border-sun bg-sun/15 text-sun"
                      : m.votingStatus === "closed"
                        ? "border-line bg-surface text-mist/40"
                        : "border-hot/40 bg-hot/10 text-hot"
                  }`}
                >
                  {m.votingStatus}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectMatch(m.id)}
                  className="border border-line bg-surface-raised px-2.5 py-1 font-type text-xs uppercase text-mist hover:border-sun hover:text-paper"
                >
                  Select Match
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void updateVoting(m.id, m.votingStatus === "open" ? "closed" : "open")
                  }
                  disabled={savingMatchId !== null}
                  className="border border-line bg-canvas px-2.5 py-1 font-type text-xs uppercase text-mist/80 hover:text-paper"
                >
                  {m.votingStatus === "open" ? "Close" : "Open"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
