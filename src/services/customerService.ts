
import { CustomerProfile, CustomerSession, LoyaltyTransaction } from '@/types/customer.types';

// Mock customer profile data
export const getCustomerProfile = async (customerId: string): Promise<CustomerProfile> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: customerId,
    name: "Demo User",
    phone: "555-555-5555",
    email: "demo@example.com",
    isMember: false,
    loyaltyPoints: 100,
    totalSpent: 23802.50, // In INR
    totalPlayTime: 360,
    createdAt: new Date(),
    referralCode: "DEMO123"
  };
};

// Mock customer session history
export const getCustomerSessions = async (customerId: string): Promise<CustomerSession[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      id: "session-1",
      stationId: "station-1",
      stationName: "PS5 Station 1",
      stationType: "ps5",
      startTime: yesterday,
      endTime: new Date(yesterday.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
      duration: 120, // 2 hours in minutes
      hourlyRate: 150, // ₹150 per hour
      totalCost: 300 // ₹300 total
    },
    {
      id: "session-2",
      stationId: "station-2",
      stationName: "8-Ball Table 3",
      stationType: "8ball",
      startTime: lastWeek,
      endTime: new Date(lastWeek.getTime() + 1.5 * 60 * 60 * 1000), // 1.5 hours later
      duration: 90, // 1.5 hours in minutes
      hourlyRate: 120, // ₹120 per hour
      totalCost: 180 // ₹180 total
    },
    {
      id: "session-3",
      stationId: "station-1",
      stationName: "PS5 Station 1",
      stationType: "ps5",
      startTime: now,
      hourlyRate: 150, // ₹150 per hour
      totalCost: 0 // Active session
    }
  ];
};

// Mock loyalty transactions
export const getLoyaltyTransactions = async (customerId: string): Promise<LoyaltyTransaction[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  return [
    {
      id: "trans-1",
      customer_id: customerId,
      points: 50,
      source: "purchase",
      description: "Food and drink purchase",
      created_at: now
    },
    {
      id: "trans-2",
      customer_id: customerId,
      points: 30,
      source: "reward",
      description: "Gameplay reward",
      created_at: yesterday
    },
    {
      id: "trans-3",
      customer_id: customerId,
      points: -20,
      source: "reward",
      description: "Redeemed for free drink",
      created_at: lastWeek
    },
    {
      id: "trans-4",
      customer_id: customerId,
      points: 100,
      source: "referral",
      description: "Friend referral bonus",
      created_at: lastWeek
    }
  ];
};
