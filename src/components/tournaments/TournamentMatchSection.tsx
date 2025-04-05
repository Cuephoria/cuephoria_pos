
import React from 'react';
import { Match, Player, Tournament, MatchStatus } from '@/types/tournament.types';
import { Button } from '@/components/ui/button';
import { Check, Trophy, Calendar, Clock, AlertTriangle } from 'lucide-react';
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
          <Card key={match.id} className={match.status === 'cancelled' ? 'bg-gray-100' : match.completed ? 'bg-gray-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="font-medium">Match #{match.id.split('-')[1]}</div>
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
            </CardContent>
          </Card>
        ))}
      </div>

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
