
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Trash2, KeyRound } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Bill } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

const RecentTransactions: React.FC = () => {
  const { bills, customers, deleteBill } = usePOS();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Sort bills by date (newest first)
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get the 5 most recent transactions
  const recentBills = sortedBills.slice(0, 5);
  
  const handleDeleteClick = (bill: Bill) => {
    setBillToDelete(bill);
    setIsConfirmOpen(true);
  };
  
  const handlePasswordVerification = async () => {
    if (!billToDelete) return;
    if (!adminPassword.trim()) {
      toast({
        title: 'Password Required',
        description: 'Please enter the admin password to proceed',
        variant: 'destructive',
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Verify admin password against Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, password')
        .eq('is_admin', true)
        .single();
      
      if (error) {
        console.error('Error verifying admin:', error);
        toast({
          title: 'Authentication Error',
          description: 'Could not verify admin credentials',
          variant: 'destructive',
        });
        setIsVerifying(false);
        return;
      }
      
      if (data && data.password === adminPassword) {
        // Password is correct, proceed with deletion
        setIsPasswordDialogOpen(false);
        setAdminPassword('');
        handleConfirmDelete();
      } else {
        // Password is incorrect
        toast({
          title: 'Authentication Failed',
          description: 'Incorrect admin password',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in password verification:', error);
      toast({
        title: 'Authentication Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleConfirmPasswordCheck = () => {
    setIsConfirmOpen(false);
    setIsPasswordDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    
    setIsDeleting(true);
    const success = await deleteBill(billToDelete.id, billToDelete.customerId);
    setIsDeleting(false);
    
    if (success) {
      setIsConfirmOpen(false);
      setBillToDelete(null);
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
        variant: 'default',
      });
    }
  };
  
  return (
    <>
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
          <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentBills.length > 0 ? (
            recentBills.map(bill => {
              const customer = customers.find(c => c.id === bill.customerId);
              const date = new Date(bill.createdAt);
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-gray-400">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white font-semibold">
                      <CurrencyDisplay amount={bill.total} />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDeleteClick(bill)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <p>No transactions recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this transaction? This will revert the sale, 
              update inventory, and adjust customer loyalty points. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPasswordCheck}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-yellow-500" />
              Admin Authentication
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Please enter the admin password to delete this transaction
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-gray-700 border-gray-600"
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setAdminPassword('');
              }}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handlePasswordVerification}
              className="bg-red-600 hover:bg-red-700"
              disabled={isVerifying || !adminPassword.trim()}
            >
              {isVerifying ? "Verifying..." : "Verify & Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentTransactions;
