export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      admin_profiles: Table<
        { created_at: string; role: string; user_id: string },
        { created_at?: string; role?: string; user_id: string },
        { created_at?: string; role?: string; user_id?: string }
      >;
      audience_votes: Table<
        { created_at: string; id: string; match_id: string; team_id: string; voter_id: string },
        { created_at?: string; id?: string; match_id: string; team_id: string; voter_id: string },
        { created_at?: string; id?: string; match_id?: string; team_id?: string; voter_id?: string }
      >;
      match_scores: Table<
        {
          content_score: number;
          created_at: string;
          match_id: string;
          side: string;
          strategy_score: number;
          style_score: number;
          team_id: string;
          total_score: number | null;
          updated_at: string;
        },
        {
          content_score: number;
          created_at?: string;
          match_id: string;
          side: string;
          strategy_score: number;
          style_score: number;
          team_id: string;
          total_score?: number | null;
          updated_at?: string;
        },
        {
          content_score?: number;
          created_at?: string;
          match_id?: string;
          side?: string;
          strategy_score?: number;
          style_score?: number;
          team_id?: string;
          total_score?: number | null;
          updated_at?: string;
        }
      >;
      match_vote_totals: Table<
        {
          match_id: string;
          team_a_votes: number;
          team_b_votes: number;
          total_votes: number | null;
          updated_at: string;
        },
        {
          match_id: string;
          team_a_votes?: number;
          team_b_votes?: number;
          total_votes?: number | null;
          updated_at?: string;
        },
        {
          match_id?: string;
          team_a_votes?: number;
          team_b_votes?: number;
          total_votes?: number | null;
          updated_at?: string;
        }
      >;
      matches: Table<
        {
          completed_at: string | null;
          court: string | null;
          created_at: string;
          id: string;
          is_public: boolean;
          match_number: number;
          motion: string | null;
          round: string;
          round_label: string;
          scheduled_at: string | null;
          stage_name: string;
          status: string;
          switch_round_triggered: boolean;
          team_a_id: string | null;
          team_b_id: string | null;
          updated_at: string;
          voting_status: string;
          winner_team_id: string | null;
          zone: number;
        },
        {
          completed_at?: string | null;
          court?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          match_number?: number;
          motion?: string | null;
          round: string;
          round_label: string;
          scheduled_at?: string | null;
          stage_name: string;
          status?: string;
          switch_round_triggered?: boolean;
          team_a_id?: string | null;
          team_b_id?: string | null;
          updated_at?: string;
          voting_status?: string;
          winner_team_id?: string | null;
          zone?: number;
        },
        {
          completed_at?: string | null;
          court?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          match_number?: number;
          motion?: string | null;
          round?: string;
          round_label?: string;
          scheduled_at?: string | null;
          stage_name?: string;
          status?: string;
          switch_round_triggered?: boolean;
          team_a_id?: string | null;
          team_b_id?: string | null;
          updated_at?: string;
          voting_status?: string;
          winner_team_id?: string | null;
          zone?: number;
        }
      >;
      team_members: Table<
        { created_at: string; id: string; name: string; team_id: string; updated_at: string },
        { created_at?: string; id?: string; name: string; team_id: string; updated_at?: string },
        { created_at?: string; id?: string; name?: string; team_id?: string; updated_at?: string }
      >;
      teams: Table<
        {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          registration_number: number;
          status: string;
          stream: string | null;
          updated_at: string;
        },
        {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          registration_number: number;
          status?: string;
          stream?: string | null;
          updated_at?: string;
        },
        {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          registration_number?: number;
          status?: string;
          stream?: string | null;
          updated_at?: string;
        }
      >;
      tournament_settings: Table<
        { created_at: string; id: number; is_public: boolean; title: string; updated_at: string },
        {
          created_at?: string;
          id?: number;
          is_public?: boolean;
          title?: string;
          updated_at?: string;
        },
        {
          created_at?: string;
          id?: number;
          is_public?: boolean;
          title?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<never, never>;
    Functions: {
      archive_team: { Args: { p_team_id: string }; Returns: undefined };
      save_match_scores: {
        Args: {
          p_expected_updated_at: string | null;
          p_match_id: string;
          p_score_a: Json;
          p_score_b: Json;
        };
        Returns: undefined;
      };
      save_team: {
        Args: {
          p_members: Json;
          p_name: string;
          p_status: string;
          p_stream: string;
          p_expected_updated_at: string | null;
          p_team_id: string | null;
        };
        Returns: string;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
