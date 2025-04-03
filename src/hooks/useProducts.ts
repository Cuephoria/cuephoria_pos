
import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { supabase, handleSupabaseError, convertFromSupabaseProduct, convertToSupabaseProduct } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching products...');
        
        // Fetch products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) {
          const errorMessage = handleSupabaseError(error, 'fetching products');
          setError(errorMessage);
          console.error('Error fetching products:', error);
          // Fallback to initialProducts + membershipProducts
          setProducts([...initialProducts, ...membershipProducts]);
          setLoading(false);
          return;
        }
        
        // Transform data to match our Product type
        if (data && data.length > 0) {
          console.log('Retrieved', data.length, 'products from Supabase');
          const transformedProducts = data.map(convertFromSupabaseProduct);
          
          setProducts(transformedProducts);
        } else {
          console.log('No products found in Supabase, initializing with default products');
          // Add default products to Supabase
          const allDefaultProducts = [...initialProducts, ...membershipProducts];
          
          for (const product of allDefaultProducts) {
            const supabaseProduct = convertToSupabaseProduct({
              ...product,
              id: product.id || generateId()
            });
            
            const { error: insertError } = await supabase
              .from('products')
              .insert(supabaseProduct);
              
            if (insertError) {
              console.error('Error adding default product to Supabase:', insertError);
            }
          }
          
          // Fetch the products again after adding
          const { data: updatedData, error: fetchError } = await supabase
            .from('products')
            .select('*');
            
          if (fetchError) {
            console.error('Error fetching updated products:', fetchError);
            setProducts(allDefaultProducts);
          } else if (updatedData) {
            const updatedProducts = updatedData.map(convertFromSupabaseProduct);
            setProducts(updatedProducts);
          } else {
            setProducts(allDefaultProducts);
          }
        }
        
        setLoading(false);
        
      } catch (error) {
        console.error('Unexpected error in fetchProducts:', error);
        setError('Failed to load products. Please try again later.');
        // Fallback to initialProducts + membershipProducts
        setProducts([...initialProducts, ...membershipProducts]);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [initialProducts]);
  
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Adding product:', product);
      
      const newProductId = generateId();
      const supabaseProduct = convertToSupabaseProduct({
        ...product,
        id: newProductId
      });
      
      const { data, error } = await supabase
        .from('products')
        .insert(supabaseProduct)
        .select();
        
      if (error) {
        const errorMessage = handleSupabaseError(error, 'adding product');
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      console.log('Product added to Supabase:', data);
      
      const newProduct: Product = {
        id: newProductId,
        ...product
      };
      
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
      
    } catch (error) {
      console.error('Unexpected error in addProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateProduct = async (product: Product) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Updating product:', product);
      
      const supabaseProduct = convertToSupabaseProduct(product);
      
      // First check if the product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('*')
        .eq('id', product.id)
        .single();
        
      if (checkError) {
        console.log('Error checking product existence:', checkError);
        // Product might not exist in Supabase yet, try to insert it
        const { error: insertError } = await supabase
          .from('products')
          .insert(supabaseProduct);
          
        if (insertError) {
          const errorMessage = handleSupabaseError(insertError, 'inserting product');
          setError(errorMessage);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
      } else {
        // Product exists, update it
        const { error: updateError } = await supabase
          .from('products')
          .update(supabaseProduct)
          .eq('id', product.id);
          
        if (updateError) {
          const errorMessage = handleSupabaseError(updateError, 'updating product');
          setError(errorMessage);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }
      }
      
      console.log('Product updated in Supabase');
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? product : p)
      );
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      
    } catch (error) {
      console.error('Unexpected error in updateProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Deleting product with ID:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) {
        const errorMessage = handleSupabaseError(error, 'deleting product');
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      console.log('Product deleted from Supabase');
      
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
    } catch (error) {
      console.error('Unexpected error in deleteProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again later.',
        variant: 'destructive'
      });
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
    deleteProduct
  };
};
