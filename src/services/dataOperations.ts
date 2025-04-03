import { Bill, Customer, Product, ResetOptions, CartItem } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';
import { indianCustomers, indianProducts } from '@/data/sampleData';
import { supabase, convertToSupabaseProduct } from "@/integrations/supabase/client";

// Function to add sample Indian data
export const addSampleIndianData = async (
  products: Product[], 
  customers: Customer[], 
  bills: Bill[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  // Add Indian products (don't replace existing ones)
  const newProducts = [...products];
  
  for (const product of indianProducts) {
    // Check if product with same name already exists
    if (!newProducts.some(p => p.name === product.name)) {
      const newProduct = {
        ...product,
        id: generateId() // Generate new ID
      };
      
      newProducts.push(newProduct);
      
      // Check if product exists in Supabase
      const { data: existingProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', newProduct.id)
        .maybeSingle();
        
      if (existingProduct) {
        // Update if exists
        await supabase
          .from('products')
          .update(convertToSupabaseProduct(newProduct))
          .eq('id', newProduct.id);
      } else {
        // Insert if it doesn't exist
        await supabase
          .from('products')
          .insert(convertToSupabaseProduct(newProduct));
      }
    }
  }
  
  setProducts(newProducts);
  
  // Add Indian customers (don't replace existing ones)
  const newCustomers = [...customers];
  
  for (const customer of indianCustomers) {
    // Check if customer with same phone number already exists
    if (!newCustomers.some(c => c.phone === customer.phone)) {
      const newCustomer = {
        ...customer,
        id: generateId(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7776000000)) // Random date in last 90 days
      };
      
      newCustomers.push(newCustomer);
      
      // Check if customer exists in Supabase
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', newCustomer.id)
        .maybeSingle();
        
      if (existingCustomer) {
        // Update if exists
        await supabase
          .from('customers')
          .update({
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email || null,
            is_member: newCustomer.isMember,
            membership_plan: newCustomer.membershipPlan || null,
            membership_duration: newCustomer.membershipDuration || null,
            membership_start_date: newCustomer.membershipStartDate ? newCustomer.membershipStartDate.toISOString() : null,
            membership_expiry_date: newCustomer.membershipExpiryDate ? newCustomer.membershipExpiryDate.toISOString() : null,
            membership_hours_left: newCustomer.membershipHoursLeft || null,
            loyalty_points: newCustomer.loyaltyPoints,
            total_spent: newCustomer.totalSpent,
            total_play_time: newCustomer.totalPlayTime || 0,
            created_at: newCustomer.createdAt.toISOString()
          })
          .eq('id', newCustomer.id);
      } else {
        // Insert if it doesn't exist
        await supabase
          .from('customers')
          .insert({
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email || null,
            is_member: newCustomer.isMember,
            membership_plan: newCustomer.membershipPlan || null,
            membership_duration: newCustomer.membershipDuration || null,
            membership_start_date: newCustomer.membershipStartDate ? newCustomer.membershipStartDate.toISOString() : null,
            membership_expiry_date: newCustomer.membershipExpiryDate ? newCustomer.membershipExpiryDate.toISOString() : null,
            membership_hours_left: newCustomer.membershipHoursLeft || null,
            loyalty_points: newCustomer.loyaltyPoints,
            total_spent: newCustomer.totalSpent,
            total_play_time: newCustomer.totalPlayTime || 0,
            created_at: newCustomer.createdAt.toISOString()
          });
      }
    }
  }
  
  setCustomers(newCustomers);
  
  // Generate some sample bills
  const sampleBills: Bill[] = [];
  
  // Get all customer IDs (including the newly added ones)
  const customerIds = newCustomers.map(c => c.id);
  
  // Create sample bills (1-3 per customer)
  for (const customerId of customerIds) {
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
      
      const billId = generateId();
      const bill: Bill = {
        id: billId,
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
      
      // Sync bill to Supabase
      // Check if bill exists in Supabase
      const { data: existingBill } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .maybeSingle();
        
      if (existingBill) {
        // Update if exists
        await supabase
          .from('bills')
          .update({
            customer_id: customerId,
            subtotal,
            discount,
            discount_value: discountValue,
            discount_type: 'percentage',
            loyalty_points_used: 0,
            loyalty_points_earned: loyaltyPointsEarned,
            total,
            payment_method: bill.paymentMethod,
            created_at: bill.createdAt.toISOString()
          })
          .eq('id', billId);
      } else {
        // Insert if it doesn't exist
        await supabase
          .from('bills')
          .insert({
            id: billId,
            customer_id: customerId,
            subtotal,
            discount,
            discount_value: discountValue,
            discount_type: 'percentage',
            loyalty_points_used: 0,
            loyalty_points_earned: loyaltyPointsEarned,
            total,
            payment_method: bill.paymentMethod,
            created_at: bill.createdAt.toISOString()
          });
      }
      
      // Sync bill items to Supabase
      for (const item of billItems) {
        // Check if bill item exists in Supabase
        const { data: existingBillItem } = await supabase
          .from('bill_items')
          .select('*')
          .eq('bill_id', billId)
          .eq('item_id', item.id)
          .maybeSingle();
          
        if (existingBillItem) {
          // Update if exists
          await supabase
            .from('bill_items')
            .update({
              item_type: item.type,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              total: item.total
            })
            .eq('bill_id', billId)
            .eq('item_id', item.id);
        } else {
          // Insert if it doesn't exist
          await supabase
            .from('bill_items')
            .insert({
              bill_id: billId,
              item_id: item.id,
              item_type: item.type,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              total: item.total
            });
        }
      }
    }
  }
  
  setBills([...bills, ...sampleBills]);
};

// Reset function with options - Now uses Supabase to reset data
export const resetToSampleData = async (
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
    // Clear products table in Supabase
    await supabase
      .from('products')
      .delete()
      .not('id', 'is', null);
    
    // Insert initial products
    for (const product of initialProducts) {
      await supabase
        .from('products')
        .insert(convertToSupabaseProduct(product));
    }
    
    setProducts(initialProducts);
  }
  
  if (resetOpts.customers) {
    // Clear customers table in Supabase
    await supabase
      .from('customers')
      .delete()
      .not('id', 'is', null);
    
    // Insert initial customers
    for (const customer of initialCustomers) {
      await supabase
        .from('customers')
        .insert({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          is_member: customer.isMember,
          membership_plan: customer.membershipPlan || null,
          membership_duration: customer.membershipDuration || null,
          membership_start_date: customer.membershipStartDate ? customer.membershipStartDate.toISOString() : null,
          membership_expiry_date: customer.membershipExpiryDate ? customer.membershipExpiryDate.toISOString() : null,
          membership_hours_left: customer.membershipHoursLeft || null,
          loyalty_points: customer.loyaltyPoints,
          total_spent: customer.totalSpent,
          total_play_time: customer.totalPlayTime || 0,
          created_at: customer.createdAt.toISOString()
        });
    }
    
    setCustomers(initialCustomers);
  }
  
  if (resetOpts.sales) {
    // Clear bills and bill_items tables in Supabase
    await supabase
      .from('bill_items')
      .delete()
      .not('bill_id', 'is', null);
      
    await supabase
      .from('bills')
      .delete()
      .not('id', 'is', null);
    
    setBills([]);
  }
  
  if (resetOpts.sessions) {
    // Clear sessions table in Supabase
    await supabase
      .from('sessions')
      .delete()
      .not('id', 'is', null);
    
    setSessions([]);
    
    // Reset station occupation status
    setStations(initialStations.map(station => ({
      ...station,
      isOccupied: false,
      currentSession: null
    })));
    
    // Update stations in Supabase
    for (const station of initialStations) {
      // Check if station exists
      const { data: existingStation } = await supabase
        .from('stations')
        .select('*')
        .eq('id', station.id)
        .maybeSingle();
        
      if (existingStation) {
        // Update if exists
        await supabase
          .from('stations')
          .update({
            id: station.id,
            name: station.name,
            type: station.type,
            hourly_rate: station.hourlyRate,
            is_occupied: false,
            current_session: null
          })
          .eq('id', station.id);
      } else {
        // Insert if it doesn't exist
        await supabase
          .from('stations')
          .insert({
            id: station.id,
            name: station.name,
            type: station.type,
            hourly_rate: station.hourlyRate,
            is_occupied: false,
            current_session: null
          });
      }
    }
  }
  
  // Clear cart regardless of options
  setCart([]);
  setDiscountAmount(0);
  setLoyaltyPointsUsedAmount(0);
  setSelectedCustomer(null);
};
