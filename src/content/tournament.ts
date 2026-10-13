// Tournament contracts. Runtime team and match data is retrieved from Supabase.

export type TeamStatus = "registered" | "qualified" | "eliminated" | "champion";

export interface TeamMember {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  stream?: string;
  seed?: number;
  status: TeamStatus;
  members: TeamMember[];
  updatedAt?: string;
}

export interface ScoreBreakdown {
  content: number;
  strategy: number;
  style: number;
  total: number;
}

export type ZoneNumber = 1 | 2 | 3;

export interface ZoneInfo {
  number: ZoneNumber;
  title: string;
  subtitle: string;
  description: string;
}

export const ZONES_METADATA: Record<ZoneNumber, ZoneInfo> = {
  1: {
    number: 1,
    title: "Opening Cases",
    subtitle: "Core Casework",
    description: "All 3 Core Speakers construct their initial arguments uninterrupted.",
  },
  2: {
    number: 2,
    title: "Open Crossfire",
    subtitle: "Direct Rebuttal & Switch Opportunity",
    description: "Rebuttal speakers engage. Buzzer may strike for a sudden 5-minute Switch Round.",
  },
  3: {
    number: 3,
    title: "Final Statement",
    subtitle: "Closing Defence",
    description:
      "One Core Speaker delivers a decisive 90-second summation defending their current stance.",
  },
};

export type MatchRound = "preliminary" | "quarterfinal" | "semifinal" | "final";
export type MatchStatus = "upcoming" | "live" | "completed";
export type VotingStatus = "open" | "closed" | "upcoming";

export interface MatchVotes {
  teamA: number;
  teamB: number;
  totalVotes: number;
}

export interface Match {
  id: string;
  matchNumber: number;
  round: MatchRound;
  roundLabel: string;
  stageName: string;
  motion: string;
  zone: ZoneNumber;
  switchRoundTriggered?: boolean;
  teamA?: Team;
  teamB?: Team;
  scoreA?: ScoreBreakdown;
  scoreB?: ScoreBreakdown;
  winnerTeamId?: string;
  status: MatchStatus;
  scheduledTime?: string;
  completedTime?: string;
  court?: string;
  votes: MatchVotes;
  votingStatus: VotingStatus;
  updatedAt?: string;
  scoreUpdatedAt?: string;
}

export interface UserVote {
  matchId: string;
  teamId: string;
  timestamp: number;
}

export interface TournamentTree {
  preliminaries: Match[];
  quarterFinals: Match[];
  semiFinals: Match[];
  final?: Match;
  champion?: Team;
}
