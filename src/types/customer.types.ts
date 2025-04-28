
// Customer Portal Types

// Customer User type for authentication and profile management
export interface CustomerUser {
  id: string;
  authId: string | null;
  customerId: string | null;
  email: string;
  referralCode: string | null;
  resetPin: string | null;
  resetPinExpiry: Date | null;
  createdAt: Date;
}

// Reward type for loyalty rewards program
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Promotion type for special offers and discounts
export interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  discountType: 'percentage' | 'fixed' | 'free_hours';
  discountValue: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

// Loyalty Transaction type for tracking loyalty points
export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  points: number;
  source: 'purchase' | 'referral' | 'reward' | 'promotion' | 'admin';
  description?: string;
  createdAt: Date;
}

// Reward Redemption type for tracking reward redemptions
export interface RewardRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsSpent: number;
  redemptionDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  rewardName?: string;
}

// Customer Statistics type for dashboard data
export interface CustomerStatistics {
  totalPlayTime: number; // in minutes
  totalSpent: number;
  loyaltyPoints: number;
  membershipStatus: boolean;
  membershipExpiryDate?: Date;
  membershipHoursLeft?: number;
  sessionsCount: number;
  referralsCount: number;
}

// Customer Dashboard Data type for aggregated dashboard view
export interface CustomerDashboardData {
  statistics: CustomerStatistics;
  recentSessions: CustomerSession[];
  recentTransactions: LoyaltyTransaction[];
  activePromotions: Promotion[];
  availableRewards: Reward[];
}

// Customer Notification Settings
export interface NotificationSettings {
  email: boolean;
  promotions: boolean;
  rewards: boolean;
  tournaments: boolean;
  accountUpdates: boolean;
}

// Customer Session type
export interface CustomerSession {
  id: string;
  stationId: string;
  stationName?: string;
  stationType?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  hourlyRate?: number;
}

// Referral type for tracking referrals
export interface Referral {
  id: string;
  referrerId: string;
  referredEmail: string;
  status: 'pending' | 'completed' | 'expired';
  pointsAwarded: number;
  createdAt: Date;
  completedAt?: Date;
}
