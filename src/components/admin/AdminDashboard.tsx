import { useState } from "react";
import { Radio, FileSpreadsheet, Calendar, Users, Vote, Award } from "lucide-react";
import { useAdminTournament } from "@/hooks/useAdminTournament";
import { AdminHeader } from "./AdminHeader";
import { LiveControl } from "./LiveControl";
import { ScoreEntry } from "./ScoreEntry";
import { TeamManagement } from "./TeamManagement";
import { MatchManagement } from "./MatchManagement";
import { AudienceVotes } from "./AudienceVotes";
import { RecentResults } from "./RecentResults";

interface AdminDashboardProps {
  operatorName: string;
  onLogout: () => void;
}

type AdminTab = "live" | "scores" | "matches" | "teams" | "votes" | "results";

export function AdminDashboard({ operatorName, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("live");

  const {
    allMatches,
    allTeams,
    activeMatch,
    activeMatchId,
    setActiveMatchId,
    updateScores,
    updateStatus,
    setZone,
    toggleSwitch,
    setVoting,
    updateTeam,
    createTeam,
    createMatch,
    deleteMatch,
    deleteTeam,
    assignMatchTeam,
    isLoading,
    error,
    refresh,
  } = useAdminTournament();

  const handleSelectMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    setActiveTab("scores");
  };

  return (
    <div className="min-h-screen bg-canvas text-mist">
      {/* 1. Header */}
      <AdminHeader operatorName={operatorName} onLogout={onLogout} />

      {/* 2. Top Ribbon: Active Match Quick Telemetry */}
      {activeMatch && (
        <div className="border-b-2 border-line bg-surface/80 px-4 py-2.5 backdrop-blur-sm md:px-8">
          <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-type uppercase tracking-wider text-mist/60">
                Active Desk Target:
              </span>
              <span className="font-bold text-sun uppercase">
                [{activeMatch.roundLabel}] {activeMatch.teamA?.name ?? "TBD"} vs{" "}
                {activeMatch.teamB?.name ?? "TBD"}
              </span>
              <span
                className={`border px-2 py-0.5 text-[10px] font-bold uppercase ${
                  activeMatch.status === "live"
                    ? "border-sun bg-sun/15 text-sun animate-pulse"
                    : "border-line bg-canvas text-mist/60"
                }`}
              >
                {activeMatch.status}
              </span>
              <span className="border border-line bg-canvas px-2 py-0.5 text-[10px] text-mist/80">
                Zone {activeMatch.zone}
              </span>
              {activeMatch.switchRoundTriggered && (
                <span className="border border-hot bg-hot/15 px-2 py-0.5 text-[10px] font-bold text-hot animate-pulse">
                  SWITCH BUZZER ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="border-b-2 border-line bg-surface px-4 md:px-8">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "live"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <Radio size={14} />
            <span>Live Control</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "scores"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Score Entry (40/30/30)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matches")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "matches"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <Calendar size={14} />
            <span>Matches ({allMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "teams"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <Users size={14} />
            <span>Teams ({allTeams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("votes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "votes"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <Vote size={14} />
            <span>Audience Voting</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("results")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 font-type text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "results"
                ? "border-sun bg-canvas text-sun"
                : "border-transparent text-mist/70 hover:text-paper"
            }`}
          >
            <Award size={14} />
            <span>Recent Results</span>
          </button>
        </div>
      </div>

      {/* 4. Active Tab Content Area */}
      <main className="mx-auto max-w-[1700px] p-4 md:p-8">
        {isLoading && (
          <p
            role="status"
            className="mb-4 border border-line bg-surface px-4 py-3 font-type text-xs uppercase text-mist/70"
          >
            Loading tournament data…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-hot bg-hot/10 px-4 py-3 font-type text-xs text-paper"
          >
            <span>
              Tournament data could not be loaded. Check your connection or administrator session.
            </span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="border border-hot px-3 py-1.5 font-bold uppercase hover:bg-hot"
            >
              Retry
            </button>
          </div>
        )}
        {activeTab === "live" && (
          <LiveControl
            allMatches={allMatches}
            activeMatch={activeMatch}
            onSelectMatch={setActiveMatchId}
            onUpdateStatus={updateStatus}
            onSetZone={setZone}
            onToggleSwitch={toggleSwitch}
          />
        )}

        {activeTab === "scores" && (
          <ScoreEntry
            activeMatch={activeMatch}
            onSaveScores={updateScores}
            onUpdateStatus={updateStatus}
          />
        )}

        {activeTab === "matches" && (
          <MatchManagement
            allMatches={allMatches}
            teams={allTeams}
            activeMatchId={activeMatchId}
            onSelectMatch={setActiveMatchId}
            onUpdateStatus={updateStatus}
            onAssignTeam={assignMatchTeam}
            onCreateMatch={createMatch}
            onDeleteMatch={deleteMatch}
          />
        )}

        {activeTab === "teams" && (
          <TeamManagement
            teams={allTeams}
            onCreateTeam={createTeam}
            onUpdateTeam={updateTeam}
            onDeleteTeam={deleteTeam}
          />
        )}

        {activeTab === "votes" && (
          <AudienceVotes
            allMatches={allMatches}
            activeMatch={activeMatch}
            onSetVoting={setVoting}
            onSelectMatch={setActiveMatchId}
          />
        )}

        {activeTab === "results" && (
          <RecentResults allMatches={allMatches} onSelectMatch={handleSelectMatch} />
        )}
      </main>
    </div>
  );
}
