
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, ArrowRight, Gamepad2, Table2, Clock, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { convertFromSupabaseTournament } from '@/types/tournament.types';

const UpcomingTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('status', 'upcoming')
          .order('date', { ascending: true })
          .limit(3);
        
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
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-800 overflow-hidden shadow-xl hover:shadow-orange-900/20 transition-all duration-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Trophy className="h-5 w-5 mr-2 text-cuephoria-orange animate-pulse-soft" />
          Upcoming Tournaments
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-cuephoria-orange/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cuephoria-blue/10 rounded-full blur-3xl"></div>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner className="mr-2" />
              <span className="text-gray-400">Loading tournaments...</span>
            </div>
          ) : tournaments.length > 0 ? (
            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={container}
            >
              {tournaments.map((tournament) => (
                <motion.div
                  key={tournament.id}
                  className="p-4 rounded-lg border border-orange-700/50 bg-gradient-to-r from-orange-900/40 to-orange-800/30 hover:shadow-orange-900/20 hover:shadow-lg transition-all"
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center mr-4">
                        {tournament.gameType === 'PS5' ? (
                          <Gamepad2 className="h-5 w-5 text-orange-400" />
                        ) : (
                          <Table2 className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{tournament.name}</h3>
                        <div className="flex items-center text-xs text-gray-400 mt-1">
                          <span className="mr-2">
                            {tournament.gameType}{tournament.gameVariant ? ` - ${tournament.gameVariant}` : ''}
                            {tournament.gameTitle ? ` - ${tournament.gameTitle}` : ''}
                          </span>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                            {tournament.players?.length || 0} Players
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-xs mt-2">
                    <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                    <span className="text-gray-300">
                      {format(new Date(tournament.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="flex flex-col items-center justify-center p-8 text-gray-400 border border-dashed border-gray-700 rounded-lg"
              variants={item}
            >
              <Trophy className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-center">No upcoming tournaments</p>
              <p className="text-xs text-gray-500 mt-1 text-center">Check back soon for future events</p>
            </motion.div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gradient-to-r from-gray-800/80 to-gray-800/50 pt-3 pb-3">
        <Button 
          onClick={() => navigate('/tournaments')} 
          variant="default" 
          size="sm"
          className="w-full bg-gradient-to-r from-cuephoria-orange to-cuephoria-orange/70 hover:opacity-90 group"
        >
          View All Tournaments
          <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpcomingTournaments;
