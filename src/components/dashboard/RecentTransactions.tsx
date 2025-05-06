
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Trash } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Receipt from '../Receipt';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePOS } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

const RecentTransactions = () => {
  const { bills, customers, deleteBill } = usePOS();
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Sort bills by date, most recent first
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleViewReceipt = (billId: string, customerId: string) => {
    setSelectedBillId(billId);
    setSelectedCustomerId(customerId);
    setIsReceiptOpen(true);
  };

  const handleDeleteClick = (billId: string, customerId: string) => {
    setBillToDelete(billId);
    setSelectedCustomerId(customerId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (billToDelete && selectedCustomerId) {
      await deleteBill(billToDelete, selectedCustomerId);
      setIsDeleteDialogOpen(false);
      setBillToDelete(null);
      setSelectedCustomerId(null);
    }
  };

  const handleCloseReceipt = () => {
    setIsReceiptOpen(false);
    setSelectedBillId(null);
    setSelectedCustomerId(null);
  };

  // Function to handle refreshing the component after bill updates
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Update key to force re-render
    setIsReceiptOpen(false); // Close receipt dialog
  };

  return (
    <Card key={refreshKey} className="col-span-12 lg:col-span-4 h-full flex flex-col">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden relative">
        <ScrollArea className="h-[calc(100%-1rem)] pr-4">
          <div className="space-y-4">
            {sortedBills.length > 0 ? (
              sortedBills.map((bill) => {
                const customer = customers.find(c => c.id === bill.customerId);
                const customerName = customer ? customer.name : "Unknown Customer";
                
                return (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                    <div className="flex-grow">
                      <div className="font-medium">{customerName}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN')} {' '}
                        {new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="font-semibold">
                        <CurrencyDisplay amount={bill.total} />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleViewReceipt(bill.id, bill.customerId)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteClick(bill.id, bill.customerId)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500">No transactions yet</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] flex flex-col p-0">
          {selectedBillId && (
            <Receipt 
              billId={selectedBillId} 
              customerId={selectedCustomerId}
              onClose={handleCloseReceipt}
              allowEdit={true}
              onRefresh={handleRefresh}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default RecentTransactions;
