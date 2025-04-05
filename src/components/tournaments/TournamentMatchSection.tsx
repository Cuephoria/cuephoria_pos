
import React from 'react';
import { Match, Player, Tournament, MatchStatus, MatchStage } from '@/types/tournament.types';
import { Button } from '@/components/ui/button';
import { Check, Trophy, Calendar, Clock, AlertTriangle, Flag } from 'lucide-react';
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
    return players.find(player => player.id === playerId)?.name || 'Unknown';
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
          color: 'bg-yellow-500 text-white hover:bg-yellow-600',
          icon: <Trophy className="h-4 w-4 mr-1" />
        };
      case 'semi_final':
        return {
          label: 'SEMI FINAL',
          color: 'bg-purple-500 text-white hover:bg-purple-600',
          icon: <Flag className="h-4 w-4 mr-1" />
        };
      case 'quarter_final':
        return {
          label: 'QUARTER FINAL',
          color: 'bg-blue-500 text-white hover:bg-blue-600',
          icon: <Flag className="h-4 w-4 mr-1" />
        };
      default:
        return {
          label: '',
          color: '',
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
    
    return displayOrder.filter(stage => groups[stage]?.length);
  }, [matches]);

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
    <div className="space-y-8">
      {groupedMatches.map((stage) => {
        const stageMatches = matches.filter(match => match.stage === stage);
        if (stageMatches.length === 0) return null;
        
        const stageInfo = getStageDisplayInfo(stage);
        
        return (
          <div key={stage} className="space-y-2">
            {stageInfo.label && (
              <div className="flex items-center justify-center mb-4">
                <Badge className={`text-md px-4 py-1 ${stageInfo.color}`}>
                  {stageInfo.icon}
                  {stageInfo.label}
                </Badge>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stageMatches.map((match) => (
                <Card key={match.id} className={match.status === 'cancelled' ? 'bg-gray-100' : match.completed ? 'bg-gray-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">
                        Match #{match.id.split('-')[1]}
                        {match.stage !== 'regular' && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-200">
                            {match.stage.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className={`text-sm flex items-center ${
                        match.status === 'completed' ? 'text-green-600' : 
                        match.status === 'cancelled' ? 'text-red-600' : 
                        'text-amber-600'
                      }`}>
                        {getStatusIcon(match.status)}
                        {match.status === 'completed' ? (
                          `Winner: ${getPlayerName(match.winnerId || '')}`
                        ) : (
                          getStatusLabel(match.status)
                        )}
                      </div>
                    </div>
                    
                    {match.scheduledDate && match.scheduledTime && (
                      <div className="mt-2 flex items-center text-xs text-gray-600">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(match.scheduledDate), 'dd MMM yyyy')}</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>{match.scheduledTime}</span>
                        {match.status !== 'cancelled' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-1 h-5 text-xs p-0 hover:bg-transparent"
                            onClick={() => handleOpenScheduleDialog(match)}
                          >
                            (Edit)
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-between items-center">
                      <div className={`flex-1 text-center p-2 ${match.status !== 'cancelled' && match.winnerId === match.player1Id ? 'bg-green-100 rounded' : ''}`}>
                        {getPlayerName(match.player1Id)}
                      </div>
                      <div className="mx-2 text-lg">vs</div>
                      <div className={`flex-1 text-center p-2 ${match.status !== 'cancelled' && match.winnerId === match.player2Id ? 'bg-green-100 rounded' : ''}`}>
                        {getPlayerName(match.player2Id)}
                      </div>
                    </div>
                    
                    {match.status === 'scheduled' && !match.completed && (
                      <>
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
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateMatchStatus(match.id, 'cancelled')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" /> Cancel Match
                          </Button>
                        </div>
                      </>
                    )}
                    
                    {match.status === 'cancelled' && (
                      <div className="mt-2">
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
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Winner advances to match #{match.nextMatchId.split('-')[1]}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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
    </div>
  );
};

export default TournamentMatchSection;
