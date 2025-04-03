import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { supabase, handleSupabaseError, convertFromSupabaseProduct, convertToSupabaseProduct } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { initialProducts } from '@/data/sampleData';

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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([...initialProducts, ...membershipProducts]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    console.log('useProducts initialized with', products.length, 'products');
    console.log('Initial sample data products:', initialProducts.length);
    console.log('Membership products:', membershipProducts.length);
    
    const countByCategory = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Products by category:', countByCategory);
  }, []);
  
  const addProduct = (product: Omit<Product, 'id'>) => {
    try {
      const newProductId = generateId();
      const newProduct: Product = {
        ...product,
        id: newProductId
      };
      
      setProducts(prev => [...prev, newProduct]);
      
      if (product.category !== 'membership') {
        supabase
          .from('products')
          .insert(convertToSupabaseProduct(newProduct))
          .then(({ error }) => {
            if (error) {
              console.error('Error adding product to DB:', error);
            } else {
              console.log('Product added to DB:', newProduct.name);
            }
          });
      }
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const updateProduct = (product: Product) => {
    try {
      if (product.category === 'membership' || product.id.startsWith('mem')) {
        toast({
          title: "Info",
          description: "Membership products are managed by the system and cannot be modified.",
        });
        return product;
      }
      
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      
      supabase
        .from('products')
        .update(convertToSupabaseProduct(product))
        .eq('id', product.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating product in DB:', error);
            return supabase
              .from('products')
              .insert(convertToSupabaseProduct(product));
          }
        })
        .then(result => {
          if (result?.error) {
            console.error('Error inserting product after update failure:', result.error);
          } else {
            console.log('Product updated in DB:', product.name);
          }
        });
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const deleteProduct = (id: string) => {
    try {
      if (id.startsWith('mem')) {
        toast({
          title: "Info",
          description: "Membership products are managed by the system and cannot be deleted.",
        });
        return;
      }
      
      setProducts(prev => prev.filter(p => p.id !== id));
      
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting product from DB:', error);
          } else {
            console.log('Product deleted from DB:', id);
          }
        });
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
      throw error;
    }
  };
  
  const resetToInitialProducts = () => {
    const allProducts = [...initialProducts, ...membershipProducts];
    setProducts(allProducts);
    console.log('Reset to initial products:', allProducts.length);
    return allProducts;
  };
  
  const refreshFromDB = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch products from database',
          variant: 'destructive'
        });
        return products;
      }
      
      if (data && data.length > 0) {
        const dbProducts = data.map(convertFromSupabaseProduct);
        
        const membershipIds = new Set(membershipProducts.map(p => p.id));
        const nonMembershipDbProducts = dbProducts.filter(p => !membershipIds.has(p.id));
        
        const allProducts = [...nonMembershipDbProducts, ...membershipProducts];
        setProducts(allProducts);
        console.log('Refreshed from DB:', allProducts.length);
        return allProducts;
      } else {
        console.log('No products in DB, using initial');
        return resetToInitialProducts();
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while refreshing products',
        variant: 'destructive'
      });
      return products;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    products,
    loading,
    error,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    resetToInitialProducts,
    refreshFromDB
  };
};
