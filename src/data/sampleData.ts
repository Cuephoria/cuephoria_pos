
import { Product, Station, Customer } from '@/types/pos.types';

// Sample data
export const initialProducts: Product[] = [
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
    loyaltyPoints: 250,
    totalSpent: 5000,
    totalPlayTime: 600
  },
  {
    name: 'Priya Singh',
    phone: '8765432109',
    email: 'priya.singh@gmail.com',
    isMember: true,
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
