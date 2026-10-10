import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, ChevronRight, Radio, CheckCircle2, Trash2 } from "lucide-react";
import type { Match, MatchRound, MatchStatus, Team } from "@/content/tournament";

interface MatchManagementProps {
  allMatches: Match[];
  teams: Team[];
  activeMatchId: string;
  onSelectMatch: (matchId: string) => void;
  onUpdateStatus: (
    matchId: string,
    status: MatchStatus,
    winnerTeamId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onAssignTeam: (
    matchId: string,
    side: "teamA" | "teamB",
    teamId: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
  onCreateMatch: (input: {
    round: MatchRound;
    roundLabel: string;
    stageName: string;
    teamAId: string;
    teamBId: string;
    court?: string;
    motion?: string;
    status?: MatchStatus;
  }) => Promise<{ success: boolean; error?: string }>;
  onDeleteMatch: (matchId: string) => Promise<{ success: boolean; error?: string }>;
}

export function MatchManagement({
  allMatches,
  teams,
  activeMatchId,
  onSelectMatch,
  onUpdateStatus,
  onAssignTeam,
  onCreateMatch,
  onDeleteMatch,
}: MatchManagementProps) {
  const [filterRound, setFilterRound] = useState<"all" | MatchRound>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [newMatch, setNewMatch] = useState({
    round: "preliminary" as MatchRound,
    teamAId: "",
    teamBId: "",
    roundLabel: "Prelim 01",
    stageName: "Preliminaries · Match 01",
    court: "",
    motion: "",
  });

  const preliminaries = useMemo(
    () => allMatches.filter((match) => match.round === "preliminary"),
    [allMatches],
  );
  const semiFinals = useMemo(
    () => allMatches.filter((match) => match.round === "semifinal"),
    [allMatches],
  );
  const finalMatches = useMemo(
    () => allMatches.filter((match) => match.round === "final"),
    [allMatches],
  );
  const filteredMatches = useMemo(
    () =>
      allMatches.filter((match) => {
        const roundMatch = filterRound === "all" || match.round === filterRound;
        const statusMatch = statusFilter === "all" || match.status === statusFilter;
        return roundMatch && statusMatch;
      }),
    [allMatches, filterRound, statusFilter],
  );

  const runMutation = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await action();
      setFeedback(result.success ? null : (result.error ?? "The match update failed."));
    } catch {
      setFeedback("The match update failed. Check the connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!newMatch.teamAId || !newMatch.teamBId || newMatch.teamAId === newMatch.teamBId) {
      setFeedback("Choose two different teams before creating a match.");
      return;
    }
    const result = await onCreateMatch({
      round: newMatch.round,
      roundLabel: newMatch.roundLabel,
      stageName: newMatch.stageName,
      teamAId: newMatch.teamAId,
      teamBId: newMatch.teamBId,
      court: newMatch.court || undefined,
      motion: newMatch.motion || undefined,
      status: "upcoming",
    });
    setFeedback(
      result.success
        ? "Match created and saved to the tournament feed."
        : (result.error ?? "Match creation failed."),
    );
    if (result.success) {
      setShowCreateForm(false);
      setNewMatch({
        round: "preliminary",
        teamAId: "",
        teamBId: "",
        roundLabel: "Prelim 01",
        stageName: "Preliminaries · Match 01",
        court: "",
        motion: "",
      });
    }
  };

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    const result = await onDeleteMatch(matchToDelete.id);
    setDeleteError(result.success ? null : result.error ?? "The match could not be removed.");
    if (result.success) {
      setMatchToDelete(null);
      setFeedback("Match removed from the tournament feed.");
    }
  };

