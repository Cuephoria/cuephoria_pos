import { Product, Station, Customer } from '@/types/pos.types';

// Sample data
export const initialProducts: Product[] = [
  // Challenges Category
  { 
    id: 'ch1', 
    name: 'PS5 Gaming (1 Hour)', 
    price: 300,
    category: 'challenges',
    stock: 9999 
  },
  { 
    id: 'ch2', 
    name: '8-Ball (1 Hour)', 
    price: 200,
    category: 'challenges',
    stock: 9999 
  },
  { 
    id: 'ch3', 
    name: 'MetaShot Challenge 1', 
    price: 149, 
    category: 'challenges', 
    stock: 9999 
  },
  { 
    id: 'ch4', 
    name: 'MetaShot Challenge 2', 
    price: 199, 
    category: 'challenges', 
    stock: 9999 
  },
  { 
    id: 'ch5', 
    name: 'MetaShot Challenge 3', 
    price: 249, 
    category: 'challenges', 
    stock: 9999 
  },
  
  // Food Category 
  { 
    id: 'f1', 
    name: 'Samosa (2 pcs)', 
    price: 40, 
    category: 'food', 
    stock: 50 
  },
  { 
    id: 'f2', 
    name: 'Vada Pav', 
    price: 35, 
    category: 'food', 
    stock: 40 
  },
  { 
    id: 'f3', 
    name: 'Pav Bhaji', 
    price: 80, 
    category: 'food', 
    stock: 30 
  },
  { 
    id: 'f4', 
    name: 'Paneer Tikka', 
    price: 120, 
    category: 'food', 
    stock: 25 
  },
  { 
    id: 'f5', 
    name: 'Lay\'s Masala Magic', 
    price: 30, 
    category: 'food', 
    stock: 60 
  },
  
  // Drinks Category
  { 
    id: 'd1', 
    name: 'Masala Chai', 
    price: 25, 
    category: 'drinks', 
    stock: 100 
  },
  { 
    id: 'd2', 
    name: 'Mango Lassi', 
    price: 60, 
    category: 'drinks', 
    stock: 50 
  },
  { 
    id: 'd3', 
    name: 'Thums Up', 
    price: 40, 
    category: 'drinks', 
    stock: 75 
  },
  { 
    id: 'd4', 
    name: 'Nimbu Pani', 
    price: 30, 
    category: 'drinks', 
    stock: 80 
  },
  { 
    id: 'd5', 
    name: 'Red Bull', 
    price: 110, 
    category: 'drinks', 
    stock: 40 
  },
  
  // Tobacco Category
  { 
    id: 't1', 
    name: 'Classic Milds (Pack)', 
    price: 350, 
    category: 'tobacco', 
    stock: 30 
  },
  { 
    id: 't2', 
    name: 'Gold Flake Kings (Pack)', 
    price: 340, 
    category: 'tobacco', 
    stock: 35 
  },
  { 
    id: 't3', 
    name: 'Marlboro Red (Pack)', 
    price: 360, 
    category: 'tobacco', 
    stock: 25 
  },
  { 
    id: 't4', 
    name: 'Benson & Hedges (Pack)', 
    price: 370, 
    category: 'tobacco', 
    stock: 20 
  },
  { 
    id: 't5', 
    name: 'Wills Navy Cut (Pack)', 
    price: 320, 
    category: 'tobacco', 
    stock: 30 
  },
  { 
    id: 'p1', 
    name: 'PS5 Session', 
    price: 300, // ₹300 per hour
    category: 'challenges', // Changed from 'gaming' to 'challenges'
    stock: 9999 
  },
  { 
    id: 'p2', 
    name: '8-Ball Session', 
    price: 200, // ₹200 per hour
    category: 'challenges', // Changed from 'gaming' to 'challenges'
    stock: 9999 
  },
  { 
    id: 'p3', 
    name: 'Lay\'s Classic', 
    price: 20, 
    category: 'food', 
    stock: 50 
  },
  { 
    id: 'p4', 
    name: 'Red Bull', 
    price: 110, 
    category: 'drinks', 
    stock: 40 
  },
  { 
    id: 'p5', 
    name: 'Cigarettes (Pack)', 
    price: 350, 
    category: 'tobacco', 
    stock: 30 
  },
  { 
    id: 'p6', 
    name: 'MetaShot Challenge 1', 
    price: 49, 
    category: 'challenges', 
    stock: 9999 
  }
];

