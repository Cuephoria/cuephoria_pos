
import { Bill, Customer, Product, ResetOptions, CartItem } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';
import { indianCustomers, indianProducts } from '@/data/sampleData';

// Function to add sample Indian data
export const addSampleIndianData = (
  products: Product[], 
  customers: Customer[], 
  bills: Bill[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  // Add Indian products (don't replace existing ones)
  const newProducts = [...products];
  
  indianProducts.forEach(product => {
    // Check if product with same name already exists
    if (!newProducts.some(p => p.name === product.name)) {
      newProducts.push({
        ...product,
        id: generateId() // Generate new ID
      });
    }
  });
  
  setProducts(newProducts);
  
  // Add Indian customers (don't replace existing ones)
  const newCustomers = [...customers];
  
  indianCustomers.forEach(customer => {
    // Check if customer with same phone number already exists
    if (!newCustomers.some(c => c.phone === customer.phone)) {
      const newCustomer = {
        ...customer,
        id: generateId(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7776000000)) // Random date in last 90 days
      };
      
      newCustomers.push(newCustomer);
    }
  });
  
  setCustomers(newCustomers);
  
  // Generate some sample bills
  const sampleBills: Bill[] = [];
  
  // Get all customer IDs (including the newly added ones)
  const customerIds = newCustomers.map(c => c.id);
  
  // Create sample bills (1-3 per customer)
  customerIds.forEach(customerId => {
    const numBills = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numBills; i++) {
      // Create 1-4 items per bill
      const numItems = Math.floor(Math.random() * 4) + 1;
      const billItems: CartItem[] = [];
      let subtotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        // Randomly select a product
        const product = newProducts[Math.floor(Math.random() * newProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const total = product.price * quantity;
        
        billItems.push({
          id: product.id,
          type: 'product',
          name: product.name,
          price: product.price,
          quantity,
          total
        });
        
        subtotal += total;
      }
      
      // Random discount (0-10%)
      const discount = Math.floor(Math.random() * 11);
      const discountValue = subtotal * (discount / 100);
      const total = subtotal - discountValue;
      
      // Random loyalty points
      const loyaltyPointsEarned = Math.floor(total / 10);
      
      const bill: Bill = {
        id: generateId(),
        customerId,
        items: billItems,
        subtotal,
        discount,
        discountValue,
        discountType: 'percentage',
        loyaltyPointsUsed: 0,
        loyaltyPointsEarned,
        total,
        paymentMethod: Math.random() > 0.5 ? 'cash' : 'upi',
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 2592000000)) // Random date in last 30 days
      };
      
      sampleBills.push(bill);
    }
  });
  
  setBills([...bills, ...sampleBills]);
  
  // Save to localStorage
  localStorage.setItem('cuephoriaProducts', JSON.stringify(newProducts));
  localStorage.setItem('cuephoriaCustomers', JSON.stringify(newCustomers));
  localStorage.setItem('cuephoriaBills', JSON.stringify([...bills, ...sampleBills]));
};

// Reset function with options
export const resetToSampleData = (
  options: ResetOptions | undefined,
  initialProducts: Product[],
  initialCustomers: Customer[],
  initialStations: any[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  setSessions: React.Dispatch<React.SetStateAction<any[]>>,
  setStations: React.Dispatch<React.SetStateAction<any[]>>,
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>,
  setLoyaltyPointsUsedAmount: React.Dispatch<React.SetStateAction<number>>,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>
) => {
  const defaultOptions = {
    products: true,
    customers: true,
    sales: true,
    sessions: true
  };
  
  const resetOpts = options || defaultOptions;
  
  // Reset selected data types to initial values
  if (resetOpts.products) {
    setProducts(initialProducts);
    localStorage.removeItem('cuephoriaProducts');
  }
  
  if (resetOpts.customers) {
    setCustomers(initialCustomers);
    localStorage.removeItem('cuephoriaCustomers');
  }
  
  if (resetOpts.sales) {
    setBills([]);
    localStorage.removeItem('cuephoriaBills');
  }
  
  if (resetOpts.sessions) {
    setSessions([]);
    
    // Reset station occupation status
    setStations(initialStations.map(station => ({
      ...station,
      isOccupied: false,
      currentSession: null
    })));
    
    localStorage.removeItem('cuephoriaSessions');
    localStorage.removeItem('cuephoriaStations');
  }
  
  // Clear cart regardless of options
  setCart([]);
  setDiscountAmount(0);
  setLoyaltyPointsUsedAmount(0);
  setSelectedCustomer(null);
};
