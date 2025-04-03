
export type ExpenseCategory = 'rent' | 'utilities' | 'salary' | 'restock' | 'misc';
export type ExpenseFrequency = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: ExpenseFrequency;
  date: Date;
  isRecurring: boolean;
  notes?: string;
}

export interface BusinessSummary {
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyExpenses: Record<string, number>;
  categoryTotals: Array<{category: string, amount: number, percentage: number}>;
}
