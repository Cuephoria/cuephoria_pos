
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseReferralOptions {
  onSuccess?: (points: number) => void;
  onError?: (error: string) => void;
}

export function useReferral(options: UseReferralOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const applyReferralCode = async (referralCode: string, customerEmail: string) => {
    try {
      setIsProcessing(true);
      
      // First, find the customer with this referral code
      const { data: referrerData, error: referrerError } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('referral_code', referralCode)
        .single();
        
      if (referrerError || !referrerData) {
        toast({
          title: 'Invalid referral code',
          description: 'The referral code you entered does not exist',
          variant: 'destructive'
        });
        options.onError?.('Invalid referral code');
        return false;
      }
      
      // Find the new customer by email
      const { data: newCustomerData, error: newCustomerError } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('email', customerEmail)
        .single();
        
      if (newCustomerError || !newCustomerData) {
        toast({
          title: 'Error processing referral',
          description: 'Could not find your customer account',
          variant: 'destructive'
        });
        options.onError?.('Customer account not found');
        return false;
      }
      
      // Check if this referral has already been processed
      const { data: existingReferral, error: referralCheckError } = await supabase
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerData.customer_id)
        .eq('referred_email', customerEmail)
        .maybeSingle();
        
      if (existingReferral) {
        toast({
          title: 'Already processed',
          description: 'This referral has already been applied',
          variant: 'destructive'
        });
        options.onError?.('Referral already processed');
        return false;
      }
      
      // Create the referral record
      const { error: createReferralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerData.customer_id,
          referred_email: customerEmail,
          points_awarded: 100,
          status: 'completed'
        });
        
      if (createReferralError) {
        console.error('Error creating referral:', createReferralError);
        toast({
          title: 'Error processing referral',
          description: 'Could not create referral record',
          variant: 'destructive'
        });
        options.onError?.('Failed to create referral');
        return false;
      }
      
      // Update referrer's loyalty points
      const { error: updateReferrerError } = await supabase.rpc('award_referral_points', {
        customer_identifier: referrerData.customer_id,
        points_to_award: 100
      });
      
      if (updateReferrerError) {
        console.error('Error updating referrer points:', updateReferrerError);
        toast({
          title: 'Partial success',
          description: 'Referral recorded but points may not be awarded yet',
          variant: 'default'
        });
        options.onError?.('Points award failed');
        return false;
      }
      
      // Update new customer's points as well
      const { error: updateReferredError } = await supabase.rpc('award_referral_points', {
        customer_identifier: newCustomerData.customer_id,
        points_to_award: 50
      });
      
      if (updateReferredError) {
        console.error('Error updating referred points:', updateReferredError);
      }
      
      // Success!
      toast({
        title: 'Referral successful!',
        description: 'You and your friend have been awarded loyalty points',
      });
      options.onSuccess?.(50);
      return true;
    } catch (error) {
      console.error('Error in applyReferralCode:', error);
      toast({
        title: 'Error processing referral',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      options.onError?.(String(error));
      return false;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    applyReferralCode,
    isProcessing
  };
}
