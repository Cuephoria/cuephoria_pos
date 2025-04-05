
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TournamentList from './TournamentList';
import TournamentDialog from './TournamentDialog';
import { Tournament } from '@/types/tournament.types';

const TournamentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);

  const handleAddTournament = (tournament: Tournament) => {
    if (editingTournament) {
      // Update existing tournament
      setTournaments(tournaments.map(t => 
        t.id === tournament.id ? tournament : t
      ));
    } else {
      // Add new tournament
      setTournaments([...tournaments, tournament]);
    }
    setIsDialogOpen(false);
    setEditingTournament(null);
  };

  const handleDeleteTournament = (id: string) => {
    setTournaments(tournaments.filter(t => t.id !== id));
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setIsDialogOpen(true);
  };

  const filteredTournaments = searchQuery 
    ? tournaments.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.gameType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.gameTitle?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tournaments;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tournament Management</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-cuephoria-purple hover:bg-cuephoria-lightpurple">
          <Plus className="mr-2 h-4 w-4" /> Add Tournament
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search tournaments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <TournamentList 
        tournaments={filteredTournaments} 
        onEdit={handleEditTournament}
        onDelete={handleDeleteTournament}
      />

      <TournamentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddTournament}
        tournament={editingTournament}
      />
    </div>
  );
};

export default TournamentManagement;
