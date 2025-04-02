
import { ResetOptions, Product, Customer, Station, Bill, StationStatus } from '@/types/pos.types';

export const resetToSampleData = (
  options: ResetOptions = { all: true },
  sampleProducts: Product[],
  sampleCustomers: Customer[],
  sampleStations: Station[],
  setProducts: (products: Product[]) => void,
  setCustomers: (customers: Customer[]) => void,
  setBills: (bills: Bill[]) => void,
  setStations: (stations: Station[]) => void,
  setCart: (cart: any[]) => void,
  setDiscountAmount: (discount: number) => void,
  setLoyaltyPointsUsedAmount: (points: number) => void,
  setSelectedCustomer: (customer: Customer | null) => void
) => {
  // Reset products
  if (options.all || options.products) {
    setProducts([...sampleProducts]);
    localStorage.setItem('cuephoriaProducts', JSON.stringify(sampleProducts));
  }
  
  // Reset customers
  if (options.all || options.customers) {
    setCustomers([...sampleCustomers]);
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(sampleCustomers));
  }
  
  // Reset bills
  if (options.all || options.bills) {
    setBills([]);
    localStorage.setItem('cuephoriaBills', JSON.stringify([]));
  }
  
  // Reset stations
  if (options.all || options.stations) {
    const resetStations = sampleStations.map(station => ({
      ...station,
      isOccupied: false,
      currentSession: null,
      status: 'available' as StationStatus
    }));
    setStations(resetStations);
    localStorage.setItem('cuephoriaStations', JSON.stringify(resetStations));
  }
  
  // Reset cart and related state
  if (options.all || options.cart) {
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsUsedAmount(0);
    setSelectedCustomer(null);
  }
};

export const addSampleIndianData = (
  products: Product[],
  customers: Customer[],
  bills: Bill[],
  setProducts: (products: Product[]) => void,
  setCustomers: (customers: Customer[]) => void,
  setBills: (bills: Bill[]) => void
) => {
  try {
    // Since sampleIndianProducts and sampleIndianCustomers don't exist yet,
    // we'll use placeholder data for now
    const sampleIndianProducts: Partial<Product>[] = [
      {
        id: 'ip1',
        name: 'Samosa',
        price: 25,
        category: 'food',
        stock: 50
      },
      {
        id: 'ip2',
        name: 'Chai',
        price: 15,
        category: 'drinks',
        stock: 100
      }
    ];
    
    const sampleIndianCustomers: Partial<Customer>[] = [
      {
        id: 'ic1',
        name: 'Rahul Sharma',
        phone: '9898989898',
        email: 'rahul@example.com',
        isMember: false,
        membership: null,
        loyaltyPoints: 0,
        totalSpent: 0,
        totalPlayTime: 0,
        createdAt: new Date()
      }
    ];
    
    // Add products if they don't already exist
    const newProducts = [...products];
    
    sampleIndianProducts.forEach(product => {
      const exists = products.some(p => p.name === product.name);
      if (!exists) {
        const newProduct = { 
          ...product, 
          id: `product_${Date.now()}_${Math.floor(Math.random() * 1000)}` 
        };
        newProducts.push(newProduct as Product);
      }
    });
    
    // Add customers if they don't already exist
    const newCustomers = [...customers];
    
    sampleIndianCustomers.forEach((customer) => {
      const exists = customers.some(c => c.phone === customer.phone);
      if (!exists) {
        const newCustomer = {
          ...customer,
          id: `customer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date()
        };
        newCustomers.push(newCustomer as Customer);
      }
    });
    
    // Update state and localStorage
    setProducts(newProducts);
    localStorage.setItem('cuephoriaProducts', JSON.stringify(newProducts));
    
    setCustomers(newCustomers);
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(newCustomers));
    
    console.log('Added sample Indian data successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};
