
import React, { createContext, useContext } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  MembershipTier,
  MembershipBenefits
} from '@/types/pos.types';
import { initialProducts, initialStations, initialCustomers } from '@/data/sampleData';
import { resetToSampleData, addSampleIndianData } from '@/services/dataOperations';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { membershipBenefits } from '@/utils/membership.utils';
import { generateId } from '@/utils/pos.utils';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
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
    deleteCustomer, 
    selectCustomer,
    upgradeMembership: upgradeCustomerMembership
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
  
  // Membership related functions
  const getMembershipBenefits = (tier: MembershipTier): MembershipBenefits => {
    return membershipBenefits[tier];
  };
  
  const addMembershipToCart = (tier: MembershipTier) => {
    const benefits = getMembershipBenefits(tier);
    if (tier === 'none') return;
    
    // Apply student discount if the selected customer is a student
    let price = benefits.price;
    if (selectedCustomer?.isStudent && benefits.studentDiscount) {
      price = price - 100; // ₹100 off for students
    }
    
    const membershipCartItem: Omit<CartItem, 'total'> = {
      id: generateId(),
      type: 'membership',
      name: `${benefits.name} Membership`,
      price,
      quantity: 1
    };
    
    addToCart(membershipCartItem);
  };
  
  const upgradeMembership = (customerId: string, tier: MembershipTier) => {
    const updatedCustomer = upgradeCustomerMembership(customerId, tier);
    if (updatedCustomer) {
      return updatedCustomer;
    }
  };
  
  // Wrapper functions that combine functionality from multiple hooks
  const endSession = (stationId: string) => {
    const result = endSessionBase(stationId, customers);
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
      console.log("Adding session to cart:", sessionCartItem);
      addToCart(sessionCartItem);
      
      return result.updatedSession;
    }
  };
  
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
    const bill = completeSaleBase(
      cart, 
      selectedCustomer, 
      discount, 
      discountType, 
      loyaltyPointsUsed, 
      calculateTotal, 
      paymentMethod,
      products
    );
    
    if (bill) {
      // Check if this sale includes a membership purchase
      const membershipItem = cart.find(item => item.type === 'membership');
      if (membershipItem && selectedCustomer) {
        // Extract the membership tier from the item name
        const tierMap: Record<string, MembershipTier> = {
          'Introductory Weekly Pass - 8 ball (2 Pax)': 'basic',
          'Introductory Weekly Pass - 8 Ball (4 Pax)': 'standard',
          'Introductory Weekly Pass - PS5 Gaming': 'premium',
          'Introductory Weekly Pass - Combo': 'combo'
        };
        
        // Find the membership tier based on the item name
        let tier: MembershipTier = 'none';
        for (const [key, value] of Object.entries(tierMap)) {
          if (membershipItem.name.includes(key)) {
            tier = value;
            break;
          }
        }
        
        if (tier !== 'none') {
          // Upgrade customer membership
          upgradeMembership(selectedCustomer.id, tier);
        }
      }
      
      // Clear the cart after successful sale
      clearCart();
      // Reset selected customer
      setSelectedCustomer(null);
    }
    
    return bill;
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
        setStations,
        addProduct,
        updateProduct,
        deleteProduct,
        startSession: startSessionBase,
        endSession,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        selectCustomer,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        setDiscount,
        setLoyaltyPointsUsed,
        calculateTotal,
        completeSale,
        getMembershipBenefits,
        addMembershipToCart,
        upgradeMembership,
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
  POSContextType,
  MembershipTier,
  MembershipBenefits
} from '@/types/pos.types';
