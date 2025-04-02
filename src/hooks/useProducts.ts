
import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

export function useProducts(initialProducts: Product[]) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Load data from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('cuephoriaProducts');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
  }, []);
  
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
}
