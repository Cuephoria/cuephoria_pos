
import { useState, useEffect, useMemo } from 'react';
import { Bill, Customer, Product } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const useDashboardData = () => {
  const [dashboardBills, setDashboardBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch only the needed fields from bills for dashboard display
  const loadDashboardBills = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Optimize by limiting and only selecting required fields
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('id, created_at, total, subtotal, discount, discount_value, discount_type, loyalty_points_used, loyalty_points_earned, customer_id, payment_method, is_split_payment, cash_amount, upi_amount')
        .order('created_at', { ascending: false })
        .limit(100); // Limit to the most recent 100 bills for dashboard calculations
      
      if (billsError) {
        throw new Error(`Bills fetch error: ${billsError.message}`);
      }
      
      // Transform bills data (simplified for dashboard needs)
      const transformedBills = billsData.map((bill: any) => ({
        id: bill.id,
        createdAt: new Date(bill.created_at),
        total: bill.total,
        subtotal: bill.subtotal,
        discount: bill.discount,
        discountValue: bill.discount_value,
        discountType: bill.discount_type,
        loyaltyPointsUsed: bill.loyalty_points_used,
        loyaltyPointsEarned: bill.loyalty_points_earned,
        customerId: bill.customer_id,
        paymentMethod: bill.payment_method,
        isSplitPayment: bill.is_split_payment,
        cashAmount: bill.cash_amount,
        upiAmount: bill.upi_amount,
        // Simplified items array for dashboard (will be populated if needed later)
        items: []
      })) as Bill[];
      
      console.log(`Loaded ${transformedBills.length} bills for dashboard`);
      setDashboardBills(transformedBills);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading dashboard data'));
      toast.error('Loading Error', {
        description: 'Failed to load sales data',
        duration: 4000
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadDashboardBills();
    
    // Set up refresh trigger when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardBills();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Optional: periodic refresh (consider if needed)
    // const refreshInterval = setInterval(loadDashboardBills, 300000); // 5 minutes
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // clearInterval(refreshInterval);
    };
  }, []);
  
  // Memoize recent transactions for display
  const recentTransactions = useMemo(() => {
    return dashboardBills.slice(0, 5); // Only the 5 most recent
  }, [dashboardBills]);
  
  // Calculate total sales (memoized for performance)
  const calculateTotalSales = (period: 'daily' | 'weekly' | 'monthly' | 'hourly') => {
    const now = new Date();
    let startDate = new Date();
    
    if (period === 'hourly') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'daily') {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'monthly') {
      startDate = new Date(startDate.getFullYear(), 0, 1);
    }
    
    const filteredBills = dashboardBills.filter(bill => {
      const billDate = bill.createdAt;
      return billDate >= startDate && billDate <= now;
    });
    
    return filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  };
  
  // Generate chart data based on period
  const generateChartData = (period: 'daily' | 'weekly' | 'monthly' | 'hourly') => {
    if (period === 'hourly') {
      // Generate hourly chart data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const hourlyTotals = new Map();
      
      dashboardBills.forEach(bill => {
        const billDate = bill.createdAt;
        
        if (billDate >= today) {
          const hour = billDate.getHours();
          const current = hourlyTotals.get(hour) || 0;
          hourlyTotals.set(hour, current + bill.total);
        }
      });
      
      return hours.map(hour => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const formattedHour = `${hour12}${ampm}`;
        
        return {
          name: formattedHour,
          amount: hourlyTotals.get(hour) || 0
        };
      });
    } else if (period === 'daily') {
      // Generate daily chart data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dailyTotals = new Map();
      
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      
      dashboardBills.forEach(bill => {
        const billDate = bill.createdAt;
        if (billDate >= weekStart) {
          const day = days[billDate.getDay()];
          const current = dailyTotals.get(day) || 0;
          dailyTotals.set(day, current + bill.total);
        }
      });
      
      return days.map(day => ({
        name: day,
        amount: dailyTotals.get(day) || 0
      }));
    } else if (period === 'weekly') {
      const weeks = [];
      const now = new Date();
      
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
        
        weeks.push({
          start: weekStart,
          end: weekEnd,
          label: weekLabel
        });
      }
      
      return weeks.map(week => {
        const weeklyTotal = dashboardBills.reduce((sum, bill) => {
          const billDate = bill.createdAt;
          if (billDate >= week.start && billDate <= week.end) {
            return sum + bill.total;
          }
          return sum;
        }, 0);
        
        return {
          name: week.label,
          amount: weeklyTotal
        };
      });
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyTotals = new Map();
      
      dashboardBills.forEach(bill => {
        const billDate = bill.createdAt;
        const month = months[billDate.getMonth()];
        const current = monthlyTotals.get(month) || 0;
        monthlyTotals.set(month, current + bill.total);
      });
      
      return months.map(month => ({
        name: month,
        amount: monthlyTotals.get(month) || 0
      }));
    }
  };

  return {
    dashboardBills,
    isLoading,
    error,
    recentTransactions,
    calculateTotalSales,
    generateChartData,
    refreshData: loadDashboardBills
  };
};
