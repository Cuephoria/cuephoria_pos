
export interface RedeemedReward {
  id: string;
  name: string;
  points: number;
  redemptionCode: string;
  redeemedAt: Date;
}

export interface ReferralData {
  code: string;
  referrals: number;
  pointsEarned: number;
}

export interface CustomerProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number;
  isMember: boolean;
  membershipPlan?: string;
  membershipExpiryDate?: Date;
  membershipStartDate?: Date;
  membershipHoursLeft?: number;
  resetPin?: string;
  referralCode?: string;
  referredByCode?: string;
  redeemedRewards?: RedeemedReward[];
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discountPercentage?: number;
  discountAmount?: number;
  code?: string;
  startsAt: Date;
  endsAt?: Date;
  isActive: boolean;
}
