
export type GameType = 'PS5' | 'Pool';
export type PoolGameVariant = '8 Ball' | 'Snooker';
export type PS5GameTitle = 'FIFA' | 'COD' | string;
export type MatchStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Player {
  id: string;
  name: string;
  customerId?: string;
}

export interface Match {
  id: string;
  round: number;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  completed: boolean;
  scheduledDate: string; // ISO date string
  scheduledTime: string; // 24-hour format "HH:MM"
  status: MatchStatus;
}

export interface Tournament {
  id: string;
  name: string;
  gameType: GameType;
  gameVariant?: PoolGameVariant;
  gameTitle?: PS5GameTitle;
  date: string;
  players: Player[];
  matches: Match[];
  winner?: Player;
  status: 'upcoming' | 'in-progress' | 'completed';
  budget?: number;
  winnerPrize?: number;
  runnerUpPrize?: number;
  // Database sync fields
  created_at?: string;
  updated_at?: string;
}

// Database conversion helper functions
export const convertFromSupabaseTournament = (item: any): Tournament => {
  return {
    id: item.id,
    name: item.name,
    gameType: item.game_type,
    gameVariant: item.game_variant,
    gameTitle: item.game_title,
    date: item.date,
    players: item.players || [],
    matches: item.matches || [],
    status: item.status,
    budget: item.budget,
    winnerPrize: item.winner_prize,
    runnerUpPrize: item.runner_up_prize,
    winner: item.winner,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
};

export const convertToSupabaseTournament = (tournament: Tournament): any => {
  return {
    id: tournament.id,
    name: tournament.name,
    game_type: tournament.gameType,
    game_variant: tournament.gameVariant,
    game_title: tournament.gameTitle,
    date: tournament.date,
    players: tournament.players,
    matches: tournament.matches,
    status: tournament.status,
    budget: tournament.budget,
    winner_prize: tournament.winnerPrize,
    runner_up_prize: tournament.runnerUpPrize,
    winner: tournament.winner,
    updated_at: new Date().toISOString()
  };
};
