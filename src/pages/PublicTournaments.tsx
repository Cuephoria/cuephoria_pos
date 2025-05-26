import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, Users, MapPin, Clock, IndianRupee } from 'lucide-react';
import { TournamentRegistrationDialog } from '@/components/tournaments/TournamentRegistrationDialog';
import { useToast } from '@/hooks/use-toast';

interface TournamentStats {
  id: string;
  name: string;
  game_type: string;
  game_variant?: string;
  game_title?: string;
  date: string;
  status: string;
  budget?: number;
  winner_prize?: number;
  runner_up_prize?: number;
  players: any[];
  matches: any[];
  winner?: any;
  total_registrations: number;
  max_players: number;
}

export default function PublicTournaments() {
  const [tournaments, setTournaments] = useState<TournamentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<TournamentStats | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_stats')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: "Error",
          description: "Failed to load tournaments",
          variant: "destructive"
        });
        return;
      }

      // Transform the data to ensure proper types
      const transformedData = (data || []).map(tournament => ({
        ...tournament,
        players: Array.isArray(tournament.players) ? tournament.players : [],
        matches: Array.isArray(tournament.matches) ? tournament.matches : [],
        winner: tournament.winner || undefined
      }));

      setTournaments(transformedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    return gameType === 'PS5' ? '🎮' : '🎱';
  };

  const isRegistrationOpen = (tournament: TournamentStats) => {
    return tournament.status === 'upcoming' && 
           tournament.total_registrations < tournament.max_players;
  };

  const handleRegister = (tournament: TournamentStats) => {
    setSelectedTournament(tournament);
    setShowRegistrationDialog(true);
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationDialog(false);
    setSelectedTournament(null);
    fetchTournaments(); // Refresh to get updated registration count
    toast({
      title: "Registration Successful!",
      description: "You have been registered for the tournament. We'll contact you with more details.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tournaments...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Cuephoria Tournaments
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join the ultimate gaming competitions at Cuephoria Gaming Lounge
          </p>
          <div className="flex justify-center space-x-8 text-center">
            <div>
              <div className="text-3xl font-bold">{tournaments.length}</div>
              <div className="text-sm opacity-80">Total Tournaments</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {tournaments.filter(t => t.status === 'upcoming').length}
              </div>
              <div className="text-sm opacity-80">Upcoming</div>
            </div>
            <div>
              <div className="text-3xl font-bold">
                {tournaments.reduce((sum, t) => sum + t.total_registrations, 0)}
              </div>
              <div className="text-sm opacity-80">Total Registrations</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tournament Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Tournament Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['upcoming', 'in-progress', 'completed'].map((status) => {
              const statusTournaments = tournaments.filter(t => t.status === status);
              return (
                <Card key={status} className="text-center">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center justify-center">
                      <Badge className={`${getStatusColor(status)} text-white mr-2`}>
                        {statusTournaments.length}
                      </Badge>
                      {status.replace('-', ' ')}
                    </CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Card key={tournament.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-lg">
                    <span className="mr-2 text-2xl">{getGameTypeIcon(tournament.game_type)}</span>
                    {tournament.name}
                  </CardTitle>
                  <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                    {tournament.status}
                  </Badge>
                </div>
                <CardDescription>
                  {tournament.game_type} {tournament.game_variant && `- ${tournament.game_variant}`}
                  {tournament.game_title && ` - ${tournament.game_title}`}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(tournament.date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {tournament.total_registrations} / {tournament.max_players} registered
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((tournament.total_registrations / tournament.max_players) * 100, 100)}%` 
                    }}
                  ></div>
                </div>

                {tournament.winner_prize && (
                  <div className="flex items-center text-sm text-green-600 font-semibold">
                    <Trophy className="w-4 h-4 mr-2" />
                    Winner: ₹{tournament.winner_prize}
                    {tournament.runner_up_prize && ` | Runner-up: ₹${tournament.runner_up_prize}`}
                  </div>
                )}

                {tournament.status === 'completed' && tournament.winner && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center text-sm">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
                      <span className="font-semibold">Winner: {tournament.winner.name}</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  {isRegistrationOpen(tournament) ? (
                    <Button 
                      onClick={() => handleRegister(tournament)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Register Now
                    </Button>
                  ) : tournament.status === 'upcoming' ? (
                    <Button disabled className="w-full">
                      Registration Full
                    </Button>
                  ) : tournament.status === 'in-progress' ? (
                    <Button disabled className="w-full">
                      Tournament In Progress
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      Tournament Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Tournaments Available</h3>
            <p className="text-gray-500">Check back soon for upcoming tournaments!</p>
          </div>
        )}
      </div>

      {/* Registration Dialog */}
      {selectedTournament && (
        <TournamentRegistrationDialog
          tournament={selectedTournament}
          open={showRegistrationDialog}
          onOpenChange={setShowRegistrationDialog}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
}
