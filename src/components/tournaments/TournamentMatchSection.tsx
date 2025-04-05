
import React from 'react';
import { Match, Player, Tournament } from '@/types/tournament.types';
import { Button } from '@/components/ui/button';
import { Check, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TournamentMatchSectionProps {
  matches: Match[];
  players: Player[];
  updateMatchResult: (matchId: string, winnerId: string) => void;
  winner?: Player;
}

const TournamentMatchSection: React.FC<TournamentMatchSectionProps> = ({
  matches,
  players,
  updateMatchResult,
  winner
}) => {
  const getPlayerName = (playerId: string) => {
    return players.find(player => player.id === playerId)?.name || 'Unknown';
  };

  if (winner) {
    return (
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <Trophy className="h-16 w-16 text-yellow-500" />
        </div>
        <h3 className="text-2xl font-bold">Tournament Winner</h3>
        <p className="text-xl font-medium mt-2">{winner.name}</p>
        <p className="text-muted-foreground mt-4">
          Congratulations to {winner.name} for winning the tournament!
        </p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No matches generated yet. Click the button below to generate matches.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id} className={match.completed ? 'bg-gray-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Match #{match.id.split('-')[1]}</div>
                {match.completed ? (
                  <span className="text-green-600 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" /> 
                    Winner: {getPlayerName(match.winnerId || '')}
                  </span>
                ) : (
                  <span className="text-amber-600 text-sm">In progress</span>
                )}
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className={`flex-1 text-center p-2 ${match.winnerId === match.player1Id ? 'bg-green-100 rounded' : ''}`}>
                  {getPlayerName(match.player1Id)}
                </div>
                <div className="mx-2 text-lg">vs</div>
                <div className={`flex-1 text-center p-2 ${match.winnerId === match.player2Id ? 'bg-green-100 rounded' : ''}`}>
                  {getPlayerName(match.player2Id)}
                </div>
              </div>
              
              {!match.completed && (
                <div className="mt-4">
                  <Select
                    onValueChange={(value) => updateMatchResult(match.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select winner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={match.player1Id}>
                        {getPlayerName(match.player1Id)}
                      </SelectItem>
                      <SelectItem value={match.player2Id}>
                        {getPlayerName(match.player2Id)}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TournamentMatchSection;