  const statusBadge = (status: MatchStatus) => {
    if (status === "live") {
      return (
        <span className="flex items-center gap-1 border border-sun bg-sun/15 px-2 py-0.5 font-type text-[10px] font-bold uppercase text-sun">
          <Radio size={11} /> Live now
        </span>
      );
    }
    if (status === "completed") {
      return (
        <span className="flex items-center gap-1 border border-line bg-surface-raised px-2 py-0.5 font-type text-[10px] uppercase text-mist/70">
          <CheckCircle2 size={11} className="text-sun" /> Completed
        </span>
      );
    }
    return (
      <span className="border border-line bg-canvas px-2 py-0.5 font-type text-[10px] uppercase text-mist/50">
        Upcoming
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-line bg-surface p-4">
        <div>
          <h2 className="display text-xl tracking-wide text-paper">
            MATCH MANAGEMENT <span className="text-sun">({allMatches.length} TOTAL)</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreateForm((current) => !current)}
            className="border border-sun bg-sun px-3 py-1.5 font-type text-xs font-bold uppercase tracking-wider text-canvas"
          >
            {showCreateForm ? "Close" : "Add Match"}
          </button>
          {allMatches.length > 0 && (
            <div className="flex items-center gap-1 border border-line bg-canvas p-1">
              {(
                [
                  ["all", `All (${allMatches.length})`],
                  ["preliminary", `Prelims (${preliminaries.length})`],
                  ["semifinal", `Semifinals (${semiFinals.length})`],
                  ["final", `Final (${finalMatches.length})`],
                ] as const
              ).map(([round, label]) => (
                <button
                  key={round}
                  type="button"
                  onClick={() => setFilterRound(round)}
                  className={`px-3 py-1 font-type text-xs uppercase ${filterRound === round ? "bg-sun font-bold text-canvas" : "text-mist/70 hover:text-paper"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className="space-y-4 border-2 border-line bg-surface p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
              Match round
              <select
                aria-label="Match round"
                value={newMatch.round}
                onChange={(event) => {
                  const nextRound = event.target.value as MatchRound;
                  setNewMatch((current) => ({
                    ...current,
                    round: nextRound,
                    roundLabel:
                      nextRound === "preliminary"
                        ? `Prelim ${String(allMatches.filter((match) => match.round === "preliminary").length + 1).padStart(2, "0")}`
                        : nextRound === "semifinal"
                          ? `Semifinal ${String(allMatches.filter((match) => match.round === "semifinal").length + 1).padStart(2, "0")}`
                          : "Grand Final",
                    stageName:
                      nextRound === "preliminary"
                        ? `Preliminaries · Match ${String(allMatches.filter((match) => match.round === "preliminary").length + 1).padStart(2, "0")}`
                        : nextRound === "semifinal"
                          ? `Final Four · Match ${String(allMatches.filter((match) => match.round === "semifinal").length + 1).padStart(2, "0")}`
                          : "Championship Debate",
                  }));
                }}
                className="border border-line bg-canvas px-2 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              >
                <option value="preliminary">Preliminary</option>
                <option value="semifinal">Semifinal</option>
                <option value="final">Final</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
              Team A
              <select
                aria-label="Team A"
                value={newMatch.teamAId}
                onChange={(event) =>
                  setNewMatch((current) => ({ ...current, teamAId: event.target.value }))
                }
                className="border border-line bg-canvas px-2 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              >
                <option value="">Choose team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
              Team B
              <select
                aria-label="Team B"
                value={newMatch.teamBId}
                onChange={(event) =>
                  setNewMatch((current) => ({ ...current, teamBId: event.target.value }))
                }
                className="border border-line bg-canvas px-2 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              >
                <option value="">Choose team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
              Stage name
              <input
                aria-label="Stage name"
                value={newMatch.stageName}
                onChange={(event) =>
                  setNewMatch((current) => ({ ...current, stageName: event.target.value }))
                }
                className="border border-line bg-canvas px-2 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
              Court
              <input
                aria-label="Court"
                value={newMatch.court}
                onChange={(event) =>
                  setNewMatch((current) => ({ ...current, court: event.target.value }))
                }
                className="border border-line bg-canvas px-2 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1">
              <label className="flex flex-col gap-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
                Motion
                <input
                  aria-label="Motion"
                  value={newMatch.motion}
                  onChange={(event) =>
                    setNewMatch((current) => ({ ...current, motion: event.target.value }))
                  }
                  className="border border-line bg-canvas px-2 py-2 font-serif text-xs text-paper focus:border-sun focus:outline-none"
                  placeholder="Optional motion"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleCreateMatch}
              className="border border-sun bg-sun px-4 py-2 font-type text-xs font-bold uppercase tracking-wider text-canvas"
            >
              Save Match
            </button>
          </div>
        </div>
      )}

      {allMatches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-line bg-canvas p-2">
          <label className="font-type text-[10px] uppercase tracking-wider text-mist/70">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "all" | MatchStatus)}
            className="border border-line bg-surface px-2 py-1 font-mono text-xs text-paper"
          >
            <option value="all">All statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="live">Live</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {feedback && (
        <p
          role="alert"
          className="border border-hot/60 bg-hot/10 px-4 py-2 font-mono text-xs text-hot"
        >
          {feedback}
        </p>
      )}

      <div className="space-y-3">
        {allMatches.length === 0 ? (
          <p
            role="status"
            className="border border-line bg-surface px-4 py-8 text-center font-type text-xs uppercase tracking-wider text-mist/60"
          >
            No matches yet
          </p>
        ) : filteredMatches.length === 0 ? (
          <p className="border border-line bg-surface px-4 py-8 text-center font-type text-xs uppercase tracking-wider text-mist/60">
            No matches match these filters
          </p>
        ) : (
          filteredMatches.map((match) => {
          const selected = match.id === activeMatchId;
          return (
            <article
              key={match.id}
              className={`space-y-3 border-2 p-4 ${selected ? "border-sun bg-surface-raised" : "border-line bg-surface hover:border-mist/40"}`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-[220px]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase text-sun">
                      {match.roundLabel}
                    </span>
                    {statusBadge(match.status)}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 font-type text-xs text-mist/60">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {match.scheduledTime || "Schedule TBD"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {match.court || "Stage TBD"}
                    </span>
                  </div>
                  {match.motion && (
                    <p className="mt-1.5 line-clamp-1 max-w-md font-serif text-xs italic text-mist/80">
                      &ldquo;{match.motion}&rdquo;
                    </p>
                  )}
                </div>

                <div className="grid flex-1 grid-cols-2 gap-3 lg:px-5">
                  {(["teamA", "teamB"] as const).map((side) => {
                    const team = match[side];
                    const score = side === "teamA" ? match.scoreA?.total : match.scoreB?.total;
                    const winner = match.winnerTeamId === team?.id;
                    return (
                      <div
                        key={side}
                        className={`border p-2 ${winner ? "border-sun/60 bg-sun/10" : "border-line/60 bg-canvas"}`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-type text-[10px] font-bold uppercase ${side === "teamA" ? "text-sun" : "text-hot"}`}
                          >
                            {side === "teamA" ? "Proposition" : "Opposition"}
                          </span>
                          <span className="font-mono text-sm font-bold text-paper">
                            {score ?? "—"}
                          </span>
                        </div>
                        <div className="mt-0.5 truncate font-mono text-xs text-mist">
                          {team?.name ?? "TBD"}
                        </div>
                        {winner && (
                          <span className="mt-1 inline-block text-[9px] font-bold uppercase text-sun">
                            Winner
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-line/60 pt-3 lg:border-0 lg:pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectMatch(match.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-type text-xs uppercase ${selected ? "border-2 border-sun bg-sun font-bold text-canvas" : "border border-line bg-surface-raised text-mist hover:border-sun hover:text-paper"}`}
                  >
                    {selected ? "Active Target" : "Select Match"}
                    <ChevronRight size={13} />
                  </button>
                  {match.status === "upcoming" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void runMutation(() => onUpdateStatus(match.id, "live"))}
                      className="border border-sun/60 bg-sun/10 px-2.5 py-1.5 font-type text-xs uppercase text-sun hover:bg-sun hover:text-canvas disabled:opacity-50"
                    >
                      Set Live
                    </button>
                  )}
                  {match.status === "live" && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void runMutation(() => onUpdateStatus(match.id, "upcoming"))}
                      className="border border-line bg-surface-raised px-2.5 py-1.5 font-type text-xs uppercase text-mist hover:text-paper disabled:opacity-50"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setMatchToDelete(match);
                      setDeleteError(null);
                    }}
                    className="flex items-center gap-1.5 border border-hot/60 bg-hot/10 px-2.5 py-1.5 font-type text-xs uppercase text-hot hover:bg-hot hover:text-canvas disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                    Remove Match
                  </button>
                </div>
              </div>

              {match.status === "upcoming" && (
                <div className="grid gap-2 border-t border-line/60 pt-3 md:grid-cols-2">
                  {(["teamA", "teamB"] as const).map((side) => {
                    const current = match[side];
                    const opposite = side === "teamA" ? match.teamB?.id : match.teamA?.id;
                    return (
                      <label
                        key={side}
                        className="flex min-w-0 items-center gap-2 font-type text-[10px] uppercase text-mist/60"
                      >
                        {side === "teamA" ? "Proposition" : "Opposition"}
                        <select
                          aria-label={`${match.roundLabel} ${side === "teamA" ? "proposition" : "opposition"} team`}
                          value={current?.id ?? ""}
                          disabled={saving}
                          onChange={(event) =>
                            void runMutation(() =>
                              onAssignTeam(match.id, side, event.target.value || null),
                            )
                          }
                          className="min-w-0 flex-1 border border-line bg-canvas px-2 py-1.5 font-mono text-xs normal-case text-paper focus:border-sun focus:outline-none disabled:opacity-60"
                        >
                          <option value="">Unassigned</option>
                          {teams
                            .filter((team) => team.id === current?.id || team.id !== opposite)
                            .map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
              )}
            </article>
          );
        })
        )}
      </div>

      {matchToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/85 p-4"
          role="presentation"
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-match-title"
            aria-describedby="delete-match-description"
            className="w-full max-w-md border-2 border-hot bg-surface p-5 shadow-[6px_6px_0_rgba(216,27,114,0.25)]"
          >
            <h3 id="delete-match-title" className="display text-xl text-paper">
              Remove {matchToDelete.roundLabel}?
            </h3>
            <p id="delete-match-description" className="mt-3 font-serif text-sm text-mist/80">
              This permanently deletes the match and its scores, audience votes, and vote totals
              from the database. The public bracket and results will no longer show it.
            </p>
            {deleteError && (
              <p role="alert" className="mt-3 font-mono text-xs text-hot">
                {deleteError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                autoFocus
                type="button"
                disabled={saving}
                onClick={() => {
                  setMatchToDelete(null);
                  setDeleteError(null);
                }}
                className="border border-line px-4 py-2 font-type text-xs uppercase text-mist hover:text-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void confirmDeleteMatch()}
                className="border-2 border-hot bg-hot px-4 py-2 font-type text-xs font-bold uppercase text-paper hover:bg-hot/90"
              >
                {saving ? "Removing…" : "Confirm Remove"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
