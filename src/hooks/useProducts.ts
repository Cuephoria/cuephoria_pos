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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    refreshFromDB();
  }, []);
  
  const lowStockProducts = products.filter(p => p.stock < 5 && p.category !== 'membership');
  
  const isProductDuplicate = (productName: string, excludeId?: string): boolean => {
    return products.some(p => 
      p.name.toLowerCase() === productName.toLowerCase() && 
      (!excludeId || p.id !== excludeId)
    );
  };
  
  const addProduct = (product: Omit<Product, 'id'>) => {
    try {
      if (isProductDuplicate(product.name)) {
        toast({
          title: 'Error',
          description: `A product with name "${product.name}" already exists`,
          variant: 'destructive'
        });
        throw new Error(`Product "${product.name}" already exists`);
      }
      
      const newProductId = generateId();
      const newProduct: Product = {
        ...product,
        id: newProductId
      };
      
      setProducts(prev => [...prev, newProduct]);
      
      supabase
        .from('products')
        .insert(convertToSupabaseProduct(newProduct))
        .then(({ error }) => {
          if (error) {
            console.error('Error adding product to DB:', error);
            setError(`Failed to add product to database: ${error.message}`);
          } else {
            console.log('Product added to DB:', newProduct.name);
          }
        });
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      
      if (!(error instanceof Error && error.message.includes('already exists'))) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add product',
          variant: 'destructive'
        });
      }
      
      setError(error instanceof Error ? error.message : 'Unknown error adding product');
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
      
      if (isProductDuplicate(product.name, product.id)) {
        toast({
          title: 'Error',
          description: `Another product with name "${product.name}" already exists`,
          variant: 'destructive'
        });
        throw new Error(`Another product named "${product.name}" already exists`);
      }
      
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      
      supabase
        .from('products')
        .update(convertToSupabaseProduct(product))
        .eq('id', product.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating product in DB:', error);
            setError(`Failed to update product in database: ${error.message}`);
            return supabase
              .from('products')
              .insert(convertToSupabaseProduct(product));
          }
        })
        .then(result => {
          if (result?.error) {
            console.error('Error inserting product after update failure:', result.error);
            setError(`Failed to insert product after update failure: ${result.error.message}`);
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
      
      if (!(error instanceof Error && error.message.includes('already exists'))) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update product',
          variant: 'destructive'
        });
      }
      
      setError(error instanceof Error ? error.message : 'Unknown error updating product');
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
            setError(`Failed to delete product from database: ${error.message}`);
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
        description: error instanceof Error ? error.message : 'Failed to delete product',
        variant: 'destructive'
      });
      setError(error instanceof Error ? error.message : 'Unknown error deleting product');
      throw error;
    }
  };
  
  const resetToInitialProducts = async () => {
    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .not('id', 'is', null);
      
      if (deleteError) {
        console.error('Error deleting existing products:', deleteError);
        throw new Error(`Failed to reset products: ${deleteError.message}`);
      }
      
      const allProducts = [...initialProducts, ...membershipProducts];
      
      for (const product of allProducts) {
        const { error: insertError } = await supabase
          .from('products')
          .insert(convertToSupabaseProduct(product));
        
        if (insertError) {
          console.error('Error inserting product:', insertError);
        }
      }
      
      return await refreshFromDB();
    } catch (error) {
      console.error('Error in resetToInitialProducts:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reset products',
        variant: 'destructive'
      });
      setError(error instanceof Error ? error.message : 'Unknown error resetting products');
      return products;
    } finally {
      setLoading(false);
    }
  };
  
  const refreshFromDB = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('products').select('*');
      
      if (error) {
        console.error('Error fetching products:', error);
        setError(`Failed to fetch products: ${error.message}`);
        toast({
          title: 'Error',
          description: 'Failed to fetch products from database',
          variant: 'destructive'
        });
        
        return products;
      }
      
      if (data && data.length > 0) {
        const dbProducts = data.map(convertFromSupabaseProduct);
        setProducts(dbProducts);
        console.log('Refreshed from DB:', dbProducts.length);
        return dbProducts;
      } else {
        console.log('No products in DB, syncing initial data');
        return await syncInitialDataToSupabase();
      }
    } catch (error) {
      console.error('Error refreshing products:', error);
      setError(error instanceof Error ? error.message : 'Unknown error refreshing products');
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
  
  const syncInitialDataToSupabase = async () => {
    try {
      const allProducts = [...initialProducts, ...membershipProducts];
      
      for (const product of allProducts) {
        const { error } = await supabase
          .from('products')
          .insert(convertToSupabaseProduct(product))
          .onConflict('id')
          .merge();
        
        if (error) {
          console.error('Error syncing product to Supabase:', error);
        }
      }
      
      const { data, error } = await supabase.from('products').select('*');
      
      if (error) {
        console.error('Error fetching products after sync:', error);
        setError(`Failed to fetch products after sync: ${error.message}`);
        setProducts(allProducts);
        return allProducts;
      }
      
      if (data && data.length > 0) {
        const dbProducts = data.map(convertFromSupabaseProduct);
        setProducts(dbProducts);
        console.log('Synced and refreshed from DB:', dbProducts.length);
        return dbProducts;
      } else {
        setProducts(allProducts);
        return allProducts;
      }
    } catch (error) {
      console.error('Error syncing initial data:', error);
      const allProducts = [...initialProducts, ...membershipProducts];
      setProducts(allProducts);
      return allProducts;
    }
  };
  
  const displayLowStockWarning = () => {
    toast({
      title: "Low Stock Alert",
      description: `You have ${lowStockProducts.length} products with low stock levels.`,
      variant: "destructive"
    });
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
    refreshFromDB,
    syncInitialDataToSupabase,
    displayLowStockWarning
  };
};

export default useProducts;
