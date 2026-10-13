import { Trophy } from "lucide-react";
import type { Match } from "@/content/tournament";
import { getAudienceChoice } from "@/lib/audience-choice";

interface PeopleChoiceProps {
  matches?: Match[];
  isLoading: boolean;
  hasError: boolean;
}

export function PeopleChoice({ matches, isLoading, hasError }: PeopleChoiceProps) {
  const choice = matches ? getAudienceChoice(matches) : undefined;
  const choiceKey =
    choice?.status === "leader"
      ? choice.team.id
      : choice?.status === "tie"
        ? choice.teams.map((team) => team.id).join(":")
        : choice?.status;

  return (
    <section
      id="people-choice"
      aria-labelledby="people-choice-heading"
      className="mx-auto w-full max-w-[1400px]"
    >
      <div className="grid gap-5 border border-sun/50 bg-surface px-5 py-5 shadow-[0_0_32px_rgba(255,214,0,0.08)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center sm:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-sun/50 bg-sun/10 text-sun">
            <Trophy aria-hidden="true" size={28} strokeWidth={1.6} />
          </div>
          <div>
            <p className="font-type text-[10px] uppercase tracking-[0.24em] text-sun">
              Audience Award
            </p>
            <h2 id="people-choice-heading" className="display mt-1 text-2xl text-paper sm:text-3xl">
              The People&rsquo;s Choice
            </h2>
          </div>
        </div>

        <div className="min-h-14 border-l-2 border-sun/30 pl-4 sm:pl-6" aria-live="polite">
          {!choice && isLoading && (
            <p role="status" className="font-serif text-sm text-mist/70">
              Adding up the audience votes…
            </p>
          )}
          {!choice && hasError && (
            <p role="status" className="font-serif text-sm text-mist/70">
              The audience tally is temporarily unavailable.
            </p>
          )}
          {choice?.status === "empty" && (
            <p className="font-serif text-base text-mist/80">The audience is ready to decide.</p>
          )}
          {choice?.status === "leader" && (
            <div key={choiceKey} className="people-choice-reveal">
              <p className="display text-3xl leading-none text-sun sm:text-4xl">
                {choice.team.name}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
                <span>The Audience&rsquo;s Most Loved Team</span>
                <span aria-hidden="true" className="text-sun">
                  ·
                </span>
                <span>{choice.votes.toLocaleString()} audience votes</span>
              </div>
            </div>
          )}
          {choice?.status === "tie" && (
            <div key={choiceKey} className="people-choice-reveal">
              <p className="display text-2xl leading-none text-sun sm:text-3xl">
                It&rsquo;s a tie!
              </p>
              <p className="mt-2 font-serif text-sm text-mist">
                {choice.teams.map((team) => team.name).join(" · ")}
              </p>
              <p className="mt-1 font-type text-[10px] uppercase tracking-wider text-mist/70">
                {choice.votes.toLocaleString()} audience votes each
              </p>
            </div>
          )}
          {choice && hasError && (
            <p className="mt-2 font-type text-[10px] text-mist/50">
              Live connection interrupted; showing the last available tally.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
