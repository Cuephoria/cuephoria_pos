
import { Customer, Product, Bill, Station } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

// Sample Customers
export const sampleCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    membershipType: 'basic',
    membershipStartDate: new Date('2023-01-15').getTime(),
    membershipEndDate: new Date('2023-12-31').getTime(),
    visits: 15,
    totalSpent: 425.75,
    lastVisit: new Date('2023-06-01').getTime(),
    notes: 'Prefers PS5 station 1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-987-6543',
    membershipType: 'premium',
    membershipStartDate: new Date('2023-02-20').getTime(),
    membershipEndDate: new Date('2023-12-31').getTime(),
    visits: 27,
    totalSpent: 782.50,
    lastVisit: new Date('2023-06-05').getTime(),
    notes: 'Birthday on July 15'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '555-555-5555',
    membershipType: 'gold',
    membershipStartDate: new Date('2023-03-10').getTime(),
    membershipEndDate: new Date('2023-12-31').getTime(),
    visits: 8,
    totalSpent: 195.25,
    lastVisit: new Date('2023-05-28').getTime(),
    notes: ''
  },
  {
    id: '4',
    name: 'Emily Williams',
    email: 'emily@example.com',
    phone: '555-222-3333',
    membershipType: 'platinum',
    membershipStartDate: new Date('2023-01-05').getTime(),
    membershipEndDate: new Date('2023-12-31').getTime(),
    visits: 32,
    totalSpent: 1250.75,
    lastVisit: new Date('2023-06-07').getTime(),
    notes: 'Prefers 8-ball table 2'
  },
  {
    id: '5',
    name: 'Alex Brown',
    email: 'alex@example.com',
    phone: '555-444-9999',
    membershipType: 'basic',
    membershipStartDate: new Date('2023-04-15').getTime(),
    membershipEndDate: new Date('2023-12-31').getTime(),
    visits: 3,
    totalSpent: 75.50,
    lastVisit: new Date('2023-05-20').getTime(),
    notes: 'New customer'
  }
];

// Sample Products
export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    price: 2.50,
    category: 'beverage',
    description: '12oz can',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 48
  },
  {
    id: '2',
    name: 'Nachos',
    price: 5.99,
    category: 'food',
    description: 'Cheese nachos with salsa',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 15
  },
  {
    id: '3',
    name: 'Chicken Wings',
    price: 8.99,
    category: 'food',
    description: '8 pieces, buffalo style',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 20
  },
  {
    id: '4',
    name: 'PS5 Controller',
    price: 5.00,
    category: 'rental',
    description: 'Controller rental (included with station)',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 10
  },
  {
    id: '5',
    name: 'Pool Cue',
    price: 3.00,
    category: 'rental',
    description: 'Premium pool cue rental',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 15
  },
  {
    id: '6',
    name: 'Basic Membership',
    price: 29.99,
    category: 'membership',
    description: '10% discount on all stations',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 999
  },
  {
    id: '7',
    name: 'Premium Membership',
    price: 49.99,
    category: 'membership',
    description: '15% discount on all stations + free snack',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 999
  },
  {
    id: '8',
    name: 'Gold Membership',
    price: 79.99,
    category: 'membership',
    description: '20% discount on all stations + free drink and snack',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 999
  },
  {
    id: '9',
    name: 'Platinum Membership',
    price: 129.99,
    category: 'membership',
    description: '25% discount on all stations + priority booking + free refreshments',
    image: '/placeholder.svg',
    inStock: true,
    stockQuantity: 999
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
    customerName: 'John Doe',
    items: [
      { id: '1', name: 'PS5 Station 1', price: 15.00, quantity: 2, subtotal: 30.00, type: 'station' },
      { id: '1', name: 'Coca-Cola', price: 2.50, quantity: 2, subtotal: 5.00, type: 'product' }
    ],
    total: 35.00,
    discount: 0,
    paymentMethod: 'cash',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 1), // 1 day ago
    notes: ''
  },
  {
    id: generateId(),
    customerId: '2',
    customerName: 'Jane Smith',
    items: [
      { id: '2', name: 'PS5 Station 2', price: 15.00, quantity: 3, subtotal: 45.00, type: 'station' },
      { id: '2', name: 'Nachos', price: 5.99, quantity: 1, subtotal: 5.99, type: 'product' },
      { id: '1', name: 'Coca-Cola', price: 2.50, quantity: 1, subtotal: 2.50, type: 'product' }
    ],
    total: 53.49,
    discount: 0,
    paymentMethod: 'card',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 2), // 2 days ago
    notes: ''
  },
  {
    id: generateId(),
    customerId: '3',
    customerName: 'Mike Johnson',
    items: [
      { id: '4', name: '8-Ball Table 1', price: 12.00, quantity: 2, subtotal: 24.00, type: 'station' }
    ],
    total: 24.00,
    discount: 0,
    paymentMethod: 'cash',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 3), // 3 days ago
    notes: ''
  },
  {
    id: generateId(),
    customerId: '4',
    customerName: 'Emily Williams',
    items: [
      { id: '1', name: 'PS5 Station 1', price: 15.00, quantity: 4, subtotal: 60.00, type: 'station' },
      { id: '3', name: 'Chicken Wings', price: 8.99, quantity: 2, subtotal: 17.98, type: 'product' },
      { id: '1', name: 'Coca-Cola', price: 2.50, quantity: 2, subtotal: 5.00, type: 'product' }
    ],
    total: 82.98,
    discount: 0,
    paymentMethod: 'card',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 4), // 4 days ago
    notes: ''
  },
  {
    id: generateId(),
    customerId: '1',
    customerName: 'John Doe',
    items: [
      { id: '5', name: '8-Ball Table 2', price: 12.00, quantity: 1, subtotal: 12.00, type: 'station' }
    ],
    total: 12.00,
    discount: 0,
    paymentMethod: 'cash',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 5), // 5 days ago
    notes: ''
  },
  {
    id: generateId(),
    customerId: '5',
    customerName: 'Alex Brown',
    items: [
      { id: '2', name: 'PS5 Station 2', price: 15.00, quantity: 1, subtotal: 15.00, type: 'station' },
      { id: '2', name: 'Nachos', price: 5.99, quantity: 1, subtotal: 5.99, type: 'product' }
    ],
    total: 20.99,
    discount: 0,
    paymentMethod: 'card',
    timestamp: Date.now() - (1000 * 60 * 60 * 24 * 6), // 6 days ago
    notes: 'First visit'
  }
];
