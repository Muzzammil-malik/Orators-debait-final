import { useState, type FormEvent } from "react";
import { Plus, UserPlus, X, Pencil, Trash2, Users } from "lucide-react";
import type { Team, TeamMember, TeamStatus } from "@/content/tournament";

interface TeamMutationResult {
  success: boolean;
  error?: string;
  historicalMatches?: number;
}

interface TeamManagementProps {
  teams: Team[];
  onCreateTeam: (data: {
    name: string;
    stream?: string;
    status?: TeamStatus;
    members: TeamMember[];
  }) => Promise<TeamMutationResult>;
  onUpdateTeam: (teamId: string, data: Partial<Team>) => Promise<TeamMutationResult>;
  onDeleteTeam: (teamId: string) => Promise<TeamMutationResult>;
}

const blankMember = (): TeamMember => ({ id: "", name: "" });

export function TeamManagement({
  teams,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
}: TeamManagementProps) {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [stream, setStream] = useState("General");
  const [status, setStatus] = useState<TeamStatus>("registered");
  const [members, setMembers] = useState<TeamMember[]>([
    blankMember(),
    blankMember(),
    blankMember(),
  ]);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingTeamId(null);
    setTeamName("");
    setStream("General");
    setStatus("registered");
    setMembers([blankMember(), blankMember(), blankMember()]);
    setFormError(null);
  };

  const beginCreate = () => {
    resetForm();
    setFeedback(null);
    setEditingTeamId("new");
  };

  const beginEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setStream(team.stream ?? "General");
    setStatus(team.status);
    setMembers(team.members.map((member) => ({ ...member })));
    setFormError(null);
    setFeedback(null);
  };

  const updateMember = (index: number, name: string) => {
    setMembers((current) =>
      current.map((member, position) => (position === index ? { ...member, name } : member)),
    );
  };

  const saveTeam = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = teamName.trim();
    const cleanedMembers = members.map((member) => ({ ...member, name: member.name.trim() }));
    if (!name) {
      setFormError("Enter a team name.");
      return;
    }
    if (cleanedMembers.length < 3 || cleanedMembers.length > 5) {
      setFormError("Each team must have 3 to 5 members.");
      return;
    }
    if (cleanedMembers.some((member) => !member.name)) {
      setFormError("Enter a name for every team member.");
      return;
    }

    setSaving(true);
    try {
      const result =
        editingTeamId === "new"
          ? await onCreateTeam({ name, stream, status, members: cleanedMembers })
          : await onUpdateTeam(editingTeamId!, { name, stream, status, members: cleanedMembers });
      if (!result.success) {
        setFormError(result.error ?? "The team could not be saved.");
        return;
      }

      setFeedback(editingTeamId === "new" ? `${name} added.` : `${name} updated.`);
      resetForm();
    } catch {
      setFormError("The team could not be saved. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const result = await onDeleteTeam(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.error ?? "The team could not be removed.");
        return;
      }
      setFeedback(`${deleteTarget.name} archived. Historical match records remain unchanged.`);
      setDeleteTarget(null);
      setDeleteError(null);
    } catch {
      setDeleteError("The team could not be removed. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5" aria-labelledby="teams-heading">
      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-line bg-surface p-4">
        <div>
          <h2 id="teams-heading" className="display text-xl tracking-wide text-paper">
            TEAM ROSTER <span className="text-sun">({teams.length})</span>
          </h2>
          <p className="mt-1 font-type text-xs uppercase tracking-wider text-mist/60">
            3 to 5 named members per team
          </p>
        </div>
        <button
          type="button"
          onClick={beginCreate}
          className="flex items-center gap-2 border-2 border-sun bg-sun px-4 py-2 font-type text-xs font-bold uppercase tracking-wider text-canvas hover:bg-sun/90"
        >
          <Plus size={15} aria-hidden="true" /> Add Team
        </button>
      </div>

      {feedback && (
        <p
          role="status"
          className="border border-sun/60 bg-sun/10 px-4 py-2 font-mono text-xs text-sun"
        >
          {feedback}
        </p>
      )}

      {editingTeamId && (
        <form onSubmit={saveTeam} className="space-y-4 border-2 border-sun bg-surface p-4 md:p-5">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h3 className="font-type text-sm font-bold uppercase tracking-wider text-sun">
              {editingTeamId === "new" ? "Add Team" : "Edit Team"}
            </h3>
            <button
              type="button"
              disabled={saving}
              onClick={resetForm}
              aria-label="Close team form"
              className="p-1 text-mist/70 hover:text-paper"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_2fr]">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="team-name"
                  className="mb-1 block font-type text-xs uppercase text-mist/70"
                >
                  Team name
                </label>
                <input
                  id="team-name"
                  required
                  maxLength={80}
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  className="w-full border border-line bg-canvas px-3 py-2 font-mono text-sm text-paper focus:border-sun focus:outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label
                  htmlFor="team-stream"
                  className="mb-1 block font-type text-xs uppercase text-mist/70"
                >
                  Stream
                </label>
                <input
                  id="team-stream"
                  maxLength={80}
                  value={stream}
                  onChange={(event) => setStream(event.target.value)}
                  className="w-full border border-line bg-canvas px-3 py-2 font-mono text-sm text-paper focus:border-sun focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="team-status"
                  className="mb-1 block font-type text-xs uppercase text-mist/70"
                >
                  Status
                </label>
                <select
                  id="team-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as TeamStatus)}
                  className="w-full border border-line bg-canvas px-3 py-2 font-mono text-sm text-paper focus:border-sun focus:outline-none"
                >
                  <option value="registered">Registered</option>
                  <option value="qualified">Qualified</option>
                  <option value="eliminated">Eliminated</option>
                  <option value="champion">Champion</option>
                </select>
              </div>
            </div>
            <fieldset>
              <legend className="mb-1 font-type text-xs uppercase text-mist/70">
                Members ({members.length}/5)
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {members.map((member, index) => (
                  <div key={`${member.id || "new"}-${index}`} className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`member-${index}`}>
                      Member {index + 1} name
                    </label>
                    <input
                      id={`member-${index}`}
                      required
                      maxLength={100}
                      value={member.name}
                      onChange={(event) => updateMember(index, event.target.value)}
                      placeholder={`Member ${index + 1}`}
                      className="min-w-0 flex-1 border border-line bg-canvas px-3 py-2 font-mono text-xs text-paper focus:border-sun focus:outline-none"
                    />
                    {members.length > 3 && (
                      <button
                        type="button"
                        aria-label={`Remove member ${index + 1}`}
                        onClick={() =>
                          setMembers((current) =>
                            current.filter((_, position) => position !== index),
                          )
                        }
                        className="p-2 text-mist/60 hover:text-hot"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                disabled={members.length >= 5}
                onClick={() => setMembers((current) => [...current, blankMember()])}
                className="mt-2 flex items-center gap-1.5 font-type text-xs uppercase text-mist/70 hover:text-sun disabled:cursor-not-allowed disabled:opacity-40"
              >
                <UserPlus size={14} /> Add member
              </button>
            </fieldset>
          </div>

          {formError && (
            <p role="alert" className="text-xs font-mono text-hot">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-3">
            <button
              type="button"
              onClick={resetForm}
              className="border border-line px-4 py-2 font-type text-xs uppercase text-mist hover:text-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="border-2 border-sun bg-sun px-4 py-2 font-type text-xs font-bold uppercase text-canvas hover:bg-sun/90"
            >
              {saving ? "Saving…" : "Save Team"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border-2 border-line bg-surface">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead className="bg-canvas font-type text-[10px] uppercase tracking-wider text-mist/60">
            <tr>
              <th scope="col" className="px-4 py-3">
                Team
              </th>
              <th scope="col" className="px-4 py-3">
                Members
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {teams.map((team) => (
              <tr key={team.id} className="align-top hover:bg-surface-raised/60">
                <th scope="row" className="px-4 py-3 font-mono text-sm font-bold text-paper">
                  <span className="mr-2 text-xs text-sun">
                    #{String(team.number).padStart(2, "0")}
                  </span>
                  {team.name}
                </th>
                <td className="px-4 py-3">
                  <div className="mb-1 flex items-center gap-1.5 font-type text-[10px] uppercase text-mist/50">
                    <Users size={12} /> {team.members.length} members
                  </div>
                  <ul className="space-y-0.5 font-mono text-xs text-mist/80">
                    {team.members.map((member) => (
                      <li key={member.id}>{member.name}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-3 font-type text-xs uppercase text-mist/60">
                  {team.status}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => beginEdit(team)}
                      aria-label={`Edit ${team.name}`}
                      className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-type text-[10px] uppercase text-mist hover:border-sun hover:text-sun"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(team);
                        setDeleteError(null);
                      }}
                      aria-label={`Remove ${team.name}`}
                      className="flex items-center gap-1 border border-line px-2.5 py-1.5 font-type text-[10px] uppercase text-mist hover:border-hot hover:text-hot"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center font-type text-sm text-mist/60">
                  No teams registered.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/85 p-4"
          role="presentation"
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-team-title"
            aria-describedby="delete-team-description"
            className="w-full max-w-md border-2 border-hot bg-surface p-5 shadow-[6px_6px_0_rgba(216,27,114,0.25)]"
          >
            <h3 id="delete-team-title" className="display text-xl text-paper">
              Remove {deleteTarget.name}?
            </h3>
            <p id="delete-team-description" className="mt-3 font-serif text-sm text-mist/80">
              This removes the team from the active roster. Resolve any upcoming or live match
              assignment first. Completed matches, scores, winners, and voting records are retained.
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
                  setDeleteTarget(null);
                  setDeleteError(null);
                }}
                className="border border-line px-4 py-2 font-type text-xs uppercase text-mist hover:text-paper"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={confirmDelete}
                className="border-2 border-hot bg-hot px-4 py-2 font-type text-xs font-bold uppercase text-paper hover:bg-hot/90"
              >
                {saving ? "Removing…" : "Remove Team"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
