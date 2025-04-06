
import React from 'react';
import { Match, Player, Tournament, MatchStatus, MatchStage } from '@/types/tournament.types';
import { Button } from '@/components/ui/button';
import { Check, Trophy, Calendar, Clock, AlertTriangle, Flag, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface TournamentMatchSectionProps {
  matches: Match[];
  players: Player[];
  updateMatchResult: (matchId: string, winnerId: string) => void;
  updateMatchSchedule: (matchId: string, date: string, time: string) => void;
  updateMatchStatus: (matchId: string, status: MatchStatus) => void;
  winner?: Player;
}

const TournamentMatchSection: React.FC<TournamentMatchSectionProps> = ({
  matches,
  players,
  updateMatchResult,
  updateMatchSchedule,
  updateMatchStatus,
  winner
}) => {
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null);
  const [editDate, setEditDate] = React.useState('');
  const [editTime, setEditTime] = React.useState('');
  
  const getPlayerName = (playerId: string) => {
    const player = players.find(player => player.id === playerId);
    return player ? player.name : 'Bye';
  };
  
  const handleOpenScheduleDialog = (match: Match) => {
    setSelectedMatchId(match.id);
    setEditDate(match.scheduledDate || '');
    setEditTime(match.scheduledTime || '');
  };
  
  const handleSaveSchedule = () => {
    if (selectedMatchId && editDate && editTime) {
      updateMatchSchedule(selectedMatchId, editDate, editTime);
      setSelectedMatchId(null);
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4 mr-1" />;
      case 'completed': return <Check className="h-4 w-4 mr-1" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  const getStageDisplayInfo = (stage: MatchStage) => {
    switch (stage) {
      case 'final':
        return {
          label: 'FINAL',
          color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
          icon: <Trophy className="h-4 w-4 mr-1" />
        };
      case 'semi_final':
        return {
          label: 'SEMI FINAL',
          color: 'bg-gradient-to-r from-purple-500 to-purple-700 text-white',
          icon: <Flag className="h-4 w-4 mr-1" />
        };
      case 'quarter_final':
        return {
          label: 'QUARTER FINAL',
          color: 'bg-gradient-to-r from-blue-500 to-blue-700 text-white',
          icon: <Flag className="h-4 w-4 mr-1" />
        };
      default:
        return {
          label: 'REGULAR MATCH',
          color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
          icon: null
        };
    }
  };

  // Group matches by stage
  const groupedMatches = React.useMemo(() => {
    // First, separate matches by stage
    const groups: { [key in MatchStage]?: Match[] } = {};
    
    // Make sure final is first, followed by semi-finals, then quarter-finals, then regular matches
    const displayOrder: MatchStage[] = ['final', 'semi_final', 'quarter_final', 'regular'];
    
    // Initialize all groups to ensure proper order
    displayOrder.forEach(stage => {
      groups[stage] = matches.filter(match => match.stage === stage);
    });
    
    return displayOrder.filter(stage => (groups[stage]?.length ?? 0) > 0);
  }, [matches]);

  const matchVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };
  
  const stageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  if (winner) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="p-6 text-center bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl shadow-lg"
      >
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ y: -50 }}
          animate={{ y: 0, rotate: [0, 15, -15, 0] }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Trophy className="h-24 w-24 text-yellow-500" />
        </motion.div>
        <motion.h3 
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Tournament Winner
        </motion.h3>
        <motion.p 
          className="text-2xl font-medium mt-4 text-yellow-800"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {winner.name}
        </motion.p>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-lg shadow-md text-white"
        >
          <p className="font-medium">
            Congratulations to {winner.name} for winning the tournament!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={stageVariants}
      className="space-y-12 bg-background"
    >
      {groupedMatches.map((stage, stageIndex) => {
        const stageMatches = matches.filter(match => match.stage === stage);
        if (stageMatches.length === 0) return null;
        
        const stageInfo = getStageDisplayInfo(stage);
        
        return (
          <motion.div 
            key={stage}
            variants={stageVariants}
            className="space-y-6 relative"
          >
            {stageInfo.label && (
              <motion.div 
                className="flex items-center justify-center mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Badge className={`text-md px-6 py-2 ${stageInfo.color} shadow-md`}>
                  {stageInfo.icon}
                  {stageInfo.label}
                </Badge>
              </motion.div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stageMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  custom={i}
                  variants={matchVariants}
                  className="h-full"
                >
                  <Card 
                    className={`
                      h-full 
                      transition-all 
                      duration-300 
                      hover:shadow-lg 
                      border-l-4 
                      bg-card 
                      ${match.status === 'cancelled' ? 'border-l-gray-400' : 
                        match.completed ? 'border-l-green-500' : 
                        'border-l-amber-500'}
                      relative 
                      overflow-hidden 
                      group
                    `}
                  >
                    {/* Subtle gradient overlay */}
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity 
                      bg-gradient-to-br from-primary to-secondary"
                    ></div>

                    <CardContent className="p-5 relative z-10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="font-medium flex items-center space-x-2">
                          <span className="px-2 py-1 bg-muted/20 rounded-md text-sm text-muted-foreground">
                            #{match.id.split('-')[1]}
                          </span>
                          {match.stage !== 'regular' && (
                            <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted/30 uppercase text-muted-foreground">
                              {match.stage.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div 
                          className={`
                            text-sm 
                            flex 
                            items-center 
                            ${match.status === 'completed' ? 'text-green-600' : 
                              match.status === 'cancelled' ? 'text-red-600' : 
                              'text-amber-600'}
                          `}
                        >
                          {getStatusIcon(match.status)}
                          {match.status === 'completed' ? (
                            `Winner: ${getPlayerName(match.winnerId || '')}`
                          ) : (
                            getStatusLabel(match.status)
                          )}
                        </div>
                      </div>
                      
                      {match.scheduledDate && match.scheduledTime && (
                        <div className="mt-3 flex items-center text-xs text-muted-foreground bg-muted/10 p-2 rounded">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(match.scheduledDate), 'dd MMM yyyy')}</span>
                          <Clock className="h-3 w-3 ml-3 mr-1" />
                          <span>{match.scheduledTime}</span>
                          {match.status !== 'cancelled' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="ml-1 h-5 text-xs p-0 hover:bg-transparent text-primary"
                              onClick={() => handleOpenScheduleDialog(match)}
                            >
                              (Edit)
                            </Button>
                          )}
                        </div>
                      )}
                      
                      <div 
                        className="
                          mt-5 
                          flex 
                          justify-between 
                          items-center 
                          bg-muted/10 
                          rounded-lg 
                          p-3 
                          shadow-sm 
                          border 
                          border-muted/20
                        "
                      >
                        <div 
                          className={`
                            flex-1 
                            text-center 
                            p-2 
                            font-medium 
                            rounded 
                            transition-colors 
                            ${match.status !== 'cancelled' && match.winnerId === match.player1Id 
                              ? 'bg-green-100/30 text-green-800' 
                              : 'text-foreground'}
                          `}
                        >
                          {getPlayerName(match.player1Id)}
                        </div>
                        <div 
                          className="
                            mx-2 
                            text-lg 
                            flex 
                            items-center 
                            justify-center 
                            w-8 
                            h-8 
                            rounded-full 
                            bg-muted/20
                          "
                        >
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div 
                          className={`
                            flex-1 
                            text-center 
                            p-2 
                            font-medium 
                            rounded 
                            transition-colors 
                            ${match.status !== 'cancelled' && match.winnerId === match.player2Id 
                              ? 'bg-green-100/30 text-green-800' 
                              : 'text-foreground'}
                          `}
                        >
                          {match.player2Id ? getPlayerName(match.player2Id) : (
                            <span className="text-muted-foreground italic">Bye</span>
                          )}
                        </div>
                      </div>
                      
                      {match.status === 'scheduled' && !match.completed && (
                        <>
                          <div className="mt-4">
                            <Select
                              onValueChange={(value) => updateMatchResult(match.id, value)}
                            >
                              <SelectTrigger className="bg-muted/10 border-muted/20">
                                <SelectValue placeholder="Select winner" />
                              </SelectTrigger>
                              <SelectContent>
                                {match.player1Id && (
                                  <SelectItem value={match.player1Id}>
                                    {getPlayerName(match.player1Id)}
                                  </SelectItem>
                                )}
                                {match.player2Id && (
                                  <SelectItem value={match.player2Id}>
                                    {getPlayerName(match.player2Id)}
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={() => updateMatchStatus(match.id, 'cancelled')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" /> Cancel Match
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {match.status === 'cancelled' && (
                        <div className="mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => updateMatchStatus(match.id, 'scheduled')}
                          >
                            <Calendar className="h-4 w-4 mr-2" /> Reschedule Match
                          </Button>
                        </div>
                      )}
                      
                      {match.nextMatchId && (
                        <div className="mt-3 text-xs text-muted-foreground text-center italic">
                          Winner advances to match #{match.nextMatchId.split('-')[1]}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}

      <Dialog open={!!selectedMatchId} onOpenChange={(open) => !open && setSelectedMatchId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Match Schedule</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="date" className="text-right">Date</label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="time" className="text-right">Time</label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatchId(null)}>Cancel</Button>
            <Button onClick={handleSaveSchedule}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default TournamentMatchSection;
