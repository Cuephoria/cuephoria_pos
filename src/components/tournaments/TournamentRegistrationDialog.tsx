
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Users, Calendar, IndianRupee } from 'lucide-react';

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

interface TournamentRegistrationDialogProps {
  tournament: TournamentStats;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TournamentRegistrationDialog({
  tournament,
  open,
  onOpenChange,
  onSuccess
}: TournamentRegistrationDialogProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.customerPhone.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return false;
    }

    // Basic phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }

    // Email validation if provided
    if (formData.customerEmail && formData.customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if user is already registered for this tournament
      const { data: existingRegistration, error: checkError } = await supabase
        .from('tournament_registrations')
        .select('id')
        .eq('tournament_id', tournament.id)
        .eq('customer_phone', formData.customerPhone.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing registration:', checkError);
        throw new Error('Failed to check existing registration');
      }

      if (existingRegistration) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this tournament",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Register for the tournament
      const { error: insertError } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournament.id,
          customer_name: formData.customerName.trim(),
          customer_phone: formData.customerPhone.trim(),
          customer_email: formData.customerEmail.trim() || null,
          entry_fee: 250,
          registration_source: 'public_website'
        });

      if (insertError) {
        console.error('Error registering for tournament:', insertError);
        throw new Error('Failed to register for tournament');
      }

      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: ''
      });

      onSuccess();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register for the tournament. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
            Register for Tournament
          </DialogTitle>
          <DialogDescription>
            Join "{tournament.name}" and compete for amazing prizes!
          </DialogDescription>
        </DialogHeader>

        {/* Tournament Details Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">{tournament.name}</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(tournament.date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              {tournament.total_registrations} / {tournament.max_players} registered
            </div>
            <div className="flex items-center">
              <IndianRupee className="w-4 h-4 mr-2" />
              Entry Fee: ₹250
            </div>
            {tournament.winner_prize && (
              <div className="flex items-center text-green-600">
                <Trophy className="w-4 h-4 mr-2" />
                Winner Prize: ₹{tournament.winner_prize}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Full Name *</Label>
            <Input
              id="customerName"
              placeholder="Enter your full name"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="customerPhone">Phone Number *</Label>
            <Input
              id="customerPhone"
              placeholder="Enter your 10-digit phone number"
              value={formData.customerPhone}
              onChange={(e) => handleInputChange('customerPhone', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Email Address (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="Enter your email address"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Entry fee of ₹250 will be collected at the venue. 
              We'll contact you with tournament details and payment instructions.
            </p>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Registering...' : 'Register Now'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
