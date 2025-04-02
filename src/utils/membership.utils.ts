
import { MembershipTier, MembershipBenefits } from '@/types/pos.types';

// Membership benefits data based on the provided image
export const membershipBenefits: Record<MembershipTier, MembershipBenefits> = {
  none: {
    name: 'Non-Member',
    weeklyPlayTime: 0,
    maxHoursPerDay: 0,
    priorityBooking: false,
    freeMetaShotChallenges: 0,
    bonusPasses: 0,
    psGamesAccess: false,
    studentDiscount: false,
    price: 0,
    originalPrice: 0,
    creditHours: 0,
    specialOffers: []
  },
  basic: {
    name: 'Introductory Weekly Pass - 8 ball (2 Pax)',
    weeklyPlayTime: 4,
    maxHoursPerDay: 1,
    priorityBooking: true,
    freeMetaShotChallenges: 1,
    bonusPasses: 2,
    psGamesAccess: false,
    studentDiscount: true,
    price: 399,
    originalPrice: 599,
    creditHours: 4,
    specialOffers: [
      'Flat 50% on Weekly Pass', 
      'Buy 1 Get 2 Passes', 
      'Special Member Cue* Subject to availability',
      '1 MetaShot Challenge for free',
      'Save 1000rs',
      'Flat 100rs off for students weekly pass'
    ]
  },
  standard: {
    name: 'Introductory Weekly Pass - 8 Ball (4 Pax)',
    weeklyPlayTime: 4,
    maxHoursPerDay: 1,
    priorityBooking: true,
    freeMetaShotChallenges: 2,
    bonusPasses: 4,
    psGamesAccess: false,
    studentDiscount: true,
    price: 599,
    originalPrice: 1199, 
    creditHours: 4,
    specialOffers: [
      'Flat 50% on Weekly Pass', 
      'Buy 1 Get 4 Passes', 
      'Special Member Cue* Subject to availability',
      '2 MetaShot Challenge for free',
      'Save 1000rs',
      'Flat 100rs off for students weekly pass'
    ]
  },
  premium: {
    name: 'Introductory Weekly Pass - PS5 Gaming',
    weeklyPlayTime: 4,
    maxHoursPerDay: 1,
    priorityBooking: true,
    freeMetaShotChallenges: 1,
    bonusPasses: 2,
    psGamesAccess: true,
    studentDiscount: true,
    price: 399,
    originalPrice: 599,
    creditHours: 4,
    specialOffers: [
      'Flat 50% on Weekly Pass', 
      'Buy 1 Get 2 Joysticks', 
      'Access to PS Plus Games',
      '1 MetaShot Challenge for free',
      'Flat 100rs off for students pass'
    ]
  },
  combo: {
    name: 'Introductory Weekly Pass - Combo',
    weeklyPlayTime: 6,
    maxHoursPerDay: 2,
    priorityBooking: true,
    freeMetaShotChallenges: 3,
    bonusPasses: 6,
    psGamesAccess: true,
    studentDiscount: true,
    price: 899,
    originalPrice: 1799,
    creditHours: 6,
    specialOffers: [
      'Flat 50% on Weekly Pass', 
      'Buy 1 Get 6 Passes', 
      'Special Member Cue (Subject to availability)',
      'Access to PS Plus Games',
      '3 MetaShot Challenge for free',
      'Flat 100rs off for students pass'
    ]
  }
};

// Calculate membership savings
export const calculateMembershipSavings = (tier: MembershipTier, isStudent: boolean = false): number => {
  const benefits = membershipBenefits[tier];
  if (tier === 'none') return 0;
  
  let actualPrice = benefits.originalPrice;
  let offerPrice = benefits.price;
  
  // Apply student discount if applicable
  if (isStudent && benefits.studentDiscount) {
    offerPrice = offerPrice - 100; // Flat Rs.100 off for students
  }
  
  return actualPrice - offerPrice;
};

// Get student price if applicable
export const getStudentPrice = (tier: MembershipTier): number => {
  const benefits = membershipBenefits[tier];
  if (tier === 'none' || !benefits.studentDiscount) return benefits.price;
  
  return benefits.price - 100; // Flat Rs.100 off for students
};

// Format membership details for display
export const formatMembershipDetails = (tier: MembershipTier): string[] => {
  if (tier === 'none') return ['Not a member'];
  
  const benefits = membershipBenefits[tier];
  
  return [
    `Can Play ${benefits.weeklyPlayTime}hrs in a week for free`,
    `Can only utilise ${benefits.maxHoursPerDay} hr${benefits.maxHoursPerDay > 1 ? 's' : ''} max per day`,
    'Can utilise this offer on any day but on sunday only 11AM to 5PM',
    'Priority bookings for members',
    'Prior Booking is Mandatory'
  ];
};

// Check if a membership is about to expire (within 7 days)
export const isMembershipExpiring = (endDate?: Date): boolean => {
  if (!endDate) return false;
  
  const today = new Date();
  const expiryDate = new Date(endDate);
  const daysRemaining = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysRemaining <= 7 && daysRemaining >= 0;
};
