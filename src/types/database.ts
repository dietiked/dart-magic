export type TournamentStatus = 'open' | 'closed' | 'finished'

export interface Profile {
  id: string
  email: string
  nickname: string
  first_name: string | null
  last_name: string | null
  is_admin: boolean
  active_until: string | null
  created_at: string
}

export interface Tournament {
  id: string
  name: string
  rules: string | null
  sets_to_win: number
  status: TournamentStatus
  created_at: string
}

export interface TournamentPlayer {
  id: string
  tournament_id: string
  player_id: string
  draw_position: number | null
  created_at: string
}

export interface Match {
  id: string
  tournament_id: string
  round: number
  position: number
  player1_id: string | null
  player2_id: string | null
  winner_id: string | null
  is_bye: boolean
  created_at: string
}

export interface Set {
  id: string
  match_id: string
  set_number: number
  score_p1: number
  score_p2: number
  created_at: string
}

// Types with joined data
export interface MatchWithPlayers extends Match {
  player1: Profile | null
  player2: Profile | null
  winner: Profile | null
  sets: Set[]
}

export interface TournamentWithPlayers extends Tournament {
  tournament_players: (TournamentPlayer & { player: Profile })[]
}

// Supabase Database type (for type-safe client)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      tournaments: {
        Row: Tournament
        Insert: Omit<Tournament, 'id' | 'created_at'>
        Update: Partial<Omit<Tournament, 'id' | 'created_at'>>
      }
      tournament_players: {
        Row: TournamentPlayer
        Insert: Omit<TournamentPlayer, 'id' | 'created_at'>
        Update: Partial<Omit<TournamentPlayer, 'id' | 'created_at'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'created_at'>
        Update: Partial<Omit<Match, 'id' | 'created_at'>>
      }
      sets: {
        Row: Set
        Insert: Omit<Set, 'id' | 'created_at'>
        Update: Partial<Omit<Set, 'id' | 'created_at'>>
      }
    }
    Enums: {
      tournament_status: TournamentStatus
    }
  }
}
