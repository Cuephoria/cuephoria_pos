
import { Referral } from '@/types/customer.types';

// Mock referrals
export const getCustomerReferrals = async (customerId: string): Promise<Referral[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      id: "ref-1",
      referrer_id: customerId,
      referred_id: "cust-referred-1",
      status: "completed",
      points_awarded: 100,
      created_at: lastMonth
    },
    {
      id: "ref-2",
      referrer_id: customerId,
      referred_id: "cust-referred-2",
      status: "pending",
      points_awarded: 0,
      created_at: now
    }
  ];
};

// Mock referral creation
export const createReferral = async (referrerId: string, referredEmail: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful referral creation
  return true;
};

// Mock type for referred friend data
interface ReferredFriend {
  customer_id: string;
  name: string;
  email?: string;
  status: "pending" | "completed";
  joinDate: Date;
  pointsAwarded: number;
}

// Mock referred friends data
export const getReferredFriends = async (customerId: string): Promise<ReferredFriend[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  return [
    {
      customer_id: "cust-referred-1",
      name: "John Doe",
      email: "john.doe@example.com",
      status: "completed",
      joinDate: lastMonth,
      pointsAwarded: 100
    },
    {
      customer_id: "cust-referred-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "pending",
      joinDate: now,
      pointsAwarded: 0
    }
  ];
};
