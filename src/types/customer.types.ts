
export interface CustomerUser {
  id?: string;
  authId: string;
  customerId: string;
  email: string;
  referralCode: string;
  resetPin: string | null;
  pin: string | null;
  resetPinExpiry: Date | null;
  createdAt: Date;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  discountType: "percentage" | "fixed" | "free_hours";
  discountValue: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  pointsCost: number;
  isActive: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RewardRedemption {
  id: string;
  customerId: string;
  rewardId: string;
  pointsSpent: number;
  redemptionDate: Date;
  status: "pending" | "completed" | "cancelled";
  redemptionCode?: string;
  rewardName?: string;
}

export interface CustomerAuthContextType {
  session: { user: any } | null;
  user: { id: string; email: string } | null;
  customerUser: CustomerUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone: string, pin: string, referralCode?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  verifyPinAndResetPassword: (email: string, pin: string, newPassword?: string) => Promise<boolean>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}
