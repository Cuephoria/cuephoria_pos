
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash } from 'lucide-react';
import { Player } from '@/types/tournament.types';
import { generateId } from '@/utils/pos.utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TournamentPlayerSectionProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  matchesExist: boolean;
}

const TournamentPlayerSection: React.FC<TournamentPlayerSectionProps> = ({ 
  players, 
  setPlayers,
  matchesExist 
}) => {
  const [playerName, setPlayerName] = useState('');

  const addPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: Player = {
      id: generateId(),
      name: playerName.trim()
    };
    
    setPlayers([...players, newPlayer]);
    setPlayerName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(player => player.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          className="flex-1"
        />
        <Button onClick={addPlayer}>
          <Plus className="mr-2 h-4 w-4" /> Add Player
        </Button>
      </div>
      
      {players.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell>{player.name}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removePlayer(player.id)}
                    disabled={matchesExist}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          No players added yet. Add players to create the tournament.
        </div>
      )}
      
      {matchesExist && (
        <div className="text-sm text-amber-600">
          Note: Players cannot be removed after matches have been generated.
        </div>
      )}
    </div>
  );
};

export default TournamentPlayerSection;
