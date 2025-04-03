
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
import { Expense, ExpenseCategory, ExpenseFrequency } from '@/types/expense.types';
import ExpenseForm from './ExpenseForm';
import { PlusCircle } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { useToast } from '@/hooks/use-toast';

interface ExpenseDialogProps {
  expense?: Expense;
  children?: React.ReactNode;
}

// Define a consistent type for form data that matches what the form produces
export interface ExpenseFormData {
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: ExpenseFrequency;
  date: Date;
  isRecurring: boolean;
  notes?: string;
}

const ExpenseDialog: React.FC<ExpenseDialogProps> = ({ expense, children }) => {
  const [open, setOpen] = React.useState(false);
  const { addExpense, updateExpense } = useExpenses();
  const { toast } = useToast();

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      console.log('Submitting expense data:', data);
      
      let success = false;
      
      if (expense) {
        // Update existing expense
        success = await updateExpense({ ...data, id: expense.id });
      } else {
        // Add new expense
        success = await addExpense(data);
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
          initialData={expense} 
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
