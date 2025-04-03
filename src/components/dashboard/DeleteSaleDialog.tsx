
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bill } from '@/context/POSContext';
import { formatCurrency } from '@/components/ui/currency';

interface DeleteSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: Bill | null;
  onConfirm: (billId: string) => Promise<void>;
}

const DeleteSaleDialog: React.FC<DeleteSaleDialogProps> = ({
  open,
  onOpenChange,
  bill,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    if (bill) {
      await onConfirm(bill.id);
      onOpenChange(false);
    }
  };

  if (!bill) return null;

  const billDate = new Date(bill.createdAt);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Sale Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this sale? This action cannot be undone.
            <div className="mt-4 p-3 border rounded-md bg-muted">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{billDate.toLocaleDateString()} {billDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Amount:</span>
                <span className="font-semibold">{formatCurrency(bill.total)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Items:</span>
                <span>{bill.items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span className="capitalize">{bill.paymentMethod}</span>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSaleDialog;
