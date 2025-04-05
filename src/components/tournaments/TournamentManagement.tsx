
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TournamentList from './TournamentList';
import TournamentDialog from './TournamentDialog';
import { Tournament } from '@/types/tournament.types';
import { useTournamentOperations } from '@/services/tournamentService';
import { useToast } from '@/hooks/use-toast';

const TournamentManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tournamentOps = useTournamentOperations();
  const { toast } = useToast();

  // Fetch tournaments from Supabase on component mount
  useEffect(() => {
    const fetchTournamentsData = async () => {
      setIsLoading(true);
      try {
        const data = await tournamentOps.fetchTournaments();
        setTournaments(data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: "Error",
          description: "Failed to load tournaments. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTournamentsData();
  }, []);

  const handleAddTournament = async (tournament: Tournament) => {
    const savedTournament = await tournamentOps.saveTournament(tournament);
    
    if (savedTournament) {
      if (editingTournament) {
        // Update existing tournament in local state
        setTournaments(tournaments.map(t => 
          t.id === savedTournament.id ? savedTournament : t
        ));
      } else {
        // Add new tournament to local state
        setTournaments([savedTournament, ...tournaments]);
      }
      setIsDialogOpen(false);
      setEditingTournament(null);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) return;
    
    const success = await tournamentOps.deleteTournament(id, tournament.name);
    if (success) {
      setTournaments(tournaments.filter(t => t.id !== id));
    }
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-cuephoria-purple border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <TournamentList 
          tournaments={filteredTournaments} 
          onEdit={handleEditTournament}
          onDelete={handleDeleteTournament}
        />
      )}

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
