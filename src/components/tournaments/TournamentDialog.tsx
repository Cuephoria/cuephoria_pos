
import React, { useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Form, FormControl, FormField, FormItem, 
  FormLabel, FormMessage 
} from '@/components/ui/form';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tournament, GameType } from '@/types/tournament.types';
import { generateId } from '@/utils/pos.utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TournamentPlayerSection from './TournamentPlayerSection';
import TournamentMatchSection from './TournamentMatchSection';
import { CurrencyDisplay } from '../ui/currency';

interface TournamentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tournament: Tournament) => void;
  tournament: Tournament | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  gameType: z.enum(["PS5", "Pool"]),
  gameVariant: z.enum(["8 Ball", "Snooker"]).optional(),
  gameTitle: z.string().optional(),
  date: z.string(),
  budget: z.string().optional(),
  winnerPrize: z.string().optional(),
  runnerUpPrize: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const TournamentDialog: React.FC<TournamentDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  tournament
}) => {
  const [players, setPlayers] = React.useState<Tournament['players']>([]);
  const [matches, setMatches] = React.useState<Tournament['matches']>([]);
  const [activeTab, setActiveTab] = React.useState('details');
  const [winner, setWinner] = React.useState<Tournament['winner']>();
  const [tournamentStatus, setTournamentStatus] = React.useState<Tournament['status']>('upcoming');
  const [customGameTitle, setCustomGameTitle] = React.useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      gameType: 'PS5',
      gameTitle: 'FIFA',
      date: new Date().toISOString().split('T')[0],
      budget: '',
      winnerPrize: '',
      runnerUpPrize: '',
    },
  });

  useEffect(() => {
    if (tournament) {
      form.reset({
        name: tournament.name,
        gameType: tournament.gameType,
        gameVariant: tournament.gameVariant,
        gameTitle: tournament.gameTitle,
        date: tournament.date,
        budget: tournament.budget?.toString() || '',
        winnerPrize: tournament.winnerPrize?.toString() || '',
        runnerUpPrize: tournament.runnerUpPrize?.toString() || '',
      });
      setPlayers(tournament.players);
      setMatches(tournament.matches);
      setWinner(tournament.winner);
      setTournamentStatus(tournament.status);
      
      // Set customGameTitle state if the tournament has a custom game title
      const gameTitle = tournament.gameTitle;
      if (gameTitle && gameTitle !== 'FIFA' && gameTitle !== 'COD') {
        setCustomGameTitle(true);
      } else {
        setCustomGameTitle(false);
      }
    } else {
      form.reset({
        name: '',
        gameType: 'PS5',
        gameTitle: 'FIFA',
        date: new Date().toISOString().split('T')[0],
        budget: '',
        winnerPrize: '',
        runnerUpPrize: '',
      });
      setPlayers([]);
      setMatches([]);
      setWinner(undefined);
      setTournamentStatus('upcoming');
      setCustomGameTitle(false);
    }
  }, [tournament, open]);

  const gameType = form.watch('gameType');
  const gameTitle = form.watch('gameTitle');

  const handleSave = (values: FormValues) => {
    const savedTournament: Tournament = {
      id: tournament?.id || generateId(),
      name: values.name,
      gameType: values.gameType,
      ...(values.gameType === 'PS5' ? { gameTitle: values.gameTitle } : { gameVariant: values.gameVariant }),
      date: values.date,
      players: players,
      matches: matches,
      status: tournamentStatus,
      ...(winner && { winner }),
      ...(values.budget && { budget: parseFloat(values.budget) }),
      ...(values.winnerPrize && { winnerPrize: parseFloat(values.winnerPrize) }),
      ...(values.runnerUpPrize && { runnerUpPrize: parseFloat(values.runnerUpPrize) }),
    };
    
    onSave(savedTournament);
  };

  const handleGenerateMatches = () => {
    if (players.length < 2) return;
    
    // Simple round-robin tournament generation
    const generatedMatches: Tournament['matches'] = [];
    let matchId = 1;
    
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        generatedMatches.push({
          id: `match-${matchId++}`,
          round: 1, // All matches in round 1 for simplicity
          player1Id: players[i].id,
          player2Id: players[j].id,
          completed: false,
        });
      }
    }
    
    setMatches(generatedMatches);
    setTournamentStatus('in-progress');
  };

  const updateMatchResult = (matchId: string, winnerId: string) => {
    const updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { ...match, winnerId, completed: true } 
        : match
    );
    setMatches(updatedMatches);
    
    // Check if all matches are completed
    const allCompleted = updatedMatches.every(match => match.completed);
    if (allCompleted) {
      // Find player with most wins
      const winCounts: Record<string, number> = {};
      updatedMatches.forEach(match => {
        if (match.winnerId) {
          winCounts[match.winnerId] = (winCounts[match.winnerId] || 0) + 1;
        }
      });
      
      let maxWins = 0;
      let tournamentWinnerId = '';
      
      Object.entries(winCounts).forEach(([playerId, wins]) => {
        if (wins > maxWins) {
          maxWins = wins;
          tournamentWinnerId = playerId;
        }
      });
      
      if (tournamentWinnerId) {
        const winnerPlayer = players.find(p => p.id === tournamentWinnerId);
        if (winnerPlayer) {
          setWinner(winnerPlayer);
          setTournamentStatus('completed');
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tournament ? 'Edit Tournament' : 'Create Tournament'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="players" disabled={!open}>Players</TabsTrigger>
            <TabsTrigger value="matches" disabled={!open || players.length < 2}>Matches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tournament name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gameType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Game Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select game type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PS5">PS5</SelectItem>
                          <SelectItem value="Pool">Pool</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {gameType === 'PS5' && !customGameTitle && (
                  <FormField
                    control={form.control}
                    name="gameTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Title</FormLabel>
                        <div className="space-y-2">
                          <Select
                            onValueChange={(value) => {
                              if (value === "custom") {
                                setCustomGameTitle(true);
                                field.onChange("");
                              } else {
                                field.onChange(value);
                              }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select game title" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FIFA">FIFA</SelectItem>
                              <SelectItem value="COD">Call of Duty (COD)</SelectItem>
                              <SelectItem value="custom">Add Custom Game Title</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                
                {gameType === 'PS5' && customGameTitle && (
                  <FormField
                    control={form.control}
                    name="gameTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Game Title</FormLabel>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <FormControl className="flex-1">
                              <Input 
                                placeholder="Enter custom game title" 
                                {...field} 
                              />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setCustomGameTitle(false);
                                form.setValue("gameTitle", "FIFA");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                
                {gameType === 'Pool' && (
                  <FormField
                    control={form.control}
                    name="gameVariant"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Game Variant</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pool game variant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="8 Ball">8 Ball</SelectItem>
                            <SelectItem value="Snooker">Snooker</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-md font-medium mb-4">Tournament Finance</h3>
                  
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Budget (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter budget amount" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="winnerPrize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Winner Prize Money (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter prize for winner" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="runnerUpPrize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Runner-up Prize Money (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter prize for runner-up" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="players">
            <TournamentPlayerSection 
              players={players} 
              setPlayers={setPlayers}
              matchesExist={matches.length > 0} 
            />
          </TabsContent>
          
          <TabsContent value="matches">
            <TournamentMatchSection 
              matches={matches}
              players={players}
              updateMatchResult={updateMatchResult}
              winner={winner}
            />
            
            {matches.length === 0 && (
              <div className="mt-4 text-center">
                <Button onClick={handleGenerateMatches}>Generate Matches</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={form.handleSubmit(handleSave)}
            disabled={activeTab === 'players' && players.length < 2}
          >
            Save Tournament
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentDialog;
