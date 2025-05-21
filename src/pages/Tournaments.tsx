
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, ArrowRight, Ticket, Info, Gamepad2, Table2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Tournament, convertFromSupabaseTournament } from '@/types/tournament.types';
import { format, isFuture } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const TournamentsPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .order('date', { ascending: true });
        
        if (error) {
          console.error('Error fetching tournaments:', error);
          setTournaments([]);
        } else {
          setTournaments(data?.map(convertFromSupabaseTournament) || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching tournaments:', error);
        setTournaments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold mb-4 gradient-text">Upcoming Tournaments</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Join our exciting gaming and pool tournaments to compete with the best players and win exciting prizes!
        </p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400">Loading tournaments...</p>
        </div>
      ) : tournaments.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {tournaments.map((tournament) => {
            const tournamentDate = new Date(tournament.date);
            const isUpcoming = isFuture(tournamentDate);
            const isPS5 = tournament.gameType === 'PS5';
            
            return (
              <motion.div 
                key={tournament.id}
                variants={item}
                className="card-hover"
              >
                <Card className="overflow-hidden border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isPS5 ? 'bg-blue-500/20' : 'bg-orange-500/20'
                        }`}>
                          {isPS5 ? (
                            <Gamepad2 className="h-6 w-6 text-blue-400" />
                          ) : (
                            <Table2 className="h-6 w-6 text-orange-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-xl md:text-2xl">{tournament.name}</CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                            {tournament.gameType}
                            {tournament.gameVariant ? ` - ${tournament.gameVariant}` : ''}
                            {tournament.gameTitle ? ` - ${tournament.gameTitle}` : ''}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <Badge className={`${
                        isPS5 ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' : 
                               'bg-orange-500/20 text-orange-300 border-orange-500/50'
                      } px-3 py-1`}>
                        {isUpcoming ? 'Upcoming' : 'Registration Open'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <Separator className="my-2 bg-gray-700/50" />
                  
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                            Tournament Details
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Date:</span>
                              <span className="font-medium">{format(tournamentDate, 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Registration Fee:</span>
                              <span className="font-medium">₹250 per player</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Players:</span>
                              <span className="font-medium">{tournament.players?.length || 0} registered (max 16)</span>
                            </div>
                            {tournament.winnerPrize && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Winner Prize:</span>
                                <span className="font-medium text-green-400">₹{tournament.winnerPrize}</span>
                              </div>
                            )}
                            {tournament.runnerUpPrize && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Runner-up Prize:</span>
                                <span className="font-medium text-green-400">₹{tournament.runnerUpPrize}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-gray-400" />
                            How to Register
                          </h3>
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                              <li>Visit our gaming lounge in person</li>
                              <li>Pay the registration fee of ₹250</li>
                              <li>Fill out the registration form at the counter</li>
                              <li>Get your tournament ticket and details</li>
                            </ol>
                            <div className="mt-4 text-sm text-gray-400">
                              <p>Registration closes 24 hours before the tournament starts or when all slots are filled.</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-700/30">
                          <h3 className="text-lg font-semibold mb-2 flex items-center">
                            <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
                            Tournament Format
                          </h3>
                          <p className="text-gray-300">
                            This is a single-elimination tournament. Players will be randomly seeded in the bracket.
                            Each match is best of {isPS5 ? '3 games' : '3 frames'}.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="bg-gradient-to-r from-gray-800/80 to-gray-800/50 pt-4 pb-4 flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate('/booknow')} 
                      variant="default" 
                      className="w-full sm:w-auto bg-gradient-to-r from-cuephoria-orange to-cuephoria-orange/70 hover:opacity-90 group"
                    >
                      Book a Session
                      <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto border-gray-600 hover:bg-gray-700/50"
                      onClick={() => window.location.href = 'tel:+919876543210'}
                    >
                      <Ticket className="h-4 w-4 mr-2" />
                      Call for Inquiry
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-12 border border-dashed border-gray-700"
        >
          <Trophy className="h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">No Upcoming Tournaments</h2>
          <p className="text-gray-400 text-center max-w-md mb-6">
            We're planning exciting tournaments for the future. Check back soon or contact us to learn about upcoming events.
          </p>
          <Button
            variant="default"
            className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue"
            onClick={() => navigate('/booknow')}
          >
            Book a Session Instead
          </Button>
        </motion.div>
      )}
      
      <div className="mt-16 bg-gray-800/30 rounded-lg p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-cuephoria-purple" />
          Custom Tournament Requests
        </h2>
        <p className="text-gray-300 mb-4">
          Want to organize a private tournament for your group, company, or special event? 
          We offer custom tournament packages with personalized arrangements.
        </p>
        <div className="flex flex-wrap gap-4 mt-6">
          <Button 
            variant="outline" 
            className="border-purple-600/50 hover:bg-purple-900/20 text-purple-300"
            onClick={() => window.location.href = 'tel:+919876543210'}
          >
            Call for Inquiries
          </Button>
          <Button 
            variant="outline" 
            className="border-blue-600/50 hover:bg-blue-900/20 text-blue-300"
            onClick={() => window.location.href = 'mailto:contact@cuephoria.com'}
          >
            Email Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;
