import { useState } from "react";
import { Radio, Play, Pause, CheckCircle2, Zap, AlertTriangle } from "lucide-react";
import type { Match, ZoneNumber, MatchStatus } from "@/content/tournament";
import { ZONES_METADATA } from "@/content/tournament";

interface LiveControlProps {
  allMatches: Match[];
  activeMatch?: Match;
  onSelectMatch: (matchId: string) => void;
  onUpdateStatus: (
    matchId: string,
    status: MatchStatus,
    winnerTeamId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onSetZone: (matchId: string, zone: ZoneNumber) => Promise<{ success: boolean; error?: string }>;
  onToggleSwitch: (matchId: string) => Promise<{ success: boolean; error?: string }>;
}

export function LiveControl({
  allMatches,
  activeMatch,
  onSelectMatch,
  onUpdateStatus,
  onSetZone,
  onToggleSwitch,
}: LiveControlProps) {
  const [winnerSelection, setWinnerSelection] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [savingAction, setSavingAction] = useState(false);

  const runAction = async (action: () => Promise<{ success: boolean; error?: string }>) => {
    if (savingAction) return;
    setSavingAction(true);
    try {
      const result = await action();
      setActionError(result.success ? null : (result.error ?? "The match update failed."));
    } catch {
      setActionError("The match update failed. Check the connection and retry.");
    } finally {
      setSavingAction(false);
    }
  };

  if (!activeMatch) {
    return (
      <div className="border-2 border-line bg-surface p-8 text-center font-type text-mist/60">
        No matches available to control.
      </div>
    );
  }

  const teamA = activeMatch.teamA;
  const teamB = activeMatch.teamB;
  const isLive = activeMatch.status === "live";
  const isCompleted = activeMatch.status === "completed";
  const currentZoneInfo = ZONES_METADATA[activeMatch.zone];

  return (
    <div className="space-y-6">
      {actionError && (
        <p
          role="alert"
          className="border border-hot/60 bg-hot/10 px-4 py-2 font-mono text-xs text-hot"
        >
          {actionError}
        </p>
      )}
      {/* 1. MATCH SELECTOR STRIP */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-line bg-surface p-4">
        <div>
          <label
            htmlFor="match-picker"
            className="block font-type text-xs uppercase tracking-wider text-mist/70"
          >
            Select Target Match
          </label>
          <select
            id="match-picker"
            value={activeMatch.id}
            onChange={(e) => onSelectMatch(e.target.value)}
            className="mt-1 border-2 border-line bg-canvas px-3 py-2 font-mono text-sm font-bold text-paper focus:border-sun focus:outline-none"
          >
            {allMatches.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.status.toUpperCase()}] {m.roundLabel}: {m.teamA?.name ?? "TBD"} vs{" "}
                {m.teamB?.name ?? "TBD"} ({m.stageName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-type text-xs uppercase text-mist/70">Status:</span>
          {isLive ? (
            <span className="flex items-center gap-1.5 border border-hot bg-hot/20 px-3 py-1 font-type text-xs font-bold uppercase tracking-wider text-hot animate-pulse">
              <Radio size={13} /> LIVE IN ARENA
            </span>
          ) : isCompleted ? (
            <span className="flex items-center gap-1.5 border border-line bg-canvas px-3 py-1 font-type text-xs font-bold uppercase tracking-wider text-mist/70">
              <CheckCircle2 size={13} /> COMPLETED
            </span>
          ) : (
            <span className="border border-sun/50 bg-sun/10 px-3 py-1 font-type text-xs font-bold uppercase tracking-wider text-sun">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* 2. MATCH DISPLAY CARD */}
      <div className="border-4 border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]">
        {/* Match Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line pb-4">
          <div>
            <div className="flex items-center gap-2 font-type text-xs uppercase tracking-wider text-sun font-bold">
              <span>{activeMatch.stageName}</span>
              <span>·</span>
              <span>{activeMatch.court || "Main Stage"}</span>
            </div>
            <h2 className="display mt-1 text-3xl text-paper md:text-4xl">
              {activeMatch.roundLabel}
            </h2>
          </div>

          <div className="font-type text-xs text-mist/60 text-right">
            <div>Schedule: {activeMatch.scheduledTime || "Day 01"}</div>
            {activeMatch.completedTime && <div>Completed at: {activeMatch.completedTime}</div>}
          </div>
        </div>

        {/* Motion text */}
        <div className="my-4 border-l-4 border-hot bg-canvas p-4 font-serif text-base italic text-mist/90">
          &ldquo;{activeMatch.motion}&rdquo;
        </div>

        {/* Teams Head-to-Head */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Proposition (Team A) */}
          <div
            className={`border-2 p-5 ${
              activeMatch.winnerTeamId === teamA?.id
                ? "border-sun bg-sun/10"
                : "border-line bg-canvas"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="border border-sun/50 bg-sun/15 px-2 py-0.5 font-type text-[11px] font-bold uppercase tracking-wider text-sun">
                PROPOSITION
              </span>
              <span className="display text-4xl text-sun">{activeMatch.scoreA?.total ?? 0}</span>
            </div>
            <h3 className="display mt-2 text-2xl text-paper">{teamA?.name ?? "Slot Pending"}</h3>
            <div className="mt-1 font-type text-xs text-mist/60 uppercase">
              {teamA?.stream || "Department open"} · {teamA?.status || "registered"}
            </div>
          </div>

          {/* Opposition (Team B) */}
          <div
            className={`border-2 p-5 ${
              activeMatch.winnerTeamId === teamB?.id
                ? "border-hot bg-hot/10"
                : "border-line bg-canvas"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="border border-hot/50 bg-hot/15 px-2 py-0.5 font-type text-[11px] font-bold uppercase tracking-wider text-hot">
                OPPOSITION
              </span>
              <span className="display text-4xl text-hot">{activeMatch.scoreB?.total ?? 0}</span>
            </div>
            <h3 className="display mt-2 text-2xl text-paper">{teamB?.name ?? "Slot Pending"}</h3>
            <div className="mt-1 font-type text-xs text-mist/60 uppercase">
              {teamB?.stream || "Department open"} · {teamB?.status || "registered"}
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL ACTION CONTROLS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* State Transition Actions */}
        <div className="border-2 border-line bg-surface p-5 space-y-4">
          <h3 className="font-type text-xs font-bold uppercase tracking-wider text-sun">
            1. Match State Controls
          </h3>

          <div className="flex flex-wrap gap-3">
            {activeMatch.status === "upcoming" ? (
              <button
                type="button"
                disabled={savingAction}
                onClick={() => void runAction(() => onUpdateStatus(activeMatch.id, "live"))}
                className="flex items-center gap-2 border-2 border-hot bg-hot px-5 py-2.5 font-type text-xs font-bold uppercase tracking-wider text-paper shadow-[3px_3px_0_var(--line)] hover:bg-hot/90 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Play size={14} />
                <span>Set Live in Arena</span>
              </button>
            ) : isLive ? (
              <button
                type="button"
                disabled={savingAction}
                onClick={() => void runAction(() => onUpdateStatus(activeMatch.id, "upcoming"))}
                className="flex items-center gap-2 border-2 border-sun bg-sun px-5 py-2.5 font-type text-xs font-bold uppercase tracking-wider text-ink shadow-[3px_3px_0_var(--line)] hover:bg-sun/90 active:translate-x-0.5 active:translate-y-0.5"
              >
                <Pause size={14} />
                <span>Pause / Revert to Standby</span>
              </button>
            ) : null}

            <div className="flex w-full items-center gap-2 pt-2 border-t border-line">
              <select
                value={winnerSelection || activeMatch.winnerTeamId || ""}
                disabled={savingAction}
                onChange={(e) => setWinnerSelection(e.target.value)}
                className="flex-1 border-2 border-line bg-canvas px-3 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
              >
                <option value="">-- Choose Winner to Finalize --</option>
                {teamA && <option value={teamA.id}>Winner: {teamA.name} (Proposition)</option>}
                {teamB && <option value={teamB.id}>Winner: {teamB.name} (Opposition)</option>}
              </select>

              <button
                type="button"
                disabled={!winnerSelection && !activeMatch.winnerTeamId}
                onClick={() => {
                  const winner = winnerSelection || activeMatch.winnerTeamId;
                  if (winner) {
                    void runAction(() => onUpdateStatus(activeMatch.id, "completed", winner));
                  }
                }}
                className="flex items-center gap-1.5 border-2 border-line bg-canvas px-4 py-2 font-type text-xs uppercase tracking-wider text-paper hover:border-sun hover:text-sun disabled:opacity-40"
              >
                <CheckCircle2 size={13} />
                <span>Complete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Realtime Zone & Twist Controls */}
        <div className="border-2 border-line bg-surface p-5 space-y-4">
          <h3 className="font-type text-xs font-bold uppercase tracking-wider text-sun">
            2. Active Round &amp; Zone Progression
          </h3>

          <div>
            <div className="font-type text-xs text-mist/70 mb-2">
              Current: Zone 0{currentZoneInfo.number} · {currentZoneInfo.title} (
              {currentZoneInfo.subtitle})
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as ZoneNumber[]).map((z) => (
                <button
                  key={z}
                  type="button"
                  disabled={savingAction}
                  onClick={() => void runAction(() => onSetZone(activeMatch.id, z))}
                  className={`border-2 py-2 font-type text-xs uppercase tracking-wider transition-colors ${
                    activeMatch.zone === z
                      ? "border-sun bg-sun text-ink font-bold shadow-[2px_2px_0_var(--line)]"
                      : "border-line bg-canvas text-mist/70 hover:border-mist hover:text-mist"
                  }`}
                >
                  Zone 0{z}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-line flex items-center justify-between">
            <span className="font-type text-xs text-mist/80">Switch Round Twist:</span>
            <button
              type="button"
              disabled={savingAction}
              onClick={() => void runAction(() => onToggleSwitch(activeMatch.id))}
              className={`flex items-center gap-2 border-2 px-4 py-2 font-type text-xs uppercase font-bold tracking-wider transition-colors ${
                activeMatch.switchRoundTriggered
                  ? "border-hot bg-hot text-paper shadow-[3px_3px_0_var(--line)] animate-pulse"
                  : "border-line bg-canvas text-mist/60 hover:border-hot hover:text-hot"
              }`}
            >
              {activeMatch.switchRoundTriggered ? (
                <>
                  <AlertTriangle size={13} />
                  <span>BUZZER TRIGGERED (ACTIVE)</span>
                </>
              ) : (
                <>
                  <Zap size={13} />
                  <span>TRIGGER SWITCH BUZZER</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
