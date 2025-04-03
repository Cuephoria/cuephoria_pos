
import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

const membershipProducts: Product[] = [
  { 
    id: 'mem1', 
    name: "Silver - PS5 Weekly Pass (2 PAX)",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399,
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem2', 
    name: "Gold - PS5 Weekly Pass (4 PAX)", 
    originalPrice: 1199,
    offerPrice: 599,
    studentPrice: 499,
    price: 599,
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem3', 
    name: "Silver - 8-Ball Weekly Pass (2 PAX)",
    originalPrice: 599,
    offerPrice: 399,
    studentPrice: 299,
    price: 399,
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem4', 
    name: "Gold - 8-Ball Weekly Pass (4 PAX)",
    originalPrice: 999,
    offerPrice: 599,
    studentPrice: 499,
    price: 599,
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 4
  },
  { 
    id: 'mem5', 
    name: "Platinum - Combo Weekly Pass",
    originalPrice: 1799,
    offerPrice: 899,
    studentPrice: 799,
    price: 899,
    category: 'membership', 
    stock: 9999,
    duration: 'weekly',
    membershipHours: 6
  },
  { 
    id: 'mem6', 
    name: "Silver - 8-Ball Monthly Pass (2 PAX)",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499,
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem7', 
    name: "Silver - PS5 Monthly Pass (2 PAX)",
    originalPrice: 1999,
    offerPrice: 1499,
    studentPrice: 1199,
    price: 1499,
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem8', 
    name: "Gold - PS5 Monthly Pass (4 PAX)",
    originalPrice: 3999,
    offerPrice: 2499,
    studentPrice: 1999,
    price: 2499,
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem9', 
    name: "Gold - 8-Ball Monthly Pass (4 PAX)",
    originalPrice: 3999,
    offerPrice: 2499,
    studentPrice: 1999,
    price: 2499,
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 16
  },
  { 
    id: 'mem10', 
    name: "Platinum - Ultimate Monthly Pass",
    originalPrice: 5999,
    offerPrice: 3499,
    studentPrice: 2999,
    price: 3499,
    category: 'membership', 
    stock: 9999,
    duration: 'monthly',
    membershipHours: 24
  }
];

export const useProducts = (initialProducts: Product[]) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  useEffect(() => {
    const storedProducts = localStorage.getItem('cuephoriaProducts');
    
    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts);
      
      const hasMembershipProducts = parsedProducts.some(
        (p: Product) => p.category === 'membership'
      );
      
      if (!hasMembershipProducts) {
        setProducts([...parsedProducts, ...membershipProducts]);
      } else {
        setProducts(parsedProducts);
      }
    } else {
      setProducts([...initialProducts, ...membershipProducts]);
    }
  }, [initialProducts]);
  
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
