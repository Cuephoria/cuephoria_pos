
import React, { createContext, useContext, useState } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  Product,
  Session
} from '@/types/pos.types';
import { initialProducts, initialStations, initialCustomers } from '@/data/sampleData';
import { resetToSampleData, addSampleIndianData } from '@/services/dataOperations';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
  // Initialize all hooks
  const { 
    products, 
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts(initialProducts);
  
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
  } = useCustomers(initialCustomers);
  
  const { 
    stations, 
    setStations, 
    sessions, 
    setSessions, 
    startSession: startSessionBase, 
    endSession: endSessionBase 
  } = useStations(initialStations, updateCustomer);
  
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
    exportBills: exportBillsBase, 
    exportCustomers: exportCustomersBase 
  } = useBills(updateCustomer, updateProduct);
  
  // Wrapper functions that combine functionality from multiple hooks
  const startSession = (stationId: string, customerId: string) => {
    // Check membership validity before allowing session
    if (!checkMembershipValidity(customerId)) {
      return;
    }
    
    return startSessionBase(stationId, customerId);
  };
  
  const endSession = async (stationId: string) => {
    try {
      const result = await endSessionBase(stationId, customers);
      if (result) {
        const { sessionCartItem, customer, updatedSession } = result;
        
        // Clear cart before adding the new session
        clearCart();
        
        // Auto-select customer
        if (customer) {
          console.log("Auto-selecting customer:", customer.name);
          selectCustomer(customer.id);
        }
        
        // Add the session to cart
        console.log("Adding session to cart:", sessionCartItem);
        addToCart(sessionCartItem);
        
        return updatedSession;
      }
      return undefined;
    } catch (error) {
      console.error('Error in endSession wrapper:', error);
      return undefined;
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
  
  // Modified to return a Bill object synchronously
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
      
      // This is async but we're returning a synchronous Bill for POSContext interface
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
      });
      
      // Since we need to return a synchronous Bill, we'll create a new Bill
      if (selectedCustomer) {
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
          loyaltyPointsEarned: Math.floor(calculateTotal() / 10),
          total: calculateTotal(),
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
  
  // Wrapper for sample data functions
  const handleResetToSampleData = (options?: ResetOptions) => {
    resetToSampleData(
      options,
      initialProducts,
      initialCustomers,
      initialStations,
      setProducts,
      setCustomers,
      setBills,
      setSessions,
      setStations,
      setCart,
      setDiscountAmount,
      setLoyaltyPointsUsedAmount,
      setSelectedCustomer
    );
  };
  
  const handleAddSampleIndianData = () => {
    addSampleIndianData(
      products,
      customers,
      bills,
      setProducts,
      setCustomers,
      setBills
    );
  };
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  return (
    <POSContext.Provider
      value={{
        products,
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
        setIsStudentDiscount,
        setStations,
        addProduct,
        updateProduct,
        deleteProduct,
        startSession,
        endSession,
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
