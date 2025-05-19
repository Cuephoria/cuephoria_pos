
import React from 'react';
import { Phone, Mail, Clock } from 'lucide-react';

const ContactContent: React.FC = () => {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h2>Contact Us</h2>
      
      <p className="mb-6">We'd love to hear from you! Feel free to reach out using any of the methods below.</p>
      
      <div className="space-y-6">
        <div className="flex items-start">
          <Phone className="h-5 w-5 text-cuephoria-purple mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Phone</h3>
            <p className="text-gray-300">+91 86376 25155</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Mail className="h-5 w-5 text-cuephoria-purple mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Email</h3>
            <p className="text-gray-300">
              <a href="mailto:contact@cuephoria.in" className="text-cuephoria-lightpurple hover:underline">
                contact@cuephoria.in
              </a>
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-cuephoria-purple mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Hours of Operation</h3>
            <p className="text-gray-300">11:00 AM - 11:00 PM</p>
            <p className="text-gray-400 text-sm">Open 7 days a week</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-3">Send Us a Message</h3>
        <p className="text-gray-300 mb-4">
          Visit our official website at <a href="https://cuephoria.in" target="_blank" rel="noopener noreferrer" className="text-cuephoria-lightpurple hover:underline">cuephoria.in</a> to send us a message through our contact form.
        </p>
      </div>
    </div>
  );
};

export default ContactContent;
