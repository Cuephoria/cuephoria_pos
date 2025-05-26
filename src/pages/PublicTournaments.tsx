
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Users, DollarSign, Clock, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tournament } from '@/types/tournament.types';
import { useToast } from '@/hooks/use-toast';
import TournamentRegistrationDialog from '@/components/tournaments/TournamentRegistrationDialog';

const PublicTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .in('status', ['upcoming', 'in-progress'])
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching tournaments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tournaments',
          variant: 'destructive'
        });
        return;
      }

      const transformedTournaments = data?.map(tournament => ({
        id: tournament.id,
        name: tournament.name,
        gameType: tournament.game_type as any,
        gameVariant: tournament.game_variant,
        gameTitle: tournament.game_title,
        date: tournament.date,
        players: tournament.players || [],
        matches: tournament.matches || [],
        status: tournament.status as any,
        budget: tournament.budget,
        winnerPrize: tournament.winner_prize,
        runnerUpPrize: tournament.runner_up_prize,
        winner: tournament.winner
      })) || [];

      setTournaments(transformedTournaments);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tournaments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setShowRegistrationDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'in-progress': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'PS5': return '🎮';
      case 'Pool': return '🎱';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cuephoria-dark flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
      </div>
    );
  }

  const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
  const activeTournaments = tournaments.filter(t => t.status === 'in-progress');

  return (
    <div className="min-h-screen bg-cuephoria-dark text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <Trophy className="inline-block mr-4 h-12 w-12" />
            Cuephoria Tournaments
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Join the ultimate gaming competition experience
          </p>
          <div className="flex justify-center space-x-8 text-center">
            <div>
              <div className="text-3xl font-bold text-cuephoria-yellow">₹25,000+</div>
              <div className="text-sm opacity-80">Prize Pool</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cuephoria-yellow">{tournaments.length}+</div>
              <div className="text-sm opacity-80">Active Tournaments</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cuephoria-yellow">100+</div>
              <div className="text-sm opacity-80">Players</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Upcoming Tournaments */}
        {upcomingTournaments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Calendar className="mr-3 h-8 w-8 text-cuephoria-lightpurple" />
              Upcoming Tournaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onRegister={() => handleRegisterClick(tournament)}
                  getStatusColor={getStatusColor}
                  getGameTypeIcon={getGameTypeIcon}
                />
              ))}
            </div>
          </section>
        )}

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center">
              <Clock className="mr-3 h-8 w-8 text-green-500" />
              Live Tournaments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  onRegister={() => handleRegisterClick(tournament)}
                  getStatusColor={getStatusColor}
                  getGameTypeIcon={getGameTypeIcon}
                  isLive={true}
                />
              ))}
            </div>
          </section>
        )}

        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="mx-auto h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Active Tournaments</h3>
            <p className="text-gray-400">Check back soon for upcoming tournaments!</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple rounded-lg p-8 text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Compete?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join Cuephoria today and participate in exciting tournaments with amazing prizes!
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-cuephoria-yellow text-black hover:bg-yellow-400"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Visit Us
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-black"
            >
              <Users className="mr-2 h-5 w-5" />
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Registration Dialog */}
      {selectedTournament && (
        <TournamentRegistrationDialog
          tournament={selectedTournament}
          open={showRegistrationDialog}
          onOpenChange={setShowRegistrationDialog}
          onRegistrationSuccess={() => {
            setShowRegistrationDialog(false);
            toast({
              title: 'Registration Successful!',
              description: `You've been registered for ${selectedTournament.name}`,
            });
          }}
        />
      )}
    </div>
  );
};

// Tournament Card Component
interface TournamentCardProps {
  tournament: Tournament;
  onRegister: () => void;
  getStatusColor: (status: string) => string;
  getGameTypeIcon: (gameType: string) => string;
  isLive?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  onRegister,
  getStatusColor,
  getGameTypeIcon,
  isLive = false
}) => {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cuephoria-lightpurple transition-colors">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <Badge className={`${getStatusColor(tournament.status)} text-white`}>
            {isLive && <span className="animate-pulse mr-1">●</span>}
            {tournament.status === 'upcoming' ? 'Upcoming' : 'Live'}
          </Badge>
          <span className="text-2xl">{getGameTypeIcon(tournament.gameType)}</span>
        </div>
        <CardTitle className="text-xl text-white">{tournament.name}</CardTitle>
        <div className="flex items-center text-sm text-gray-400">
          <Calendar className="mr-1 h-4 w-4" />
          {new Date(tournament.date).toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Game:</span>
            <span className="text-white">
              {tournament.gameType} {tournament.gameVariant && `- ${tournament.gameVariant}`}
              {tournament.gameTitle && ` (${tournament.gameTitle})`}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Players:</span>
            <span className="text-white">{tournament.players.length}</span>
          </div>

          {tournament.winnerPrize && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Winner Prize:</span>
              <span className="text-cuephoria-yellow font-semibold">
                ₹{tournament.winnerPrize.toLocaleString()}
              </span>
            </div>
          )}

          {tournament.runnerUpPrize && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Runner-up:</span>
              <span className="text-cuephoria-yellow font-semibold">
                ₹{tournament.runnerUpPrize.toLocaleString()}
              </span>
            </div>
          )}

          <div className="pt-4">
            {tournament.status === 'upcoming' ? (
              <Button 
                onClick={onRegister}
                className="w-full bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
              >
                <Users className="mr-2 h-4 w-4" />
                Register Now
              </Button>
            ) : (
              <Button 
                variant="outline" 
                disabled 
                className="w-full border-gray-600 text-gray-400"
              >
                Tournament In Progress
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicTournaments;
