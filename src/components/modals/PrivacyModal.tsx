
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription>
            Last Updated: May 19, 2025
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <p>
            At Cuephoria, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, and protect your personal information when you use our services.
          </p>
          
          <h3 className="text-lg font-semibold">1. Information We Collect</h3>
          <p>We may collect the following information:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Personal details such as name, phone number, and email address</li>
            <li>Membership information and preferences</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Usage data including station bookings and purchases</li>
            <li>CCTV footage for security purposes</li>
          </ul>
          
          <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Managing your membership and bookings</li>
            <li>Processing payments</li>
            <li>Communicating with you about our services</li>
            <li>Improving our services and customer experience</li>
            <li>Maintaining security of our premises</li>
            <li>Complying with legal obligations</li>
          </ul>
          
          <h3 className="text-lg font-semibold">3. Data Security</h3>
          <p>
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction. Our payment 
            processing is handled by secure third-party processors.
          </p>
          
          <h3 className="text-lg font-semibold">4. Data Retention</h3>
          <p>
            We retain your personal information only as long as necessary for the purposes 
            set out in this policy or as required by law.
          </p>
          
          <h3 className="text-lg font-semibold">5. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information where applicable</li>
            <li>Opt out of marketing communications</li>
          </ul>
          
          <h3 className="text-lg font-semibold">6. Cookies and Tracking</h3>
          <p>
            Our website may use cookies and similar technologies to enhance your browsing 
            experience and collect usage information.
          </p>
          
          <h3 className="text-lg font-semibold">7. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant 
            changes by posting a notice on our website or sending you an email.
          </p>
          
          <h3 className="text-lg font-semibold">8. Contact Us</h3>
          <p>
            If you have questions or concerns about this Privacy Policy, please contact us 
            at contact@cuephoria.in.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyModal;
