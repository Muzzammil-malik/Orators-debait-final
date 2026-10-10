import { useState, useEffect } from "react";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";
import type { Match, MatchStatus, ScoreBreakdown } from "@/content/tournament";

interface ScoreEntryProps {
  activeMatch?: Match | undefined;
  onSaveScores: (
    matchId: string,
    scoreA: ScoreBreakdown,
    scoreB: ScoreBreakdown,
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus?: (
    matchId: string,
    status: MatchStatus,
    winnerTeamId?: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

type ScoreErrors = { content: string | null; strategy: string | null; style: string | null };

export function ScoreEntry({ activeMatch, onSaveScores, onUpdateStatus }: ScoreEntryProps) {
  // Score state for Team A (Proposition)
  const [contentA, setContentA] = useState<string>("0");
  const [strategyA, setStrategyA] = useState<string>("0");
  const [styleA, setStyleA] = useState<string>("0");

  // Score state for Team B (Opposition)
  const [contentB, setContentB] = useState<string>("0");
  const [strategyB, setStrategyB] = useState<string>("0");
  const [styleB, setStyleB] = useState<string>("0");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [winnerSelection, setWinnerSelection] = useState<string>("");

  // Sync state when activeMatch changes
  useEffect(() => {
    if (activeMatch) {
      setContentA(String(activeMatch.scoreA?.content ?? 0));
      setStrategyA(String(activeMatch.scoreA?.strategy ?? 0));
      setStyleA(String(activeMatch.scoreA?.style ?? 0));

      setContentB(String(activeMatch.scoreB?.content ?? 0));
      setStrategyB(String(activeMatch.scoreB?.strategy ?? 0));
      setStyleB(String(activeMatch.scoreB?.style ?? 0));
      setWinnerSelection(activeMatch.winnerTeamId ?? "");
      setFeedback(null);
    }
  }, [activeMatch]);

  if (!activeMatch) {
    return (
      <div className="border-2 border-line bg-surface p-8 text-center font-type text-mist/60">
        Select a match to enter official judge marks.
      </div>
    );
  }

  // Parse numbers
  const numContentA = parseFloat(contentA) || 0;
  const numStrategyA = parseFloat(strategyA) || 0;
  const numStyleA = parseFloat(styleA) || 0;
  const totalA = numContentA + numStrategyA + numStyleA;

  const numContentB = parseFloat(contentB) || 0;
  const numStrategyB = parseFloat(strategyB) || 0;
  const numStyleB = parseFloat(styleB) || 0;
  const totalB = numContentB + numStrategyB + numStyleB;

  // Real-time field validation errors
  const errorsA: ScoreErrors = {
    content:
      isNaN(numContentA) || numContentA < 0 || numContentA > 40
        ? "Content must be between 0 and 40"
        : null,
    strategy:
      isNaN(numStrategyA) || numStrategyA < 0 || numStrategyA > 30
        ? "Strategy must be between 0 and 30"
        : null,
    style:
      isNaN(numStyleA) || numStyleA < 0 || numStyleA > 30 ? "Style must be between 0 and 30" : null,
  };

  const errorsB: ScoreErrors = {
    content:
      isNaN(numContentB) || numContentB < 0 || numContentB > 40
        ? "Content must be between 0 and 40"
        : null,
    strategy:
      isNaN(numStrategyB) || numStrategyB < 0 || numStrategyB > 30
        ? "Strategy must be between 0 and 30"
        : null,
    style:
      isNaN(numStyleB) || numStyleB < 0 || numStyleB > 30 ? "Style must be between 0 and 30" : null,
  };

  const hasErrors =
    Boolean(errorsA.content || errorsA.strategy || errorsA.style) ||
    Boolean(errorsB.content || errorsB.strategy || errorsB.style);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasErrors) {
      setFeedback({
        type: "error",
        message: "Please correct input errors before submitting judge marks.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await onSaveScores(
        activeMatch.id,
        {
          content: numContentA,
          strategy: numStrategyA,
          style: numStyleA,
          total: totalA,
        },
        {
          content: numContentB,
          strategy: numStrategyB,
          style: numStyleB,
          total: totalB,
        },
      );

      if (!res.success) {
        setFeedback({
          type: "error",
          message: res.error || "Failed to update scores. Please verify rubric parameters.",
        });
        return;
      }

      const selectedWinner = winnerSelection || activeMatch.winnerTeamId;
      if (onUpdateStatus && selectedWinner) {
        const winnerResult = await onUpdateStatus(activeMatch.id, "completed", selectedWinner);
        if (!winnerResult.success) {
          setFeedback({
            type: "error",
            message:
              winnerResult.error ||
              "Scores were saved but the official winner could not be stored.",
          });
          return;
        }
      }

      setFeedback({
        type: "success",
        message: `Official marks for ${activeMatch.roundLabel} successfully recorded and synced.`,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Scores could not be saved. Check the connection and retry.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-4 border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-line pb-4">
        <div>
          <div className="flex items-center gap-2 font-type text-xs uppercase tracking-widest text-sun font-bold">
            <span>OFFICIAL JUDGE MARKS</span>
            <span>·</span>
            <span>100-POINT SYSTEM</span>
          </div>
          <h2 className="display mt-1 text-3xl text-paper md:text-4xl">
            {activeMatch.roundLabel} Score Entry
          </h2>
          <p className="mt-1 font-serif text-xs text-mist/70 italic">
            Rubric: Content (40) + Strategy (30) + Style (30) = Total (100)
          </p>
        </div>

        <div className="border border-line bg-canvas px-4 py-2 font-type text-xs uppercase text-mist/80">
          Match: <span className="font-bold text-paper">{activeMatch.roundLabel}</span> (
          {activeMatch.status.toUpperCase()})
        </div>
      </div>

      {feedback && (
        <div
          className={`mt-5 flex items-center gap-2 border p-3 font-type text-xs ${
            feedback.type === "success"
              ? "border-sun bg-sun/15 text-sun"
              : "border-destructive bg-destructive/15 text-paper"
          }`}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Score entry columns */}
      <form onSubmit={handleSave} className="mt-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Proposition Card */}
          <div className="border-2 border-sun/60 bg-canvas p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="border border-sun/40 bg-sun/10 px-2 py-0.5 font-type text-[10px] font-bold uppercase tracking-wider text-sun">
                  PROPOSITION
                </span>
                <h3 className="display mt-1 text-2xl text-paper">
                  {activeMatch.teamA?.name ?? "Team A"}
                </h3>
              </div>
              <div className="text-right">
                <span className="font-type text-[10px] uppercase text-mist/60">Total Score</span>
                <div className="display text-4xl text-sun">{totalA} / 100</div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Content (Max 40)</span>
                  <span className="text-sun font-bold">{numContentA} / 40</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="1"
                  value={contentA}
                  onChange={(e) => setContentA(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsA.content ? "border-destructive" : "border-line focus:border-sun"
                  }`}
                />
                {errorsA.content && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsA.content}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Strategy &amp; Rebuttal (Max 30)</span>
                  <span className="text-sun font-bold">{numStrategyA} / 30</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={strategyA}
                  onChange={(e) => setStrategyA(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsA.strategy ? "border-destructive" : "border-line focus:border-sun"
                  }`}
                />
                {errorsA.strategy && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsA.strategy}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Style &amp; Delivery (Max 30)</span>
                  <span className="text-sun font-bold">{numStyleA} / 30</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={styleA}
                  onChange={(e) => setStyleA(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsA.style ? "border-destructive" : "border-line focus:border-sun"
                  }`}
                />
                {errorsA.style && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsA.style}</p>
                )}
              </div>
            </div>
          </div>

          {/* Opposition Card */}
          <div className="border-2 border-hot/60 bg-canvas p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="border border-hot/40 bg-hot/10 px-2 py-0.5 font-type text-[10px] font-bold uppercase tracking-wider text-hot">
                  OPPOSITION
                </span>
                <h3 className="display mt-1 text-2xl text-paper">
                  {activeMatch.teamB?.name ?? "Team B"}
                </h3>
              </div>
              <div className="text-right">
                <span className="font-type text-[10px] uppercase text-mist/60">Total Score</span>
                <div className="display text-4xl text-hot">{totalB} / 100</div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Content (Max 40)</span>
                  <span className="text-hot font-bold">{numContentB} / 40</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="1"
                  value={contentB}
                  onChange={(e) => setContentB(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsB.content ? "border-destructive" : "border-line focus:border-hot"
                  }`}
                />
                {errorsB.content && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsB.content}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Strategy &amp; Rebuttal (Max 30)</span>
                  <span className="text-hot font-bold">{numStrategyB} / 30</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={strategyB}
                  onChange={(e) => setStrategyB(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsB.strategy ? "border-destructive" : "border-line focus:border-hot"
                  }`}
                />
                {errorsB.strategy && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsB.strategy}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between font-type text-xs text-mist/80 mb-1">
                  <span>Style &amp; Delivery (Max 30)</span>
                  <span className="text-hot font-bold">{numStyleB} / 30</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="1"
                  value={styleB}
                  onChange={(e) => setStyleB(e.target.value)}
                  className={`w-full border-2 bg-surface px-3 py-2 font-mono text-sm text-paper focus:outline-none ${
                    errorsB.style ? "border-destructive" : "border-line focus:border-hot"
                  }`}
                />
                {errorsB.style && (
                  <p className="mt-1 font-type text-[10px] text-destructive">{errorsB.style}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t-2 border-line pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-type text-[10px] uppercase tracking-wider text-mist/70">
                Official winner
              </div>
              <div className="mt-1 font-serif text-sm italic text-mist/80">
                Select the team that advances or closes the round.
              </div>
            </div>
            <select
              aria-label="Official winner"
              value={winnerSelection || activeMatch.winnerTeamId || ""}
              onChange={(e) => setWinnerSelection(e.target.value)}
              className="border-2 border-line bg-canvas px-3 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
            >
              <option value="">-- Choose final winner --</option>
              {activeMatch.teamA && (
                <option value={activeMatch.teamA.id}>Winner: {activeMatch.teamA.name}</option>
              )}
              {activeMatch.teamB && (
                <option value={activeMatch.teamB.id}>Winner: {activeMatch.teamB.name}</option>
              )}
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t-2 border-line pt-4">
          <button
            type="submit"
            disabled={hasErrors || saving}
            className="flex items-center gap-2 border-2 border-sun bg-sun px-6 py-3 font-type text-xs font-bold uppercase tracking-wider text-ink shadow-[4px_4px_0_var(--line)] hover:bg-sun/90 active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50 transition-transform"
          >
            <Save size={14} />
            <span>{saving ? "Saving Scores…" : "Record Official Scores"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
