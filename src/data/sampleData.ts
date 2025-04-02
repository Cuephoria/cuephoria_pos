
import { Customer, Product, Bill, Station } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

// Sample Customers
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    isMember: true,
    membership: {
      type: 'ps5',
      startDate: new Date('2023-01-15'),
      expiryDate: new Date('2023-12-31'),
      creditHoursRemaining: 10,
      originalCreditHours: 20
    },
    loyaltyPoints: 150,
    totalSpent: 425.75,
    totalPlayTime: 900, // 15 hours in minutes
    createdAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-987-6543',
    isMember: true,
    membership: {
      type: 'combo',
      startDate: new Date('2023-02-20'),
      expiryDate: new Date('2023-12-31'),
      creditHoursRemaining: 15,
      originalCreditHours: 30
    },
    loyaltyPoints: 250,
    totalSpent: 782.50,
    totalPlayTime: 1620, // 27 hours in minutes
    createdAt: new Date('2023-01-15')
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '555-555-5555',
    isMember: true,
    membership: {
      type: '8ball_2pax',
      startDate: new Date('2023-03-10'),
      expiryDate: new Date('2023-12-31'),
      creditHoursRemaining: 5,
      originalCreditHours: 10
    },
    loyaltyPoints: 80,
    totalSpent: 195.25,
    totalPlayTime: 480, // 8 hours in minutes
    createdAt: new Date('2023-02-01')
  },
  {
    id: '4',
    name: 'Emily Williams',
    email: 'emily@example.com',
    phone: '555-222-3333',
    isMember: true,
    membership: {
      type: '8ball_4pax',
      startDate: new Date('2023-01-05'),
      expiryDate: new Date('2023-12-31'),
      creditHoursRemaining: 20,
      originalCreditHours: 40
    },
    loyaltyPoints: 320,
    totalSpent: 1250.75,
    totalPlayTime: 1920, // 32 hours in minutes
    createdAt: new Date('2023-01-10')
  },
  {
    id: '5',
    name: 'Alex Brown',
    email: 'alex@example.com',
    phone: '555-444-9999',
    isMember: false,
    membership: null,
    loyaltyPoints: 30,
    totalSpent: 75.50,
    totalPlayTime: 180, // 3 hours in minutes
    createdAt: new Date('2023-04-01')
  }
];

// Sample Products
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    price: 2.50,
    category: 'drinks',
    stock: 48
  },
  {
    id: '2',
    name: 'Nachos',
    price: 5.99,
    category: 'food',
    stock: 15
  },
  {
    id: '3',
    name: 'Chicken Wings',
    price: 8.99,
    category: 'food',
    stock: 20
  },
  {
    id: '4',
    name: 'PS5 Controller',
    price: 5.00,
    category: 'gaming',
    stock: 10
  },
  {
    id: '5',
    name: 'Pool Cue',
    price: 3.00,
    category: 'gaming',
    stock: 15
  },
  {
    id: '6',
    name: 'Basic Membership',
    price: 29.99,
    category: 'membership',
    stock: 999
  },
  {
    id: '7',
    name: 'Premium Membership',
    price: 49.99,
    category: 'membership',
    stock: 999
  },
  {
    id: '8',
    name: 'Gold Membership',
    price: 79.99,
    category: 'membership',
    stock: 999
  },
  {
    id: '9',
    name: 'Platinum Membership',
    price: 129.99,
    category: 'membership',
    stock: 999
  }
];

