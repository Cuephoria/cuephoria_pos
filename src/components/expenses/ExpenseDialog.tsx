
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Expense } from '@/types/expense.types';
import ExpenseForm from './ExpenseForm';
import { PlusCircle } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { useToast } from '@/hooks/use-toast';

interface ExpenseDialogProps {
  expense?: Expense;
  children?: React.ReactNode;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ expense, children }) => {
  const [open, setOpen] = React.useState(false);
  const { addExpense, updateExpense } = useExpenses();
  const { toast } = useToast();

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Submitting expense data:', formData);
      
      // Convert Date object to ISO string for storage
      const expenseData = {
        ...formData,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date
      };
      
      let success = false;
      
      if (expense) {
        // Update existing expense
        success = await updateExpense({ ...expenseData, id: expense.id });
      } else {
        // Add new expense
        success = await addExpense(expenseData);
      }
      
      console.log('Expense operation result:', success);
      
      if (success) {
        setOpen(false);
        toast({
          title: expense ? 'Expense Updated' : 'Expense Added',
          description: expense ? 'The expense has been updated successfully.' : 'New expense has been added successfully.',
        });
      } else {
        toast({
          title: 'Operation Failed',
          description: `Failed to ${expense ? 'update' : 'add'} expense. Please check your input and try again.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in expense dialog submit:', error);
      toast({
        title: 'Error',
        description: `Failed to ${expense ? 'update' : 'add'} expense. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {expense 
              ? 'Update the expense details below.'
              : 'Fill in the details to add a new expense.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm 
          onSubmit={handleSubmit} 
          initialData={expense ? {
            ...expense,
            date: new Date(expense.date) // Convert ISO string back to Date for form
          } : undefined} 
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
