
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, DollarSign, Calendar, Users } from 'lucide-react';
import { Tournament } from '@/types/tournament.types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TournamentRegistrationDialogProps {
  tournament: Tournament;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrationSuccess: () => void;
}

const TournamentRegistrationDialog: React.FC<TournamentRegistrationDialogProps> = ({
  tournament,
  open,
  onOpenChange,
  onRegistrationSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and phone number are required',
        variant: 'destructive'
      });
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive'
      });
      return;
    }

    // Basic email validation if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
          variant: 'destructive'
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Check if user is already registered for this tournament
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_public_registrations')
        .select('id')
        .eq('tournament_id', tournament.id)
        .eq('customer_phone', formData.phone)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing registration:', checkError);
        throw new Error('Failed to check existing registration');
      }

      if (existingRegistration) {
        toast({
          title: 'Already Registered',
          description: 'You are already registered for this tournament',
          variant: 'destructive'
        });
        return;
      }

      // Register for tournament
      const { error: insertError } = await supabase
        .from('tournament_public_registrations')
        .insert({
          tournament_id: tournament.id,
          customer_name: formData.name.trim(),
          customer_phone: formData.phone.trim(),
          customer_email: formData.email.trim() || null,
          entry_fee: 250, // Default entry fee
          status: 'registered',
          registration_source: 'public_website'
        });

      if (insertError) {
        console.error('Error registering for tournament:', insertError);
        throw new Error('Failed to register for tournament');
      }

      // Reset form
      setFormData({ name: '', phone: '', email: '' });
      onRegistrationSuccess();

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'Failed to register for tournament',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl text-white flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-cuephoria-yellow" />
            Register for Tournament
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Join the {tournament.name} tournament and compete for amazing prizes!
          </DialogDescription>
        </DialogHeader>

        {/* Tournament Details */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-white mb-3">{tournament.name}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center text-gray-300">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(tournament.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-gray-300">
              <Users className="mr-2 h-4 w-4" />
              {tournament.gameType} {tournament.gameVariant && `- ${tournament.gameVariant}`}
            </div>
            {tournament.winnerPrize && (
              <div className="flex items-center text-cuephoria-yellow">
                <DollarSign className="mr-2 h-4 w-4" />
                Winner: ₹{tournament.winnerPrize.toLocaleString()}
              </div>
            )}
            <div className="flex items-center text-green-400">
              <DollarSign className="mr-2 h-4 w-4" />
              Entry Fee: ₹250
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
            <div className="text-yellow-800 text-sm">
              <strong>Important:</strong> Entry fee of ₹250 is payable at the venue before the tournament starts.
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Now'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TournamentRegistrationDialog;
