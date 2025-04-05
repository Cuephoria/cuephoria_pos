
export type GameType = 'PS5' | 'Pool';
export type PoolGameVariant = '8 Ball' | 'Snooker';
export type PS5GameTitle = 'FIFA' | 'COD' | string;

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
}
