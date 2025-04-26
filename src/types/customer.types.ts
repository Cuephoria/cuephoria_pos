
// Customer portal types

// Customer user type definition
export interface CustomerUser {
  id: string;
  email: string;
  auth_id?: string;
  customer_id: string;
  referral_code: string;
  reset_pin?: string;
  reset_pin_expiry?: Date;
  created_at: Date;
}

// Loyalty transaction type
export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number;
  source: 'purchase' | 'referral' | 'reward' | 'promotion' | 'admin';
  description: string;
  created_at: Date;
}

// Reward type
export interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  image?: string;
  active: boolean;
  created_at: Date;
}

// Promotion type
export interface Promotion {
  id: string;
  name: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  code: string;
  start_date: Date;
  end_date: Date;
  active: boolean;
  created_at: Date;
}

// Referral type
export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'completed';
  points_awarded: number;
  created_at: Date;
}

// Promotion validation response
export interface PromotionValidationResponse {
  valid: boolean;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  message: string;
}

// Customer Profile data
export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isMember: boolean;
  membershipExpiryDate?: Date;
  membershipStartDate?: Date;
  membershipPlan?: string;
  membershipHoursLeft?: number;
  membershipDuration?: 'weekly' | 'monthly';
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number;
  createdAt: Date;
  referralCode: string;
}

// Customer session history
export interface CustomerSession {
  id: string;
  stationId: string;
  stationName: string;
  stationType: 'ps5' | '8ball';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  hourlyRate: number;
  totalCost: number;
}

// Customer game statistics
export interface GameStats {
  averageScore: number;
  winRate: number;
  accuracy: number;
  recentGames: RecentGame[];
}

// Recent game activity
export interface RecentGame {
  id: string;
  type: 'Pool Match' | 'Practice Session' | 'Tournament';
  result: string;
  duration: number;
  date: Date;
}

// Customer auth context type
export interface CustomerAuthContextType {
  customerUser: CustomerUser | null;
  customerProfile: CustomerProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, phone: string, pin: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string, pin: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  updateProfile: (profile: Partial<CustomerProfile>) => Promise<boolean>;
  verifyPin: (email: string, pin: string) => Promise<boolean>;
  generatePin: (email: string) => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}
