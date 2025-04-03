
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

  const handleSubmit = async (data: Omit<Expense, 'id'>) => {
    try {
      console.log('Submitting expense data:', data);
      
      // Ensure we have a proper Date object
      let dateObj: Date;
      
      if (data.date instanceof Date) {
        dateObj = data.date;
      } else if (data.date && typeof data.date === 'object' && data.date._type === 'Date') {
        // Handle serialized date object from form
        try {
          dateObj = new Date(data.date.value.iso);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (err) {
          console.error('Failed to parse date:', data.date);
          toast({
            title: 'Error',
            description: 'Invalid date format. Please select a valid date.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        try {
          dateObj = new Date(data.date as any);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date format');
          }
        } catch (err) {
          console.error('Failed to parse date:', data.date);
          toast({
            title: 'Error',
            description: 'Invalid date format. Please select a valid date.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      console.log('Valid date confirmed:', dateObj);
      
      // Create a clean data object with the correct date
      const cleanData = {
        ...data,
        date: dateObj
      };
      
      let success = false;
      
      if (expense) {
        // Update existing expense
        success = await updateExpense({ ...cleanData, id: expense.id });
      } else {
        // Add new expense
        success = await addExpense(cleanData);
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
