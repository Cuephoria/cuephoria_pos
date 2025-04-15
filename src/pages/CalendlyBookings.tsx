
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Calendar, Settings } from 'lucide-react';
import { useCalendlyEvents } from '@/services/calendlyService';
import CalendlyBookings from '@/components/calendly/CalendlyBookings';
import CalendlyStats from '@/components/calendly/CalendlyStats';
import CalendlySettings from '@/components/calendly/CalendlySettings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CalendlyBookingsPage: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [token, setToken] = useLocalStorage<string>('calendly-token', '');
  const [organizationUri, setOrganizationUri] = useLocalStorage<string>(
    'calendly-org-uri',
    ''
  );

  const { events, stats, loading, error, refetch } = useCalendlyEvents(
    token,
    organizationUri
  );
  
  const isConfigured = !!token && !!organizationUri;

  const handleSaveSettings = (newToken: string, newOrgUri: string) => {
    setToken(newToken);
    setOrganizationUri(newOrgUri);
    setIsSettingsOpen(false);
    
    // Refetch data after settings change
    setTimeout(refetch, 500);
  };

  useEffect(() => {
    // Show settings dialog if not configured
    if (!isConfigured) {
      setIsSettingsOpen(true);
    }
  }, [isConfigured]);

  return (
    <div className="p-6 space-y-6 bg-[#1A1F2C] min-h-screen text-white">
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-8 w-8 text-cuephoria-purple" />
          <h1 className="text-4xl font-bold">Calendly Bookings</h1>
        </div>
        
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Calendly Integration Settings</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CalendlySettings
                token={token}
                organizationUri={organizationUri}
                onSave={handleSaveSettings}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Stats Section */}
      <div className="space-y-6">
        <CalendlyStats stats={stats} loading={loading} />
        
        {/* Bookings Table */}
        <CalendlyBookings
          events={events}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
};

export default CalendlyBookingsPage;
