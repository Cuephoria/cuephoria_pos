
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import StaffManagement from '@/components/admin/StaffManagement';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings as SettingsIcon, Users, Shield } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  return (
    <div className="container p-4 mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Staff Management
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="mb-4 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-cuephoria-lightpurple" /> 
                <h3 className="text-lg font-medium">General Settings</h3>
              </div>
              <p className="text-muted-foreground">
                General settings will be available here.
              </p>
            </div>
          </div>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="staff" className="space-y-4">
            <div className="grid gap-4">
              <StaffManagement />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
