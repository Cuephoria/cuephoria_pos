
import { Reward } from '@/types/customer.types';

// Mock rewards with INR currency
export const getAvailableRewards = async (customerId: string): Promise<Reward[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: "reward-1",
      name: "Free Drink",
      description: "Redeem for a free soft drink",
      points_required: 50,
      image: "/lovable-uploads/1ce327a1-4c4e-4a4f-9887-ca76023e50e9.png",
      active: true,
      created_at: new Date()
    },
    {
      id: "reward-2",
      name: "Free Hour of Play",
      description: "Redeem for a free hour on any gaming station",
      points_required: 100,
      image: "/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png",
      active: true,
      created_at: new Date()
    },
    {
      id: "reward-3",
      name: "₹200 Discount Voucher",
      description: "Get ₹200 off on your next visit",
      points_required: 200,
      active: true,
      created_at: new Date()
    },
    {
      id: "reward-4",
      name: "Free Coaching Session",
      description: "One free 30-minute coaching session with our pros",
      points_required: 300,
      active: true,
      created_at: new Date()
    }
  ];
};

// Mock reward redemption
export const redeemReward = async (customerId: string, rewardId: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful redemption
  return true;
};
