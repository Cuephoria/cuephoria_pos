
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { Tournament, convertFromSupabaseTournament, convertToSupabaseTournament } from "@/types/tournament.types";
import { useToast } from '@/hooks/use-toast';

// Fetch all tournaments from Supabase
export const fetchTournaments = async (): Promise<Tournament[]> => {
  try {
    // Using type assertion to bypass TypeScript error
    const { data, error } = await (supabase
      .from('tournaments') as any)
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching tournaments:', error);
      return [];
    }
    
    return data.map(convertFromSupabaseTournament);
  } catch (error) {
    console.error('Unexpected error fetching tournaments:', error);
    return [];
  }
};

// Save a tournament to Supabase (create or update)
export const saveTournament = async (tournament: Tournament): Promise<Tournament | null> => {
  try {
    const supabaseTournament = convertToSupabaseTournament(tournament);
    
    // Check if the tournament already exists
    const { data: existingTournament } = await (supabase
      .from('tournaments') as any)
      .select('id')
      .eq('id', tournament.id)
      .single();
      
    let result;
    
    if (existingTournament) {
      // Update existing tournament
      const { data, error } = await (supabase
        .from('tournaments') as any)
        .update(supabaseTournament)
        .eq('id', tournament.id)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating tournament:', error);
        return null;
      }
      
      result = data;
    } else {
      // Create new tournament with created_at timestamp
      const { data, error } = await (supabase
        .from('tournaments') as any)
        .insert({ ...supabaseTournament, created_at: new Date().toISOString() })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating tournament:', error);
        return null;
      }
      
      result = data;
    }
    
    return convertFromSupabaseTournament(result);
  } catch (error) {
    console.error('Unexpected error saving tournament:', error);
    return null;
  }
};

// Delete a tournament from Supabase
export const deleteTournament = async (id: string): Promise<boolean> => {
  try {
    const { error } = await (supabase
      .from('tournaments') as any)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting tournament:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting tournament:', error);
    return false;
  }
};

// Custom hook for tournament operations with toast notifications
export const useTournamentOperations = () => {
  const { toast } = useToast();
  
  return {
    fetchTournaments: async () => {
      const tournaments = await fetchTournaments();
      if (tournaments.length === 0) {
        console.log("No tournaments found or error occurred");
      }
      return tournaments;
    },
    
    saveTournament: async (tournament: Tournament) => {
      const result = await saveTournament(tournament);
      if (result) {
        toast({
          title: "Success",
          description: `Tournament "${tournament.name}" ${tournament.id === result.id ? "updated" : "created"} successfully`,
        });
        return result;
      } else {
        toast({
          title: "Error",
          description: `Failed to save tournament "${tournament.name}"`,
          variant: "destructive"
        });
        return null;
      }
    },
    
    deleteTournament: async (id: string, name: string) => {
      const success = await deleteTournament(id);
      if (success) {
        toast({
          title: "Success",
          description: `Tournament "${name}" deleted successfully`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: `Failed to delete tournament "${name}"`,
          variant: "destructive"
        });
        return false;
      }
    }
  };
};
