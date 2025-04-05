
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Shield, UserPlus, Trash2, Users, User, Clock, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
  position?: string;
  salary?: number;
  joiningDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

const StaffManagement: React.FC = () => {
  const [staffMembers, setStaffMembers] = useState<AdminUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPosition, setNewPosition] = useState('receptionist');
  const [newSalary, setNewSalary] = useState('');
  const [newJoiningDate, setNewJoiningDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newShiftStart, setNewShiftStart] = useState('9:00');
  const [newShiftEnd, setNewShiftEnd] = useState('17:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<AdminUser | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const { user, addStaffMember, getStaffMembers } = useAuth();
  const { toast } = useToast();

  const loadStaffMembers = async () => {
    if (!user?.isAdmin) return;
    
    try {
      const members = await getStaffMembers();
      
      // Enhance staff members with additional data
      // In a real application, this would come from the database
      const enhancedMembers = members.map(member => ({
        ...member,
        position: member.position || positionOptions[Math.floor(Math.random() * positionOptions.length)],
        salary: member.salary || Math.floor(Math.random() * 3000) + 2000,
        joiningDate: member.joiningDate || format(new Date(Date.now() - Math.floor(Math.random() * 10000000000)), 'yyyy-MM-dd'),
        shiftStart: member.shiftStart || '9:00',
        shiftEnd: member.shiftEnd || '17:00',
      }));
      
      setStaffMembers(enhancedMembers);
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
      const staffData = {
        position: newPosition,
        salary: parseFloat(newSalary),
        joiningDate: newJoiningDate,
        shiftStart: newShiftStart,
        shiftEnd: newShiftEnd,
      };
      
      const success = await addStaffMember(newUsername, newPassword, staffData);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Staff member added successfully',
        });
        setNewUsername('');
        setNewPassword('');
        setNewPosition('receptionist');
        setNewSalary('');
        setNewJoiningDate(format(new Date(), 'yyyy-MM-dd'));
        setNewShiftStart('9:00');
        setNewShiftEnd('17:00');
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

  const viewStaffDetails = (staff: AdminUser) => {
    setSelectedStaff(staff);
    setIsViewingDetails(true);
  };

  const positionOptions = ['receptionist', 'manager', 'cook', 'waiter', 'cleaner', 'security', 'technician', 'cashier'];

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
          <DialogContent className="bg-cuephoria-dark border border-cuephoria-lightpurple/30 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Staff Member</DialogTitle>
              <DialogDescription>
                Create login credentials and details for a new staff member
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <Shield className="h-4 w-4" />
                    Password
                  </Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Briefcase className="h-4 w-4" />
                  Position
                </Label>
                <Select 
                  value={newPosition} 
                  onValueChange={setNewPosition}
                >
                  <SelectTrigger className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-cuephoria-dark border-cuephoria-lightpurple/30">
                    {positionOptions.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <DollarSign className="h-4 w-4" />
                    Salary
                  </Label>
                  <Input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    placeholder="Enter salary"
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <Calendar className="h-4 w-4" />
                    Joining Date
                  </Label>
                  <Input
                    type="date"
                    value={newJoiningDate}
                    onChange={(e) => setNewJoiningDate(e.target.value)}
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <Clock className="h-4 w-4" />
                    Shift Start
                  </Label>
                  <Input
                    type="time"
                    value={newShiftStart}
                    onChange={(e) => setNewShiftStart(e.target.value)}
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                    <Clock className="h-4 w-4" />
                    Shift End
                  </Label>
                  <Input
                    type="time"
                    value={newShiftEnd}
                    onChange={(e) => setNewShiftEnd(e.target.value)}
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/30"
                  />
                </div>
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

        {/* Staff Details Dialog */}
        <Dialog open={isViewingDetails} onOpenChange={setIsViewingDetails}>
          <DialogContent className="bg-cuephoria-dark border border-cuephoria-lightpurple/30">
            <DialogHeader>
              <DialogTitle className="text-xl">Staff Details</DialogTitle>
            </DialogHeader>
            
            {selectedStaff && (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-2 mb-4">
                  <div className="w-20 h-20 rounded-full bg-cuephoria-lightpurple/20 flex items-center justify-center">
                    <User className="h-10 w-10 text-cuephoria-lightpurple" />
                  </div>
                  <h3 className="text-xl font-medium">{selectedStaff.username}</h3>
                  <span className="px-3 py-1 rounded-full bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple text-xs">
                    {selectedStaff.position?.charAt(0).toUpperCase() + selectedStaff.position?.slice(1)}
                  </span>
                </div>
                
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Position</TableCell>
                      <TableCell className="font-medium">{selectedStaff.position?.charAt(0).toUpperCase() + selectedStaff.position?.slice(1)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Salary</TableCell>
                      <TableCell className="font-medium">${selectedStaff.salary?.toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Joining Date</TableCell>
                      <TableCell className="font-medium">{selectedStaff.joiningDate}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Shift Hours</TableCell>
                      <TableCell className="font-medium">{selectedStaff.shiftStart} - {selectedStaff.shiftEnd}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-muted-foreground">Role</TableCell>
                      <TableCell className="font-medium">{selectedStaff.isAdmin ? "Administrator" : "Staff"}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                onClick={() => setIsViewingDetails(false)}
                className="bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Staff Members</h3>
          <ScrollArea className="h-[280px] rounded-md border border-cuephoria-lightpurple/20 p-4">
            {staffMembers.length > 0 ? (
              <div className="space-y-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                            <span className="font-medium text-sm">{staff.username}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{staff.position?.charAt(0).toUpperCase() + staff.position?.slice(1)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{staff.shiftStart} - {staff.shiftEnd}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewStaffDetails(staff)}
                            className="h-8 w-8 p-0 text-cuephoria-lightpurple hover:text-white hover:bg-cuephoria-lightpurple/20"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
