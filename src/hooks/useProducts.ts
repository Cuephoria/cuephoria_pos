import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First check if we already have products in localStorage (for backward compatibility)
        const storedProducts = localStorage.getItem('cuephoriaProducts');
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          setProducts(parsedProducts);
          
          // Migrate localStorage data to Supabase
          for (const product of parsedProducts) {
            await supabase.from('products').upsert(
              {
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category,
                stock: product.stock,
                image: product.image,
                original_price: product.originalPrice,
                offer_price: product.offerPrice,
                student_price: product.studentPrice,
                duration: product.duration,
                membership_hours: product.membershipHours
              },
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaProducts');
          return;
        }
        
        // Fetch products from Supabase
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) {
          console.error('Error fetching products:', error);
          return;
        }
        
        // Transform data to match our Product type
        if (data) {
          const transformedProducts = data.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category as 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership',
            stock: item.stock,
            image: item.image || undefined,
            originalPrice: item.original_price || undefined,
            offerPrice: item.offer_price || undefined,
            studentPrice: item.student_price || undefined,
            duration: item.duration as 'weekly' | 'monthly' | undefined,
            membershipHours: item.membership_hours || undefined
          }));
          
          // Check if we need to add membership products
          const hasMembershipProducts = transformedProducts.some(
            (p: Product) => p.category === 'membership'
          );
          
          if (!hasMembershipProducts && transformedProducts.length > 0) {
            // Add membership products to database
            for (const product of membershipProducts) {
              const { error } = await supabase.from('products').insert({
                name: product.name,
                price: product.price,
                category: product.category,
                stock: product.stock,
                original_price: product.originalPrice,
                offer_price: product.offerPrice,
                student_price: product.studentPrice,
                duration: product.duration,
                membership_hours: product.membershipHours
              });
              
              if (error) {
                console.error('Error adding membership product:', error);
              }
            }
            
            // Fetch products again to get the newly added membership products
            const { data: updatedData, error: updatedError } = await supabase
              .from('products')
              .select('*');
              
            if (updatedError) {
              console.error('Error fetching updated products:', updatedError);
              return;
            }
            
            if (updatedData) {
              const updatedProducts = updatedData.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                category: item.category as 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership',
                stock: item.stock,
                image: item.image || undefined,
                originalPrice: item.original_price || undefined,
                offerPrice: item.offer_price || undefined,
                studentPrice: item.student_price || undefined,
                duration: item.duration as 'weekly' | 'monthly' | undefined,
                membershipHours: item.membership_hours || undefined
              }));
              
              setProducts(updatedProducts);
            }
          } else {
            setProducts(transformedProducts.length > 0 ? transformedProducts : [...initialProducts, ...membershipProducts]);
          }
        } else {
          // Fallback to initialProducts + membershipProducts
          setProducts([...initialProducts, ...membershipProducts]);
        }
      } catch (error) {
        console.error('Error in fetchProducts:', error);
        // Fallback to initialProducts + membershipProducts
        setProducts([...initialProducts, ...membershipProducts]);
      }
    };
    
    fetchProducts();
  }, [initialProducts]);
  
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image: product.image,
          original_price: product.originalPrice,
          offer_price: product.offerPrice,
          student_price: product.studentPrice,
          duration: product.duration,
          membership_hours: product.membershipHours
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding product:', error);
        toast({
          title: 'Error',
          description: 'Failed to add product',
          variant: 'destructive'
        });
        return;
      }
      
      if (data) {
        const newProduct: Product = {
          id: data.id,
          name: data.name,
          price: data.price,
          category: data.category as 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership',
          stock: data.stock,
          image: data.image || undefined,
          originalPrice: data.original_price || undefined,
          offerPrice: data.offer_price || undefined,
          studentPrice: data.student_price || undefined,
          duration: data.duration as 'weekly' | 'monthly' | undefined,
          membershipHours: data.membership_hours || undefined
        };
        
        setProducts([...products, newProduct]);
      }
    } catch (error) {
      console.error('Error in addProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive'
      });
    }
  };
  
  const updateProduct = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          category: product.category,
          stock: product.stock,
          image: product.image,
          original_price: product.originalPrice,
          offer_price: product.offerPrice,
          student_price: product.studentPrice,
          duration: product.duration,
          membership_hours: product.membershipHours
        })
        .eq('id', product.id);
        
      if (error) {
        console.error('Error updating product:', error);
        toast({
          title: 'Error',
          description: 'Failed to update product',
          variant: 'destructive'
        });
        return;
      }
      
      setProducts(products.map(p => p.id === product.id ? product : p));
    } catch (error) {
      console.error('Error in updateProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive'
      });
    }
  };
  
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive'
        });
        return;
      }
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };
  
  return {
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
