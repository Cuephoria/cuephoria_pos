
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Phone, Mail, Clock } from 'lucide-react';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Contact Us</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-start space-x-4">
            <div className="bg-cuephoria-purple/20 p-2 rounded-full">
              <Phone className="h-5 w-5 text-cuephoria-purple" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Phone</h3>
              <p className="text-gray-600">+91 86376 25155</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-cuephoria-blue/20 p-2 rounded-full">
              <Mail className="h-5 w-5 text-cuephoria-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Email</h3>
              <p className="text-gray-600">contact@cuephoria.in</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-cuephoria-orange/20 p-2 rounded-full">
              <Clock className="h-5 w-5 text-cuephoria-orange" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Business Hours</h3>
              <p className="text-gray-600">11:00 AM - 11:00 PM</p>
              <p className="text-xs text-gray-500">Open 7 days a week</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Feel free to reach out to us with any questions or to make a reservation. 
              We aim to respond to all inquiries within 24 hours.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
