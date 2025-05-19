
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Terms and Conditions</DialogTitle>
          <DialogDescription>
            Last Updated: May 19, 2025
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
          <p>
            By accessing and using Cuephoria Gaming Lounge services, you acknowledge that you have read, 
            understood, and agree to be bound by these Terms and Conditions. If you do not agree with any 
            part of these terms, you may not use our services.
          </p>
          
          <h3 className="text-lg font-semibold">2. Membership</h3>
          <p>
            Cuephoria offers membership plans that provide special rates and benefits. Membership is subject 
            to the following conditions:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Membership is non-transferable and can only be used by the registered member</li>
            <li>Membership hours expire as specified in the purchased plan</li>
            <li>Cuephoria reserves the right to revoke membership for violation of lounge rules</li>
          </ul>
          
          <h3 className="text-lg font-semibold">3. Booking and Usage</h3>
          <p>
            All station bookings are subject to availability. We recommend booking in advance to ensure 
            availability of your preferred station. No-shows may result in forfeiture of pre-paid fees.
          </p>
          
          <h3 className="text-lg font-semibold">4. Conduct Policy</h3>
          <p>
            Customers must conduct themselves in a respectful manner. The following behaviors are prohibited:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Disruptive or offensive behavior</li>
            <li>Damage to equipment or facilities</li>
            <li>Consumption of outside food and beverages</li>
            <li>Smoking or vaping inside the premises</li>
          </ul>
          <p>Violation of these policies may result in removal from the premises without refund.</p>
          
          <h3 className="text-lg font-semibold">5. Payment and Refunds</h3>
          <p>
            All payments are processed securely. Refunds are only available in cases of equipment 
            malfunction or service unavailability. No refunds will be provided for unused time or 
            change of mind.
          </p>
          
          <h3 className="text-lg font-semibold">6. Liability</h3>
          <p>
            Cuephoria is not responsible for personal belongings left unattended. Customers are 
            responsible for any damage caused to equipment due to misuse.
          </p>
          
          <h3 className="text-lg font-semibold">7. Amendments</h3>
          <p>
            Cuephoria reserves the right to modify these Terms and Conditions at any time. 
            Changes will be effective upon posting to our website or premises.
          </p>
          
          <h3 className="text-lg font-semibold">8. Governing Law</h3>
          <p>
            These Terms and Conditions are governed by the laws of India. Any disputes shall be 
            subject to the exclusive jurisdiction of the courts in the respective state.
          </p>

          <p className="pt-4 italic text-gray-500">
            By using our services, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms and Conditions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
