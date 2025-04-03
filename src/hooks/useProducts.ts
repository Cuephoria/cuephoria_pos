import { useState, useEffect } from 'react';
import { Product } from '@/types/pos.types';
import { supabase, handleSupabaseError, convertFromSupabaseProduct, convertToSupabaseProduct } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { initialProducts, indianProducts } from '@/data/sampleData';

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
  
  const lowStockProducts = products.filter(p => p.stock < 5 && p.category !== 'membership');
  
  useEffect(() => {
    console.log('useProducts initialized with', products.length, 'products');
    console.log('Initial sample data products:', initialProducts.length);
    console.log('Membership products:', membershipProducts.length);
    
    const countByCategory = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Products by category:', countByCategory);

    refreshFromDB().catch(err => {
      console.error('Error loading products from DB:', err);
    });
  }, []);
  
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
      
      if (product.category !== 'membership') {
        supabase
          .from('products')
          .insert(convertToSupabaseProduct(newProduct))
          .then(({ error }) => {
            if (error) {
              console.error('Error adding product to DB:', error);
              setError(`Failed to add product to database: ${error.message}`);
              toast({
                title: 'Database Error',
                description: `Product added locally but failed to sync with database: ${error.message}`,
                variant: 'destructive'
              });
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
            toast({
              title: 'Database Sync Error',
              description: `Product updated locally but failed to sync with database: ${error.message}`,
              variant: 'destructive'
            });
            return supabase
              .from('products')
              .insert(convertToSupabaseProduct(product));
          } else {
            console.log('Product updated in DB:', product.name);
          }
        })
        .then(result => {
          if (result?.error) {
            console.error('Error inserting product after update failure:', result.error);
            setError(`Failed to insert product after update failure: ${result.error.message}`);
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
            toast({
              title: 'Database Sync Error',
              description: `Product deleted locally but failed to sync with database: ${error.message}`,
              variant: 'destructive'
            });
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
  
  const resetToInitialProducts = () => {
    const allProducts = [...initialProducts, ...indianProducts, ...membershipProducts];
    setProducts(allProducts);
    setError(null);
    
    const nonMembershipProducts = allProducts.filter(p => p.category !== 'membership');
    
    supabase
      .from('products')
      .delete()
      .neq('id', 'dummy')
      .then(() => {
        if (nonMembershipProducts.length > 0) {
          supabase
            .from('products')
            .insert(nonMembershipProducts.map(convertToSupabaseProduct))
            .then(({ error }) => {
              if (error) {
                console.error('Error syncing products to DB:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to sync products with database',
                  variant: 'destructive'
                });
              } else {
                console.log('Successfully reset and synced products to DB');
                toast({
                  title: 'Success',
                  description: `Reset ${nonMembershipProducts.length} products and synced with database`,
                });
              }
            });
        }
      });
    
    console.log('Reset to initial products:', allProducts.length);
    return allProducts;
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
        
        const uniqueProductsById = new Map<string, Product>();
        const duplicates: string[] = [];
        
        membershipProducts.forEach(product => {
          uniqueProductsById.set(product.id, product);
        });
        
        dbProducts.forEach(product => {
          if (!uniqueProductsById.has(product.id)) {
            const productNameLower = product.name.toLowerCase();
            const duplicateByName = Array.from(uniqueProductsById.values()).find(
              p => p.name.toLowerCase() === productNameLower && p.id !== product.id
            );
            
            if (duplicateByName) {
              duplicates.push(`${product.name} (ID: ${product.id})`);
            } else {
              uniqueProductsById.set(product.id, product);
            }
          } else if (!product.id.startsWith('mem')) {
            duplicates.push(`${product.name} (ID: ${product.id})`);
          }
        });
        
        if (duplicates.length > 0) {
          const duplicateNames = duplicates.slice(0, 3).join(', ') + 
            (duplicates.length > 3 ? ` and ${duplicates.length - 3} more` : '');
          
          toast({
            title: 'Duplicate Products Removed',
            description: `${duplicates.length} duplicate products were found and removed: ${duplicateNames}`,
            variant: "default"
          });
          
          console.warn('Duplicate products removed:', duplicates);
        }
        
        const allProducts = Array.from(uniqueProductsById.values());
        setProducts(allProducts);
        console.log('Refreshed from DB:', allProducts.length);
        
        localStorage.setItem('cuephoriaProducts', JSON.stringify(allProducts));
        
        return allProducts;
      } else {
        console.log('No products in DB, using initial data and syncing to DB');
        
        const initialNonMembershipProducts = [...initialProducts, ...indianProducts]
          .filter(p => p.category !== 'membership');
        
        if (initialNonMembershipProducts.length > 0) {
          const { error: insertError } = await supabase
            .from('products')
            .insert(initialNonMembershipProducts.map(convertToSupabaseProduct));
            
          if (insertError) {
            console.error('Error initializing products in DB:', insertError);
            toast({
              title: 'Warning',
              description: 'Failed to save initial products to database',
              variant: 'destructive'
            });
          } else {
            console.log('Initialized DB with sample products');
            toast({
              title: 'Success',
              description: 'Initialized database with sample products including Indian items',
            });
          }
        }
        
        const allProducts = [...initialProducts, ...indianProducts, ...membershipProducts];
        setProducts(allProducts);
        setError(null);
        return allProducts;
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
    displayLowStockWarning
  };
};

export default useProducts;
