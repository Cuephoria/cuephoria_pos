
import { Product, Station, Customer } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

// Sample Products
export const initialProducts: Product[] = [
  {
    id: 'product1',
    name: '8-Ball Pool (Per Hour)',
    price: 200,
    category: 'gaming',
    stock: 999,
  },
  {
    id: 'product2',
    name: 'PS5 Gaming (Per Hour)',
    price: 200,
    category: 'gaming',
    stock: 999,
  },
  {
    id: 'product3',
    name: 'Snooker (Per Hour)',
    price: 300,
    category: 'gaming',
    stock: 999,
  },
  {
    id: 'product4',
    name: 'Coca Cola',
    price: 40,
    category: 'drinks',
    stock: 24,
  },
  {
    id: 'product5',
    name: 'Cheese Sandwich',
    price: 80,
    category: 'food',
    stock: 10,
  },
  {
    id: 'product6',
    name: 'Cigarettes (Pack)',
    price: 350,
    category: 'tobacco',
    stock: 15,
  },
  {
    id: 'product7',
    name: 'Introductory Weekly Pass - 8 Ball (2 Pax)',
    price: 399,
    category: 'membership',
    stock: 999,
  },
  {
    id: 'product8',
    name: 'Introductory Weekly Pass - 8 Ball (4 Pax)',
    price: 599,
    category: 'membership',
    stock: 999,
  },
  {
    id: 'product9',
    name: 'Introductory Weekly Pass - PS5 Gaming',
    price: 399,
    category: 'membership',
    stock: 999,
  },
  {
    id: 'product10',
    name: 'Introductory Weekly Pass - Combo',
    price: 899,
    category: 'membership',
    stock: 999,
  }
];

// Sample Customers
export const initialCustomers: Customer[] = [
  {
    id: 'customer1',
    name: 'Raj Sharma',
    phone: '9876543210',
    email: 'raj.sharma@example.com',
    isMember: true,
    loyaltyPoints: 120,
    totalSpent: 1200,
    totalPlayTime: 240,
    createdAt: new Date('2023-01-15'),
    membership: null
  },
  {
    id: 'customer2',
    name: 'Priya Patel',
    phone: '8765432109',
    isMember: false,
    loyaltyPoints: 50,
    totalSpent: 500,
    totalPlayTime: 120,
    createdAt: new Date('2023-02-20'),
    membership: null
  },
  {
    id: 'customer3',
    name: 'Amit Singh',
    phone: '7654321098',
    email: 'amit.singh@example.com',
    isMember: true,
    loyaltyPoints: 80,
    totalSpent: 800,
    totalPlayTime: 180,
    createdAt: new Date('2023-03-10'),
    membership: null
  }
];

// Sample Stations
export const initialStations: Station[] = [
  {
    id: 'station1',
    name: '8-Ball Table 1',
    type: 'pool',
    status: 'available',
    hourlyRate: 200,
    isOccupied: false,
    currentSession: null
  },
  {
    id: 'station2',
    name: '8-Ball Table 2',
    type: 'pool',
    status: 'available',
    hourlyRate: 200,
    isOccupied: false,
    currentSession: null
  },
  {
    id: 'station3',
    name: 'Snooker Table 1',
    type: 'snooker',
    status: 'available',
    hourlyRate: 300,
    isOccupied: false,
    currentSession: null
  },
  {
    id: 'station4',
    name: 'PS5 Station 1',
    type: 'console',
    status: 'available',
    hourlyRate: 200,
    isOccupied: false,
    currentSession: null
  },
  {
    id: 'station5',
    name: 'PS5 Station 2',
    type: 'console',
    status: 'available',
    hourlyRate: 200,
    isOccupied: false,
    currentSession: null
  }
];

// Sample Indian Names for new customers
export const sampleIndianCustomers: Omit<Customer, 'id' | 'createdAt'>[] = [
  {
    name: 'Arjun Krishnan',
    phone: '9988776655',
    email: 'arjun.k@example.com',
    isMember: true,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    membership: null
  },
  {
    name: 'Deepika Rastogi',
    phone: '8877665544',
    email: 'deepika.r@example.com',
    isMember: true,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    membership: null
  },
  {
    name: 'Vikram Mehta',
    phone: '7766554433',
    isMember: false,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    membership: null
  },
  {
    name: 'Ananya Desai',
    phone: '6655443322',
    email: 'ananya.d@example.com',
    isMember: true,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    membership: null
  },
  {
    name: 'Rajan Verma',
    phone: '5544332211',
    isMember: false,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    membership: null
  }
];

// Sample Indian Food and Drink Products
export const sampleIndianProducts: Omit<Product, 'id'>[] = [
  {
    name: 'Masala Chai',
    price: 30,
    category: 'drinks',
    stock: 50
  },
  {
    name: 'Samosa (2 pcs)',
    price: 40,
    category: 'food',
    stock: 30
  },
  {
    name: 'Vada Pav',
    price: 35,
    category: 'food',
    stock: 25
  },
  {
    name: 'Pav Bhaji',
    price: 90,
    category: 'food',
    stock: 15
  },
  {
    name: 'Masala Soda',
    price: 45,
    category: 'drinks',
    stock: 20
  },
  {
    name: 'Paneer Sandwich',
    price: 70,
    category: 'food',
    stock: 18
  },
  {
    name: 'Lassi',
    price: 60,
    category: 'drinks',
    stock: 22
  },
  {
    name: 'Dahi Puri',
    price: 65,
    category: 'food',
    stock: 20
  }
];
