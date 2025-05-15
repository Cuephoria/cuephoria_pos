import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  Product,
  Station,
  Session
} from '@/types/pos.types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useCustomerCarts } from '@/hooks/useCustomerCarts';

const POSContext = createContext<POSContextType>({
  products: [],
  productsLoading: false,
  productsError: null,
  stations: [],
  customers: [],
  sessions: [],
  bills: [],
  cart: [],
  selectedCustomer: null,
  discount: 0,
  discountType: 'percentage',
  loyaltyPointsUsed: 0,
  isStudentDiscount: false,
  isSplitPayment: false,
  cashAmount: 0,
  upiAmount: 0,
  categories: ['food', 'drinks', 'tobacco', 'challenges', 'membership'], // Default categories
  setIsStudentDiscount: () => {},
  setBills: () => {}, // Add default implementation
  setCustomers: () => {}, // Add default implementation
  setStations: () => {},
  addProduct: () => ({}),
  updateProduct: () => ({}),
  deleteProduct: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {},
  startSession: async () => {},
  endSession: async () => {},
  deleteStation: async () => false,
  updateStation: async () => false,  // Add default implementation
  addCustomer: () => ({}),
  updateCustomer: () => ({}),
  updateCustomerMembership: () => null,
  deleteCustomer: () => {},
  selectCustomer: () => {},
  checkMembershipValidity: () => false,
  deductMembershipHours: () => false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  setDiscount: () => {},
  setLoyaltyPointsUsed: () => {},
  calculateTotal: () => 0,
  completeSale: () => undefined,
  updateBill: async () => null, // Changed from optional to a required function with default implementation
  deleteBill: async () => false,
  exportBills: () => {},
  exportCustomers: () => {},
  resetToSampleData: () => {},
  addSampleIndianData: () => {},
  setIsSplitPayment: () => {},
  setCashAmount: () => {},
  setUpiAmount: () => {},
  updateSplitAmounts: () => false
});

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // Initialize customer carts system
  const {
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCustomerCart,
    clearCustomerCart,
    addToCustomerCart,
    removeFromCustomerCart,
    updateCustomerCartItem,
    setCustomerDiscount,
    setCustomerLoyaltyPointsUsed,
    setCustomerStudentDiscount,
    setCustomerSplitPayment,
    updateCustomerSplitAmounts,
    calculateCustomerCartTotal
  } = useCustomerCarts();
  
  // State for categories
  const [categories, setCategories] = useState<string[]>([
    'food', 'drinks', 'tobacco', 'challenges', 'membership'
  ]);
  
  // Initialize all hooks
  const { 
    products, 
    loading: productsLoading,
    error: productsError,
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    refreshFromDB
  } = useProducts();
  
  const { 
    customers, 
    setCustomers, 
    selectedCustomer, 
    setSelectedCustomer, 
    addCustomer, 
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer, 
    selectCustomer: baseSelectCustomer,
    checkMembershipValidity,
    deductMembershipHours
  } = useCustomers([]);
  
  const { 
    stations, 
    setStations, 
    sessions, 
    setSessions, 
    startSession: startSessionBase, 
    endSession: endSessionBase,
    deleteStation,
    updateStation
  } = useStations([], updateCustomer);
  
  // We still use useCart for some base operations
  const { 
    cart, 
    setCart, 
    discount, 
    setDiscountAmount, 
    discountType, 
    setDiscountType, 
    loyaltyPointsUsed, 
    setLoyaltyPointsUsedAmount, 
    isSplitPayment,
    setIsSplitPayment,
    cashAmount,
    setCashAmount,
    upiAmount,
    setUpiAmount,
    resetPaymentInfo
  } = useCart();
  
  const { 
    bills, 
    setBills, 
    completeSale: completeSaleBase, 
    deleteBill: deleteBillBase,
    updateBill: updateBillBase,
    exportBills: exportBillsBase, 
    exportCustomers: exportCustomersBase 
  } = useBills(updateCustomer, updateProduct);

  const { toast } = useToast();

  // Fetch categories from Supabase on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get categories from Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        if (data && data.length > 0) {
          // Use categories from DB
          const dbCategories = data.map(item => item.name.toLowerCase());
          
          // Ensure "uncategorized" exists
          if (!dbCategories.includes('uncategorized')) {
            try {
              await supabase
                .from('categories')
                .insert({ name: 'uncategorized' });
                
              dbCategories.push('uncategorized');
            } catch (err) {
              console.error('Error creating uncategorized category:', err);
            }
          }
          
          setCategories(dbCategories);
          localStorage.setItem('cuephoriaCategories', JSON.stringify(dbCategories));
          console.log('Categories loaded from database:', dbCategories);
        } else {
          // If no categories in DB, create default ones
          const defaultCategories = ['food', 'drinks', 'tobacco', 'challenges', 'membership', 'uncategorized'];
          
          // Insert all default categories
          for (const category of defaultCategories) {
            try {
              await supabase
                .from('categories')
                .insert({ name: category.toLowerCase() });
            } catch (err) {
              console.error(`Error creating category ${category}:`, err);
            }
          }
          
          setCategories(defaultCategories);
          localStorage.setItem('cuephoriaCategories', JSON.stringify(defaultCategories));
          console.log('Default categories created:', defaultCategories);
        }
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Category management functions
  const addCategory = async (category: string) => {
    try {
      const trimmedCategory = category.trim().toLowerCase();
      
      if (!trimmedCategory) {
        return; // Empty category
      }
      
      // Check if category already exists (case insensitive)
      if (categories.some(cat => cat.toLowerCase() === trimmedCategory)) {
        toast({
          title: 'Error',
          description: `Category "${trimmedCategory}" already exists`,
          variant: 'destructive',
        });
        return;
      }
      
      // First, add to Supabase
      const { error } = await supabase
        .from('categories')
        .insert({ name: trimmedCategory });
        
      if (error) {
        console.error('Error adding category to Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to add category "${trimmedCategory}" to database: ${handleSupabaseError(error, 'insert')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state if database operation was successful
      setCategories(prev => {
        const updated = [...prev, trimmedCategory];
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category "${trimmedCategory}" has been added`,
      });
    } catch (error) {
      console.error('Error in addCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    try {
      // Don't allow changing the uncategorized category
      if (oldCategory.toLowerCase() === 'uncategorized') {
        toast({
          title: 'Error',
          description: `The "uncategorized" category cannot be renamed`,
          variant: 'destructive',
        });
        return;
      }
      
      const trimmedNewCategory = newCategory.trim().toLowerCase();
      
      if (oldCategory === newCategory || !trimmedNewCategory) {
        return; // No change or empty category
      }
      
      // Check if new name already exists (case insensitive)
      if (categories.some(cat => cat.toLowerCase() === trimmedNewCategory && cat.toLowerCase() !== oldCategory.toLowerCase())) {
        toast({
          title: 'Error',
          description: `Category "${trimmedNewCategory}" already exists`,
          variant: 'destructive',
        });
        return;
      }
      
      // First update in Supabase
      const { error } = await supabase
        .from('categories')
        .update({ name: trimmedNewCategory })
        .eq('name', oldCategory.toLowerCase());
        
      if (error) {
        console.error('Error updating category in Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to update category from "${oldCategory}" to "${trimmedNewCategory}": ${handleSupabaseError(error, 'update')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update products with this category
      setProducts(prev =>
        prev.map(product => 
          product.category.toLowerCase() === oldCategory.toLowerCase() 
            ? { ...product, category: trimmedNewCategory } 
            : product
        )
      );
      
      // Also update products in database
      const { error: updateProductsError } = await supabase
        .from('products')
        .update({ category: trimmedNewCategory })
        .eq('category', oldCategory);
        
      if (updateProductsError) {
        console.error('Error updating products category in Supabase:', updateProductsError);
      }
      
      // Update category list
      setCategories(prev => {
        const updated = prev.map(cat => 
          cat.toLowerCase() === oldCategory.toLowerCase() ? trimmedNewCategory : cat
        );
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category updated from "${oldCategory}" to "${trimmedNewCategory}"`,
      });
    } catch (error) {
      console.error('Error in updateCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const lowerCategory = category.toLowerCase();
      
      // Don't allow deleting the uncategorized category
      if (lowerCategory === 'uncategorized') {
        toast({
          title: 'Error',
          description: `The "uncategorized" category cannot be deleted`,
          variant: 'destructive',
        });
        return;
      }
      
      // Check if products use this category
      const productsWithCategory = products.filter(
        p => p.category.toLowerCase() === lowerCategory
      );
      
      // Delete from Supabase
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', lowerCategory);
        
      if (error) {
        console.error('Error deleting category from Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to delete category "${category}" from database: ${handleSupabaseError(error, 'delete')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update products with this category to 'uncategorized'
      if (productsWithCategory.length > 0) {
        // Update products
        setProducts(prev =>
          prev.map(product => 
            product.category.toLowerCase() === lowerCategory
              ? { ...product, category: 'uncategorized' } 
              : product
          )
        );
        
        // Update products in database
        const { error: updateProductsError } = await supabase
          .from('products')
          .update({ category: 'uncategorized' })
          .eq('category', lowerCategory);
          
        if (updateProductsError) {
          console.error('Error updating products category in Supabase:', updateProductsError);
        }
      }
      
      // Remove from local categories list
      setCategories(prev => {
        const updated = prev.filter(cat => cat.toLowerCase() !== lowerCategory);
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category "${category}" has been deleted`,
      });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Modified select customer to use customer carts
  const selectCustomer = (id: string | null) => {
    if (activeCustomerId) {
      // Save the current cart for the previously selected customer
      const currentCart = {
        cart,
        discount,
        discountType,
        loyaltyPointsUsed,
        isStudentDiscount: false,  // Default value
        isSplitPayment,
        cashAmount,
        upiAmount
      };
      
      // We don't modify the original useCustomerCarts state here
      // as it's already updated by our actions, this is just fallback
    }
    
    // Clear the current cart before switching customers
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsUsedAmount(0);
    setIsSplitPayment(false);
    setCashAmount(0);
    setUpiAmount(0);
    
    // Call base select customer to set the selected customer
    baseSelectCustomer(id);
    
    // Update the active customer ID in our customer carts system
    setActiveCustomerId(id);
    
    if (id) {
      // Load the cart for this customer
      const customerCart = getCustomerCart(id);
      
      // Update the actual cart
      setCart(customerCart.cart);
      setDiscountAmount(customerCart.discount);
      setDiscountType(customerCart.discountType);
      setLoyaltyPointsUsedAmount(customerCart.loyaltyPointsUsed);
      setIsSplitPayment(customerCart.isSplitPayment);
      setCashAmount(customerCart.cashAmount);
      setUpiAmount(customerCart.upiAmount);
    }
  };
  
  // Modified addToCart to store in customer cart
  const addToCart = (item: Omit<CartItem, 'total'>, availableStock?: number) => {
    if (!selectedCustomer) {
      toast({
        title: "No Customer Selected",
        description: "Please select a customer before adding items to cart",
        variant: "destructive"
      });
      return;
    }
    
    addToCustomerCart(selectedCustomer.id, item, availableStock);
    
    // Also update the current cart state
    const existingItem = cart.find(i => i.id === item.id && i.type === item.type);
    
    if (existingItem) {
      const updatedCart = cart.map(i => 
        i.id === item.id && i.type === item.type
          ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price }
          : i
      );
      setCart(updatedCart);
    } else {
      const newItem = { ...item, total: item.quantity * item.price };
      setCart([...cart, newItem]);
    }
  };
  
  // Modified removeFromCart to update customer cart
  const removeFromCart = (id: string) => {
    if (selectedCustomer) {
      removeFromCustomerCart(selectedCustomer.id, id);
    }
    
    // Also update the current cart state
    setCart(cart.filter(i => i.id !== id));
  };
  
  // Modified updateCartItem to update customer cart
  const updateCartItem = (id: string, quantity: number) => {
    if (selectedCustomer) {
      updateCustomerCartItem(selectedCustomer.id, id, quantity);
    }
    
    if (quantity <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => 
        i.id === id
          ? { ...i, quantity, total: quantity * i.price }
          : i
      ));
    }
  };
  
  // Modified clearCart to update customer cart
  const clearCart = () => {
    if (selectedCustomer) {
      clearCustomerCart(selectedCustomer.id);
    }
    
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsUsedAmount(0);
    resetPaymentInfo();
  };
  
  // Modified setDiscount to update customer cart
  const setDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    if (selectedCustomer) {
      setCustomerDiscount(selectedCustomer.id, amount, type);
    }
    
    setDiscountAmount(amount);
    setDiscountType(type);
  };
  
  // Modified setLoyaltyPointsUsed to update customer cart
  const setLoyaltyPointsUsed = (points: number) => {
    if (selectedCustomer) {
      setCustomerLoyaltyPointsUsed(selectedCustomer.id, points);
    }
    
    setLoyaltyPointsUsedAmount(points);
  };
  
  // Set student discount
  const setIsStudentDiscount = (value: boolean) => {
    if (selectedCustomer) {
      setCustomerStudentDiscount(selectedCustomer.id, value);
    }
  };
  
  // Modified methods for split payment to update customer cart
  const handleSetIsSplitPayment = (value: boolean) => {
    if (selectedCustomer) {
      setCustomerSplitPayment(selectedCustomer.id, value, calculateTotal());
    }
    
    setIsSplitPayment(value);
    
    if (value) {
      // Initialize split amounts when enabling split payment
      const total = calculateTotal();
      setCashAmount(Math.floor(total / 2)); // Default to half cash
      setUpiAmount(total - Math.floor(total / 2)); // Remaining amount to UPI
    } else {
      setCashAmount(0);
      setUpiAmount(0);
    }
  };
  
  const handleUpdateSplitAmounts = (cash: number, upi: number) => {
    const total = calculateTotal();
    if (selectedCustomer) {
      const result = updateCustomerSplitAmounts(selectedCustomer.id, cash, upi, total);
      if (!result) return false;
    }
    
    setCashAmount(cash);
    setUpiAmount(upi);
    return true;
  };
  
  // Calculate total
  const calculateTotal = () => {
    if (selectedCustomer) {
      return calculateCustomerCartTotal(selectedCustomer.id);
    }
    
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    const loyaltyDiscount = loyaltyPointsUsed;
    
    return Math.max(0, subtotal - discountValue - loyaltyDiscount);
  };
  
  // Wrapper functions that combine functionality from multiple hooks
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    await startSessionBase(stationId, customerId);
  };
  
  // Modified endSession to add session to correct customer's cart
  const endSession = async (stationId: string): Promise<void> => {
    try {
      // Get the current station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station in wrapper");
        throw new Error("No active session found");
      }
      
      // Get the customer ID before ending the session
      const customerId = station.currentSession.customerId;
      
      // Call the base endSession function
      const result = await endSessionBase(stationId, customers);
      
      if (result) {
        const { sessionCartItem, customer } = result;
        
        if (sessionCartItem && customer) {
          // Add the session directly to the customer's cart
          addToCustomerCart(customer.id, sessionCartItem);
          
          // If this customer is currently selected, update the active cart too
          if (selectedCustomer && selectedCustomer.id === customer.id) {
            // Add to the current cart
            const newItem = { ...sessionCartItem, total: sessionCartItem.quantity * sessionCartItem.price };
            setCart(prev => [...prev, newItem]);
          }
          
          // Auto-select customer if none is selected
          if (!selectedCustomer) {
            console.log("Auto-selecting customer:", customer.name);
            selectCustomer(customer.id);
          } else if (selectedCustomer.id !== customer.id) {
            // Notify that session was added to a different customer
            toast({
              title: "Session Added",
              description: `Session was added to ${customer.name}'s cart`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in endSession:', error);
      throw error;
    }
  };
  
  // Fix for the Promise<Customer> error - wrap in a synchronous function that returns Customer | null
  const updateCustomerMembershipWrapper = (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ): Customer | null => {
    // Create a placeholder customer with the minimum required fields
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return null;
    
    // Start the async update process but don't wait for it
    updateCustomerMembership(customerId, membershipData)
      .then((updatedCustomer) => {
        if (updatedCustomer) {
          console.log("Customer membership updated:", updatedCustomer.id);
        }
      })
      .catch(error => {
        console.error("Error updating customer membership:", error);
      });
    
    // Return a modified version of the existing customer to satisfy the synchronous interface
    return {
      ...customer,
      membershipPlan: membershipData.membershipPlan || customer.membershipPlan,
      membershipDuration: membershipData.membershipDuration || customer.membershipDuration,
      membershipHoursLeft: membershipData.membershipHoursLeft !== undefined 
        ? membershipData.membershipHoursLeft 
        : customer.membershipHoursLeft,
      isMember: true
    };
  };
  
  // Modified to handle async operations but return synchronously
  const completeSale = (paymentMethod: 'cash' | 'upi' | 'split'): Bill | undefined => {
    try {
      if (!selectedCustomer) {
        toast({
          title: "No Customer Selected",
          description: "Please select a customer before completing the sale",
          variant: "destructive"
        });
        return undefined;
      }
      
      // Apply student price for membership items if student discount is enabled
      const currentCart = getCustomerCart(selectedCustomer.id);
      if (currentCart.isStudentDiscount) {
        const updatedCart = cart.map(item => {
          const product = products.find(p => p.id === item.id) as Product;
          if (product && product.category === 'membership' && product.studentPrice) {
            return {
              ...item,
              price: product.studentPrice,
              total: product.studentPrice * item.quantity
            };
          }
          return item;
        });
        
        // Temporarily update cart with student prices
        setCart(updatedCart);
      }
      
      // Look for membership products in cart
      const membershipItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'membership';
      });
      
      // This is async but we're handling it internally and returning a synchronous Bill
      completeSaleBase(
        cart, 
        selectedCustomer, 
        discount, 
        discountType, 
        loyaltyPointsUsed, 
        calculateTotal, 
        isSplitPayment ? 'split' : paymentMethod,
        products,
        isSplitPayment,
        cashAmount,
        upiAmount
      ).then(bill => {
        // If we have a successful sale with membership items, update the customer
        if (bill && selectedCustomer && membershipItems.length > 0) {
          for (const item of membershipItems) {
            const product = products.find(p => p.id === item.id);
            
            if (product) {
              // Default values
              let membershipHours = product.membershipHours || 4; // Default hours from product or fallback to 4
              let membershipDuration: 'weekly' | 'monthly' = 'weekly';
              
              // Set duration based on product
              if (product.duration) {
                membershipDuration = product.duration;
              } else if (product.name.toLowerCase().includes('weekly')) {
                membershipDuration = 'weekly';
              } else if (product.name.toLowerCase().includes('monthly')) {
                membershipDuration = 'monthly';
              }
              
              // Update customer's membership
              updateCustomerMembership(selectedCustomer.id, {
                membershipPlan: product.name,
                membershipDuration: membershipDuration,
                membershipHoursLeft: membershipHours
              });
              
              break; // Only apply the first membership found
            }
          }
        }
        
        if (bill) {
          // Clear the cart for this customer after successful sale
          clearCustomerCart(selectedCustomer.id);
          
          // Clear the cart
          clearCart();
          
          // Reset selected customer
          setSelectedCustomer(null);
          setActiveCustomerId(null);
          
          // Reset student discount and split payment
          setCustomerStudentDiscount(selectedCustomer.id, false);
          setCustomerSplitPayment(selectedCustomer.id, false, 0);
        }
      }).catch(error => {
        console.error("Error in completeSale async:", error);
      });
      
      // Return a synchronous bill for the UI
      if (selectedCustomer) {
        // Calculate loyalty points earned using the new rule
        // Members: 5 points per 100 INR spent
        // Non-members: 2 points per 100 INR spent
        const pointsRate = selectedCustomer.isMember ? 5 : 2;
        const total = calculateTotal();
        const loyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
        
        const placeholderBill: Bill = {
          id: `temp-${new Date().getTime()}`,
          customerId: selectedCustomer.id,
          items: [...cart],
          subtotal: cart.reduce((sum, item) => sum + item.total, 0),
          discount,
          discountValue: discount > 0 ? 
            (discountType === 'percentage' ? 
              (cart.reduce((sum, item) => sum + item.total, 0) * discount / 100) : 
              discount) : 0,
          discountType,
          loyaltyPointsUsed,
          loyaltyPointsEarned,
          total,
          paymentMethod: isSplitPayment ? 'split' : paymentMethod,
          isSplitPayment,
          cashAmount: isSplitPayment ? cashAmount : (paymentMethod === 'cash' ? total : 0),
          upiAmount: isSplitPayment ? upiAmount : (paymentMethod === 'upi' ? total : 0),
          createdAt: new Date()
        };
        return placeholderBill;
      }
      
      return undefined;
      
    } catch (error) {
      console.error("Error in completeSale:", error);
      return undefined;
    }
  };
  
  const exportBills = () => {
    exportBillsBase(customers);
  };
  
  const exportCustomers = () => {
    exportCustomersBase(customers);
  };
  
  // Implement the updateBill function with split payment support
  const updateBill = async (
    originalBill: Bill, 
    updatedItems: CartItem[], 
    customer: Customer, 
    discount: number, 
    discountType: 'percentage' | 'fixed', 
    loyaltyPointsUsed: number,
    isSplitPayment: boolean = false,
    cashAmount: number = 0,
    upiAmount: number = 0
  ): Promise<Bill | null> => {
    return updateBillBase(
      originalBill,
      updatedItems,
      customer,
      discount,
      discountType,
      loyaltyPointsUsed,
      isSplitPayment,
      cashAmount,
      upiAmount
    );
  };
  
  // Simplified reset function - only resets local state
  const handleResetToSampleData = async (options?: ResetOptions) => {
    try {
      // Import the reset function from services
      const { resetToSampleData } = await import('@/services/dataOperations');
      
      // Call the async reset function
      await resetToSampleData(
        options,
        setProducts,
        setCustomers,
        setBills,
        setSessions,
        setStations,
        setCart,
        setDiscountAmount,
        setLoyaltyPointsUsedAmount,
        setSelectedCustomer,
        refreshFromDB
      );
      
      return true;
    } catch (error) {
      console.error('Error in handleResetToSampleData:', error);
      throw error;
    }
  };
  
  // Remove sample data functionality
  const handleAddSampleIndianData = () => {
    const { toast } = useToast();
    toast({
      title: "Info",
      description: "Sample data functionality has been removed. Please add products manually or through database import.",
    });
  };
  
  // Update the deleteBill function to handle bill deletion even if customer has been deleted
  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    return await deleteBillBase(billId, customerId);
  };
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  return (
    <POSContext.Provider
      value={{
        products,
        productsLoading,
        productsError,
        stations,
        customers,
        sessions,
        bills,
        cart,
        selectedCustomer,
        discount,
        discountType,
        loyaltyPointsUsed,
        isStudentDiscount: selectedCustomer ? getCustomerCart(selectedCustomer.id).isStudentDiscount : false,
        isSplitPayment,
        cashAmount,
        upiAmount,
        setIsSplitPayment: handleSetIsSplitPayment,
        setCashAmount: (amount) => setCashAmount(amount),
        setUpiAmount: (amount) => setUpiAmount(amount),
        updateSplitAmounts: handleUpdateSplitAmounts,
        categories,
        setIsStudentDiscount,
        setBills,
        setCustomers,
        setStations,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        startSession,
        endSession,
        deleteStation,
        updateStation,
        addCustomer,
        updateCustomer,
        updateCustomerMembership: updateCustomerMembershipWrapper,
        deleteCustomer,
        selectCustomer,
        checkMembershipValidity,
        deductMembershipHours,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        setDiscount,
        setLoyaltyPointsUsed,
        calculateTotal,
        completeSale,
        updateBill,
        deleteBill,
        exportBills,
        exportCustomers,
        resetToSampleData: handleResetToSampleData,
        addSampleIndianData: handleAddSampleIndianData
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  console.log('usePOS hook called'); // Debug log
  const context = useContext(POSContext);
  if (context === undefined) {
    console.error('usePOS must be used within a POSProvider'); // Debug log
    throw new Error('usePOS must be used within a POSProvider');
  }
  console.log('usePOS hook returning context'); // Debug log
  return context;
};

// Re-export types from types file for convenience
export type { 
  Product,
  Station,
  Customer,
  Session,
  CartItem,
  Bill,
  ResetOptions,
  POSContextType
} from '@/types/pos.types';
