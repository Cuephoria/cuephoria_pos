
import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

declare global {
  interface Window {
    Calendly?: any;
  }
}

const CustomerBooking: React.FC = () => {
  const { user } = useCustomerAuth();
  const calendarRef = useRef<HTMLDivElement>(null);

  // Initialize Calendly when component mounts
  useEffect(() => {
    // Load Calendly script if not already loaded
    const calendlyScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
    const calendlyCss = document.querySelector('link[href="https://assets.calendly.com/assets/external/widget.css"]');
    
    if (!calendlyScript) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
    
    if (!calendlyCss) {
      const link = document.createElement('link');
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    
    // Initialize Calendly embedded widget after script loads
    const initCalendly = () => {
      if (window.Calendly && calendarRef.current) {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/cuephoriaclub/60min?hide_gdpr_banner=1',
          parentElement: calendarRef.current,
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            customAnswers: {
              a1: user?.isMember ? 'Yes' : 'No',
              a2: user?.phone || ''
            }
          },
          utm: {
            utmSource: 'customer_portal'
          }
        });
      }
    };

    // Check if Calendly is already loaded, if not wait for script to load
    if (window.Calendly) {
      initCalendly();
    } else {
      const checkCalendlyInterval = setInterval(() => {
        if (window.Calendly) {
          initCalendly();
          clearInterval(checkCalendlyInterval);
        }
      }, 100);
      
      // Clear interval after 10 seconds if Calendly doesn't load
      setTimeout(() => clearInterval(checkCalendlyInterval), 10000);
    }
    
    return () => {
      // Clean up
      if (calendarRef.current) {
        calendarRef.current.innerHTML = '';
      }
    };
  }, [user]);

  return (
    <CustomerLayout>
      <Helmet>
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
        <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Session</h1>
          <p className="text-muted-foreground">
            Schedule your next game or practice session with ease
          </p>
        </div>
        
        {user?.isMember && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>Membership Active</CardTitle>
                  <CardDescription>
                    You have access to member benefits
                  </CardDescription>
                </div>
                <Badge variant="default" className="capitalize">
                  {user?.membershipPlan?.toLowerCase() || 'Premium'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Hours remaining</span>
                  <span className="text-xl font-semibold">{user?.membershipHoursLeft || 0} hrs</span>
                </div>
                
                <div className="sm:border-l sm:border-border sm:pl-4 flex flex-col">
                  <span className="text-muted-foreground">Valid until</span>
                  <span className="font-medium">
                    {user?.membershipExpiryDate?.toLocaleDateString('en-IN') || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {!user?.isMember && (
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Not a member yet</AlertTitle>
            <AlertDescription>
              Purchase a membership plan for reduced rates and exclusive benefits
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Schedule Your Visit</CardTitle>
            <CardDescription>
              Choose a date and time for your next game session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={calendarRef} 
              style={{ minHeight: '630px' }}
              className="calendly-inline-widget"
            ></div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerBooking;
