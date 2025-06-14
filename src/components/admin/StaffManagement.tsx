
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, Users, User, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [currentEditStaff, setCurrentEditStaff] = useState<AdminUser | null>(null);
  const { user, addStaffMember, getStaffMembers, updateStaffMember, deleteStaffMember } = useAuth();
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
        resetForm();
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

  const handleEditStaff = (staff: AdminUser) => {
    setCurrentEditStaff(staff);
    setNewUsername(staff.username);
    setIsEditingStaff(true);
  };

  const handleUpdateStaff = async () => {
    if (!currentEditStaff) return;

    setIsLoading(true);
    try {
      const updatedData: Partial<AdminUser> = {
        username: newUsername,
      };

      const success = await updateStaffMember(currentEditStaff.id, updatedData);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Staff member updated successfully',
        });
        resetForm();
        setIsEditingStaff(false);
        loadStaffMembers(); // Refresh staff list
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update staff member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while updating staff member',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const success = await deleteStaffMember(id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Staff member deleted successfully',
        });
        loadStaffMembers(); // Refresh staff list
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete staff member',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while deleting staff member',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewPassword('');
    setCurrentEditStaff(null);
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
        {/* Add Staff Dialog */}
        <Dialog open={isAddingStaff} onOpenChange={(open) => {
          setIsAddingStaff(open);
          if (!open) resetForm();
        }}>
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
              {/* Basic Info - Only Username and Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <User className="h-4 w-4" />
                  Username*
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
                  Password*
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

        {/* Edit Staff Dialog */}
        <Dialog open={isEditingStaff} onOpenChange={(open) => {
          setIsEditingStaff(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="bg-cuephoria-dark border border-cuephoria-lightpurple/30">
            <DialogHeader>
              <DialogTitle className="text-xl">Edit Staff Member</DialogTitle>
              <DialogDescription>
                Update staff member details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Basic Info - Only Username */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <User className="h-4 w-4" />
                  Username*
                </label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingStaff(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStaff} 
                disabled={isLoading}
                className="bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
              >
                {isLoading ? 'Updating...' : 'Update Staff Member'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Staff Members</h3>
          <ScrollArea className="h-[320px] rounded-md border border-cuephoria-lightpurple/20 p-2">
            {staffMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>{staff.username}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEditStaff(staff)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
