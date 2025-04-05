
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, Users, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

const StaffManagement: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<AdminUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const { user, addStaffMember, getStaffMembers } = useAuth();
  const { toast } = useToast();

  const loadStaffMembers = async () => {
    if (!user?.isAdmin) return;
    
    try {
      const members = await getStaffMembers();
      setStaffMembers(members);
    } catch (error) {
      console.error('Failed to load staff members', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadStaffMembers();
  }, [user]);

  const handleAddStaff = async () => {
    if (!newUsername || !newPassword) {
      toast({
        title: 'Error',
        description: 'Please provide both username and password',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const success = await addStaffMember(newUsername, newPassword);
      if (success) {
        toast({
          title: 'Success',
          description: 'Staff member added successfully',
        });
        setNewUsername('');
        setNewPassword('');
        setIsAddingStaff(false);
        loadStaffMembers(); // Refresh staff list
      } else {
        toast({
          title: 'Error',
          description: 'Failed to add staff member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while adding staff member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Only admins can access this component
  if (!user?.isAdmin) {
    return (
      <Card className="border border-cuephoria-lightpurple/30 shadow-md">
        <CardContent className="pt-6">
          <Alert className="bg-cuephoria-dark/50 border-cuephoria-orange/30">
            <Shield className="h-4 w-4 text-cuephoria-orange" />
            <AlertTitle>Access Restricted</AlertTitle>
            <AlertDescription>
              Only administrators can manage staff accounts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-cuephoria-lightpurple/30 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5 text-cuephoria-lightpurple" />
          Staff Management
        </CardTitle>
        <CardDescription>
          Add and manage staff accounts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Dialog open={isAddingStaff} onOpenChange={setIsAddingStaff}>
          <DialogTrigger asChild>
            <Button 
              className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cuephoria-dark border border-cuephoria-lightpurple/30">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create login credentials for a new staff member
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <User className="h-4 w-4" />
                  Username
                </label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Shield className="h-4 w-4" />
                  Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingStaff(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddStaff} 
                disabled={isLoading}
                className="bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
              >
                {isLoading ? 'Adding...' : 'Add Staff Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Staff Members</h3>
          <ScrollArea className="h-[220px] rounded-md border border-cuephoria-lightpurple/20 p-4">
            {staffMembers.length > 0 ? (
              <div className="space-y-3">
                {staffMembers.map((staff) => (
                  <div 
                    key={staff.id}
                    className="flex items-center justify-between p-2 rounded-md bg-cuephoria-darker/50 border border-cuephoria-lightpurple/10"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                      <span className="font-medium text-sm">{staff.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Users className="h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">No staff members yet</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffManagement;