export const initialStations: Station[] = [
  { id: 's1', name: 'PS5 Console 1', type: 'ps5', hourlyRate: 300, isOccupied: false, currentSession: null },
  { id: 's2', name: 'PS5 Console 2', type: 'ps5', hourlyRate: 300, isOccupied: false, currentSession: null },
  { id: 's3', name: '8-Ball Table 1', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
  { id: 's4', name: '8-Ball Table 2', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
  { id: 's5', name: '8-Ball Table 3', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
];

export const initialCustomers: Customer[] = [
  { 
    id: 'c1', 
    name: 'Raj Sharma', 
    phone: '9876543210', 
    email: 'raj.sharma@example.com', 
    isMember: true, 
    membershipPlan: 'Silver - PS5 Weekly Pass (2 PAX)',
    membershipDuration: 'weekly',
    membershipStartDate: new Date(2023, 5, 25),
    membershipExpiryDate: new Date(2023, 6, 2),
    membershipHoursLeft: 2,
    loyaltyPoints: 150, 
    totalSpent: 3500,
    totalPlayTime: 420, // 7 hours
    createdAt: new Date(2023, 2, 15)
  },
  { 
    id: 'c2', 
    name: 'Priya Patel', 
    phone: '8765432109', 
    isMember: false, 
    loyaltyPoints: 0, 
    totalSpent: 800,
    totalPlayTime: 120, // 2 hours
    createdAt: new Date(2023, 3, 20) 
  },
  { 
    id: 'c3', 
    name: 'Vikram Singh', 
    phone: '7654321098', 
    email: 'vikram@example.com', 
    isMember: true, 
    membershipPlan: 'Silver - 8-Ball Monthly Pass (2 PAX)',
    membershipDuration: 'monthly',
    membershipStartDate: new Date(2023, 4, 1),
    membershipExpiryDate: new Date(2023, 5, 1),
    membershipHoursLeft: 12,
    loyaltyPoints: 75, 
    totalSpent: 1200,
    totalPlayTime: 180, // 3 hours
    createdAt: new Date(2023, 4, 5) 
  }
];

// Sample Indian data
export const indianProducts: Product[] = [
  { 
    id: 'ip1', 
    name: 'Masala Chai', 
    price: 25, 
    category: 'drinks', 
    stock: 100 
  },
  { 
    id: 'ip2', 
    name: 'Samosa', 
    price: 20, 
    category: 'food', 
    stock: 50 
  },
  { 
    id: 'ip3', 
    name: 'Vada Pav', 
    price: 40, 
    category: 'food', 
    stock: 40 
  },
  { 
    id: 'ip4', 
    name: 'Aloo Paratha', 
    price: 60, 
    category: 'food', 
    stock: 25 
  },
  { 
    id: 'ip5', 
    name: 'Panipuri Challenge', 
    price: 99, 
    category: 'challenges', 
    stock: 9999 
  },
  { 
    id: 'ip6', 
    name: 'Thums Up', 
    price: 45, 
    category: 'drinks', 
    stock: 60 
  },
  { 
    id: 'ip7', 
    name: 'Gulab Jamun', 
    price: 35, 
    category: 'food', 
    stock: 30 
  }
];

export const indianCustomers: Omit<Customer, 'id' | 'createdAt'>[] = [
  {
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh.kumar@gmail.com',
    isMember: true,
    membershipPlan: 'Silver - PS5 Weekly Pass (2 PAX)',
    membershipDuration: 'weekly',
    membershipStartDate: new Date(2023, 6, 10),
    membershipExpiryDate: new Date(2023, 6, 17),
    membershipHoursLeft: 3,
    loyaltyPoints: 250,
    totalSpent: 5000,
    totalPlayTime: 600
  },
  {
    name: 'Priya Singh',
    phone: '8765432109',
    email: 'priya.singh@gmail.com',
    isMember: true,
    membershipPlan: 'Platinum - Ultimate Monthly Pass',
    membershipDuration: 'monthly',
    membershipStartDate: new Date(2023, 5, 15),
    membershipExpiryDate: new Date(2023, 6, 15),
    membershipHoursLeft: 18,
    loyaltyPoints: 180,
    totalSpent: 3500,
    totalPlayTime: 420
  },
  {
    name: 'Amit Patel',
    phone: '7654321098',
    isMember: false,
    loyaltyPoints: 0,
    totalSpent: 1500,
    totalPlayTime: 180
  },
  {
    name: 'Sneha Sharma',
    phone: '6543210987',
    email: 'sneha.sharma@yahoo.com',
    isMember: true,
    membershipPlan: 'Platinum - Combo Weekly Pass',
    membershipDuration: 'weekly',
    membershipStartDate: new Date(2023, 6, 5),
    membershipExpiryDate: new Date(2023, 6, 12),
    membershipHoursLeft: 5,
    loyaltyPoints: 120,
    totalSpent: 2800,
    totalPlayTime: 300
  },
  {
    name: 'Vikram Desai',
    phone: '9876543211',
    isMember: false,
    loyaltyPoints: 0,
    totalSpent: 800,
    totalPlayTime: 120
  }
];
