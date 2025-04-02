
import { ResetOptions, Product, Customer, Station, Bill } from '@/types/pos.types';

export const resetToSampleData = (
  options: ResetOptions = { all: true },
  initialProducts: Product[],
  initialCustomers: Customer[],
  initialStations: Station[],
  setProducts: (products: Product[]) => void,
  setCustomers: (customers: Customer[]) => void,
  setBills: (bills: Bill[]) => void,
  setSessions: (sessions: any[]) => void,
  setStations: (stations: Station[]) => void,
  setCart: (cart: any[]) => void,
  setDiscountAmount: (discount: number) => void,
  setLoyaltyPointsUsedAmount: (points: number) => void,
  setSelectedCustomer: (customer: Customer | null) => void
) => {
  // Reset products
  if (options.all || options.products) {
    setProducts([...initialProducts]);
    localStorage.setItem('cuephoriaProducts', JSON.stringify(initialProducts));
  }
  
  // Reset customers
  if (options.all || options.customers) {
    setCustomers([...initialCustomers]);
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(initialCustomers));
  }
  
  // Reset bills
  if (options.all || options.bills) {
    setBills([]);
    localStorage.setItem('cuephoriaBills', JSON.stringify([]));
  }
  
  // Reset sessions
  if (options.all || options.sessions) {
    setSessions([]);
    localStorage.setItem('cuephoriaSessions', JSON.stringify([]));
  }
  
  // Reset stations
  if (options.all || options.stations) {
    const resetStations = initialStations.map(station => ({
      ...station,
      isOccupied: false,
      currentSession: null
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
    // Import the sample data
    import('@/data/sampleData').then(({ sampleIndianProducts, sampleIndianCustomers }) => {
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
      
      sampleIndianCustomers.forEach((customer: Customer) => {
        const exists = customers.some(c => c.phone === customer.phone);
        if (!exists) {
          const newCustomer = {
            ...customer,
            id: `customer_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date()
          };
          newCustomers.push(newCustomer);
        }
      });
      
      // Update state and localStorage
      setProducts(newProducts);
      localStorage.setItem('cuephoriaProducts', JSON.stringify(newProducts));
      
      setCustomers(newCustomers);
      localStorage.setItem('cuephoriaCustomers', JSON.stringify(newCustomers));
      
      console.log('Added sample Indian data successfully');
    });
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};
