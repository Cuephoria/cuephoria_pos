
import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

// Define the membership products with shorter names
const membershipProducts: Product[] = [
  { 
    id: 'mem1', 
    name: "8-Ball Weekly (2P)",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem2', 
    name: "8-Ball Weekly (4P)",
    originalPrice: 1199,
    offerPrice: 599,
    studentPrice: 499,
    price: 599, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem3', 
    name: "PS5 Weekly",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem4', 
    name: "Combo Weekly",
    originalPrice: 1799,
    offerPrice: 899,
    studentPrice: 799,
    price: 899, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 6
  },
  { 
    id: 'mem5', 
    name: "8-Ball Monthly (2P)",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem6', 
    name: "PS5 Monthly",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem7', 
    name: "Ultimate Monthly",
    originalPrice: 5999,
    offerPrice: 3499,
    studentPrice: 2999,
    price: 3499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 24
  }
];

export const useProducts = (initialProducts: Product[]) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Load data from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('cuephoriaProducts');
    
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      
      // Check if we need to add membership products
      const hasMembershipProducts = parsedProducts.some(
        (p: Product) => p.category === 'membership'
      );
      
      if (!hasMembershipProducts) {
        // If no membership products, add them to the stored products
        setProducts([...parsedProducts, ...membershipProducts]);
      } else {
        setProducts(parsedProducts);
      }
    } else {
      // If no stored products, add membership products to initial products
      setProducts([...initialProducts, ...membershipProducts]);
    }
  }, [initialProducts]);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaProducts', JSON.stringify(products));
  }, [products]);
  
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  return {
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