// Sample Stations
export const sampleStations: Station[] = [
  {
    id: '1',
    name: 'PS5 Station 1',
    type: 'ps5',
    hourlyRate: 15.00,
    isOccupied: false,
    currentSession: null,
    status: 'available'
  },
  {
    id: '2',
    name: 'PS5 Station 2',
    type: 'ps5',
    hourlyRate: 15.00,
    isOccupied: true,
    status: 'occupied',
    currentSession: {
      startTime: Date.now() - (1000 * 60 * 45), // Started 45 minutes ago
      customerId: '1',
      customerName: 'John Doe'
    }
  },
  {
    id: '3',
    name: 'PS5 Station 3',
    type: 'ps5',
    hourlyRate: 15.00,
    isOccupied: false,
    currentSession: null,
    status: 'maintenance'
  },
  {
    id: '4',
    name: '8-Ball Table 1',
    type: '8ball',
    hourlyRate: 12.00,
    isOccupied: true,
    status: 'occupied',
    currentSession: {
      startTime: Date.now() - (1000 * 60 * 120), // Started 2 hours ago
      customerId: '2',
      customerName: 'Jane Smith'
    }
  },
  {
    id: '5',
    name: '8-Ball Table 2',
    type: '8ball',
    hourlyRate: 12.00,
    isOccupied: false,
    currentSession: null,
    status: 'available'
  },
  {
    id: '6',
    name: '8-Ball Table 3',
    type: '8ball',
    hourlyRate: 12.00,
    isOccupied: false,
    currentSession: null,
    status: 'available'
  }
];

// Sample Bills/Transactions
export const sampleBills: Bill[] = [
  {
    id: generateId(),
    customerId: '1',
    items: [
      { id: '1', type: 'session', name: 'PS5 Station 1 Session (2 hr)', price: 15.00, quantity: 2, total: 30.00 },
      { id: '1', type: 'product', name: 'Coca-Cola', price: 2.50, quantity: 2, total: 5.00 }
    ],
    subtotal: 35.00,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 35,
    total: 35.00,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 1)) // 1 day ago
  },
  {
    id: generateId(),
    customerId: '2',
    items: [
      { id: '2', type: 'session', name: 'PS5 Station 2 Session (3 hr)', price: 15.00, quantity: 3, total: 45.00 },
      { id: '2', type: 'product', name: 'Nachos', price: 5.99, quantity: 1, total: 5.99 },
      { id: '1', type: 'product', name: 'Coca-Cola', price: 2.50, quantity: 1, total: 2.50 }
    ],
    subtotal: 53.49,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 53,
    total: 53.49,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 2)) // 2 days ago
  },
  {
    id: generateId(),
    customerId: '3',
    items: [
      { id: '4', type: 'session', name: '8-Ball Table 1 Session (2 hr)', price: 12.00, quantity: 2, total: 24.00 }
    ],
    subtotal: 24.00,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 24,
    total: 24.00,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 3)) // 3 days ago
  },
  {
    id: generateId(),
    customerId: '4',
    items: [
      { id: '1', type: 'session', name: 'PS5 Station 1 Session (4 hr)', price: 15.00, quantity: 4, total: 60.00 },
      { id: '3', type: 'product', name: 'Chicken Wings', price: 8.99, quantity: 2, total: 17.98 },
      { id: '1', type: 'product', name: 'Coca-Cola', price: 2.50, quantity: 2, total: 5.00 }
    ],
    subtotal: 82.98,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 83,
    total: 82.98,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 4)) // 4 days ago
  },
  {
    id: generateId(),
    customerId: '1',
    items: [
      { id: '5', type: 'session', name: '8-Ball Table 2 Session (1 hr)', price: 12.00, quantity: 1, total: 12.00 }
    ],
    subtotal: 12.00,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 12,
    total: 12.00,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 5)) // 5 days ago
  },
  {
    id: generateId(),
    customerId: '5',
    items: [
      { id: '2', type: 'session', name: 'PS5 Station 2 Session (1 hr)', price: 15.00, quantity: 1, total: 15.00 },
      { id: '2', type: 'product', name: 'Nachos', price: 5.99, quantity: 1, total: 5.99 }
    ],
    subtotal: 20.99,
    discount: 0,
    discountValue: 0,
    discountType: 'percentage',
    loyaltyPointsUsed: 0,
    loyaltyPointsEarned: 21,
    total: 20.99,
    paymentMethod: 'cash',
    createdAt: new Date(Date.now() - (1000 * 60 * 60 * 24 * 6)) // 6 days ago
  }
];
