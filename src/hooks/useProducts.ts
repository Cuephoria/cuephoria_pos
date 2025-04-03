
import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

// Define the membership products with shorter names
const membershipProducts: Product[] = [
  { 
    id: 'mem1', 
    name: "Weekly 8-Ball (2P)",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly'
  },
  { 
    id: 'mem2', 
    name: "Weekly 8-Ball (4P)",
    originalPrice: 1199,
    offerPrice: 599,
    studentPrice: 499,
    price: 599, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly'
  },
  { 
    id: 'mem3', 
    name: "Weekly PS5 Gaming",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly'
  },
  { 
    id: 'mem4', 
    name: "Weekly Combo Pass",
    originalPrice: 1799,
    offerPrice: 899,
    studentPrice: 799,
    price: 899, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'weekly'
  },
  { 
    id: 'mem5', 
    name: "Monthly 8-Ball (2P)",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly'
  },
  { 
    id: 'mem6', 
    name: "Monthly PS5 Gaming",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly'
  },
  { 
    id: 'mem7', 
    name: "Monthly Ultimate Combo",
    originalPrice: 5999,
    offerPrice: 3499,
    studentPrice: 2999,
    price: 3499, // Default to offer price
    category: 'membership', 
    stock: 9999,
    duration: 'monthly'
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
