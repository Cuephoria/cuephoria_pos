
import React from 'react';
import { 
  Customer, 
  Product, 
  Bill, 
  Session, 
  CartItem
} from '@/types/pos.types';

// Customer membership wrapper function
export const createUpdateCustomerMembershipWrapper = (
  customers: Customer[],
  updateCustomerMembership: (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ) => Promise<Customer | undefined>
) => {
  return (
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
};

// Session functions
export const createStartSessionWrapper = (
  checkMembershipValidity: (customerId: string) => boolean,
  startSessionBase: (stationId: string, customerId: string) => Promise<Session | undefined>
) => {
  return async (stationId: string, customerId: string): Promise<void> => {
    // Check membership validity before allowing session
    if (!checkMembershipValidity(customerId)) {
      throw new Error("Membership not valid or expired");
    }
    
    await startSessionBase(stationId, customerId);
  };
};

export const createEndSessionWrapper = (
  stations: Customer[],
  endSessionBase: (stationId: string, customers: Customer[]) => Promise<{
    sessionCartItem?: CartItem;
    customer?: Customer;
  } | undefined>,
  clearCart: () => void,
  selectCustomer: (id: string | null) => void,
  addToCart: (item: Omit<CartItem, 'total'>) => void
) => {
  return async (stationId: string): Promise<void> => {
    try {
      // Get the current station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied) {
        console.log("No active session found for this station in wrapper");
        throw new Error("No active session found");
      }
      
      // Call the base endSession function
      const result = await endSessionBase(stationId, stations);
      
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
};

// Sale functions
export const createCompleteSaleWrapper = (
  cart: CartItem[],
  selectedCustomer: Customer | null,
  discount: number,
  discountType: 'percentage' | 'fixed',
  loyaltyPointsUsed: number,
  calculateTotal: () => number,
  products: Product[],
  isStudentDiscount: boolean,
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  completeSaleBase: (
    cart: CartItem[],
    customer: Customer | null,
    discount: number,
    discountType: 'percentage' | 'fixed',
    loyaltyPointsUsed: number,
    calculateTotal: () => number,
    paymentMethod: 'cash' | 'upi',
    products: Product[]
  ) => Promise<Bill | undefined>,
  updateCustomerMembership: (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ) => Promise<Customer | undefined>,
  clearCart: () => void,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>,
  setIsStudentDiscount: React.Dispatch<React.SetStateAction<boolean>>
) => {
  return (paymentMethod: 'cash' | 'upi'): Bill | undefined => {
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
};
