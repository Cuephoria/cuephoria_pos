
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
