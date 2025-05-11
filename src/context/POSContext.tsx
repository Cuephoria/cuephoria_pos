import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  Product,
  Station,
  Session,
  Booking,
  TimeSlot
} from '@/types/pos.types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';

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
  bookings: [],
  setBookings: () => {},
  addBooking: async () => null,
  getStationBookings: () => [],
  getAvailableSlots: async () => [],
  cancelBooking: async () => false,
});

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);

  // State for categories
  const [categories, setCategories] = useState<string[]>([
    'food', 'drinks', 'tobacco', 'challenges', 'membership'
  ]);

  // State for bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  
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
    selectCustomer,
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
  
  const { 
    cart, 
    setCart, 
    discount, 
    setDiscountAmount, 
    discountType, 
    setDiscountType, 
    loyaltyPointsUsed, 
    setLoyaltyPointsUsedAmount, 
    addToCart, 
    removeFromCart, 
    updateCartItem, 
    clearCart, 
    setDiscount, 
    setLoyaltyPointsUsed, 
    calculateTotal 
  } = useCart();
  
  const { 
    bills, 
    setBills, 
    completeSale: completeSaleBase, 
    deleteBill: deleteBillBase,
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
  
  // Wrapper functions that combine functionality from multiple hooks
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    await startSessionBase(stationId, customerId);
  };
  
  // Make endSession return a Promise<void> to match type definition
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
        
        // Clear cart before adding the new session
        clearCart();
        
        // Auto-select customer
        if (customer) {
          console.log("Auto-selecting customer:", customer.name);
          selectCustomer(customer.id);
        }
        
        // Add the session to cart
        if (sessionCartItem) {
          console.log("Adding session to cart:", sessionCartItem);
          addToCart(sessionCartItem);
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
  const completeSale = (paymentMethod: 'cash' | 'upi'): Bill | undefined => {
    try {
      // Apply student price for membership items if student discount is enabled
      if (isStudentDiscount) {
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
        paymentMethod,
        products
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
          // Clear the cart after successful sale
          clearCart();
          // Reset selected customer
          setSelectedCustomer(null);
          // Reset student discount
          setIsStudentDiscount(false);
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
          paymentMethod,
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
  
  // Implement the updateBill function
  const updateBill = async (
    originalBill: Bill, 
    updatedItems: CartItem[], 
    customer: Customer, 
    discount: number, 
    discountType: 'percentage' | 'fixed', 
    loyaltyPointsUsed: number
  ): Promise<Bill | null> => {
    try {
      // Calculate the new bill total
      const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      // Calculate discount value based on type
      let discountValue = 0;
      if (discountType === 'percentage') {
        discountValue = subtotal * (discount / 100);
      } else {
        discountValue = discount;
      }
      
      // Calculate total after discount and loyalty points
      const total = Math.max(0, subtotal - discountValue - loyaltyPointsUsed);
      
      // Calculate loyalty points earned (members: 5 points per 100 INR, non-members: 2 points per 100 INR)
      const pointsRate = customer.isMember ? 5 : 2;
      const loyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
      
      // Calculate the difference in loyalty points used from the original bill
      const loyaltyPointsDifference = loyaltyPointsUsed - originalBill.loyaltyPointsUsed;
      
      // Calculate the difference in points earned (new points earned - original points earned)
      const pointsEarnedDifference = loyaltyPointsEarned - originalBill.loyaltyPointsEarned;
      
      // Calculate the net change in loyalty points for the customer
      const netLoyaltyPointsChange = -loyaltyPointsDifference + pointsEarnedDifference;
      
      // Create updated bill object
      const updatedBill: Bill = {
        ...originalBill,
        items: updatedItems,
        subtotal,
        discount,
        discountValue,
        discountType,
        loyaltyPointsUsed,
        loyaltyPointsEarned,
        total,
      };
      
      // Update bill in Supabase
      const { error: billUpdateError } = await supabase
        .from('bills')
        .update({
          subtotal,
          discount,
          discount_type: discountType,
          discount_value: discountValue, 
          loyalty_points_used: loyaltyPointsUsed,
          loyalty_points_earned: loyaltyPointsEarned,
          total
        })
        .eq('id', originalBill.id);
      
      if (billUpdateError) {
        console.error('Error updating bill:', billUpdateError);
        throw billUpdateError;
      }
      
      // Delete existing bill items
      const { error: deleteItemsError } = await supabase
        .from('bill_items')
        .delete()
        .eq('bill_id', originalBill.id);
      
      if (deleteItemsError) {
        console.error('Error deleting bill items:', deleteItemsError);
        throw deleteItemsError;
      }
      
      // Insert updated bill items
      const billItemsToInsert = updatedItems.map(item => ({
        bill_id: originalBill.id,
        item_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        item_type: item.type
      }));
      
      const { error: insertItemsError } = await supabase
        .from('bill_items')
        .insert(billItemsToInsert);
      
      if (insertItemsError) {
        console.error('Error inserting bill items:', insertItemsError);
        throw insertItemsError;
      }
      
      // Update customer's loyalty points
      if (netLoyaltyPointsChange !== 0) {
        const updatedCustomer = {
          ...customer,
          loyaltyPoints: customer.loyaltyPoints + netLoyaltyPointsChange
        };
        
        // Update customer in database
        const { error: customerUpdateError } = await supabase
          .from('customers')
          .update({ loyalty_points: updatedCustomer.loyaltyPoints })
          .eq('id', customer.id);
        
        if (customerUpdateError) {
          console.error('Error updating customer loyalty points:', customerUpdateError);
          throw customerUpdateError;
        }
        
        // Update customer in state
        updateCustomer(updatedCustomer);
      }
      
      // Update local bills state
      setBills(prevBills => prevBills.map(bill => 
        bill.id === updatedBill.id ? updatedBill : bill
      ));
      
      return updatedBill;
      
    } catch (error) {
      console.error('Error in updateBill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the transaction.',
        variant: 'destructive'
      });
      return null;
    }
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
  
  // Fetch bookings from Supabase
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, customers(name)')
          .order('booking_date', { ascending: true });

        if (error) {
          console.error('Error fetching bookings:', error);
          return;
        }

        // Transform data to match our types
        const transformedBookings: Booking[] = data.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          customerName: item.customers?.name || 'Unknown',
          bookingDate: item.booking_date,
          startTime: item.start_time,
          endTime: item.end_time,
          duration: item.duration,
          status: item.status as 'confirmed' | 'canceled' | 'completed',
          createdAt: item.created_at,
          notes: item.notes || undefined
        }));

        setBookings(transformedBookings);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  // Add a new booking
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking | null> => {
    try {
      // Convert to snake_case for Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          station_id: bookingData.stationId,
          customer_id: bookingData.customerId,
          booking_date: bookingData.bookingDate,
          start_time: bookingData.startTime,
          end_time: bookingData.endTime,
          duration: bookingData.duration,
          status: bookingData.status,
          notes: bookingData.notes
        })
        .select('*, customers(name)')
        .single();

      if (error) {
        console.error('Error adding booking:', error);
        return null;
      }

      if (!data) {
        console.error('No data returned from booking insert');
        return null;
      }

      // Transform and add to state
      const newBooking: Booking = {
        id: data.id,
        stationId: data.station_id,
        customerId: data.customer_id,
        customerName: data.customers?.name || 'Unknown',
        bookingDate: data.booking_date,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
        status: data.status as 'confirmed' | 'canceled' | 'completed',
        createdAt: data.created_at,
        notes: data.notes || undefined
      };

      setBookings(prev => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      console.error('Failed to add booking:', err);
      return null;
    }
  };

  // Get bookings for a specific station and date
  const getStationBookings = (stationId: string, date: string): Booking[] => {
    return bookings.filter(
      booking => booking.stationId === stationId && 
                booking.bookingDate === date && 
                booking.status === 'confirmed'
    );
  };

  // Get available time slots for a specific station and date
  const getAvailableSlots = async (
    stationId: string, 
    date: string,
    duration: number = 60
  ): Promise<TimeSlot[]> => {
    try {
      // Call the get_available_slots function in Supabase
      const { data, error } = await supabase.rpc('get_available_slots', { 
        p_date: date,
        p_station_id: stationId,
        p_slot_duration: duration
      });

      if (error) {
        console.error('Error fetching available slots:', error);
        return [];
      }

      return data.map((slot: any) => ({
        startTime: slot.start_time,
        endTime: slot.end_time,
        isAvailable: slot.is_available
      }));
    } catch (err) {
      console.error('Failed to fetch available slots:', err);
      return [];
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'canceled' })
        .eq('id', bookingId);

      if (error) {
        console.error('Error canceling booking:', error);
        return false;
      }

      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'canceled' } 
            : booking
        )
      );

      return true;
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      return false;
    }
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
        isStudentDiscount,
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
        addSampleIndianData: handleAddSampleIndianData,
        bookings,
        setBookings,
        addBooking,
        getStationBookings,
        getAvailableSlots,
        cancelBooking,
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
  POSContextType,
  Booking,
  TimeSlot
} from '@/types/pos.types';
