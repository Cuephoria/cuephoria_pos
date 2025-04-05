import { Product } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError, convertFromSupabaseProduct, convertToSupabaseProduct } from "@/integrations/supabase/client";
import { generateId } from '@/utils/pos.utils';

export const useProductOperations = (
  products: Product[], 
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const { toast } = useToast();

  const isProductDuplicate = (productName: string, excludeId?: string): boolean => {
    return products.some(p => 
      p.name.toLowerCase() === productName.toLowerCase() && 
      (!excludeId || p.id !== excludeId)
    );
  };

  const addProduct = async (product: Partial<Product>): Promise<Product> => {
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
      
      throw error;
    }
  };

  const updateProduct = async (productId: string, updatedData: Partial<Product>): Promise<Product> => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }

      if (product.category === 'membership' || product.id.startsWith('mem')) {
        toast({
          title: "Info",
          description: "Membership products are managed by the system and cannot be modified.",
        });
        return product;
      }
      
      if (isProductDuplicate(updatedData.name as string, productId)) {
        toast({
          title: 'Error',
          description: `Another product with name "${updatedData.name}" already exists`,
          variant: 'destructive'
        });
        throw new Error(`Another product named "${updatedData.name}" already exists`);
      }
      
      const updatedProduct = { ...product, ...updatedData };
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      
      supabase
        .from('products')
        .update(convertToSupabaseProduct(updatedProduct))
        .eq('id', productId)
        .then(({ error }) => {
          if (error) {
            console.error('Error updating product in DB:', error);
            toast({
              title: 'Database Sync Error',
              description: `Product updated locally but failed to sync with database: ${error.message}`,
              variant: 'destructive'
            });
            return supabase
              .from('products')
              .insert(convertToSupabaseProduct(updatedProduct));
          } else {
            console.log('Product updated in DB:', updatedProduct.name);
          }
        })
        .then(result => {
          if (result?.error) {
            console.error('Error inserting product after update failure:', result.error);
          }
        });
      
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      
      if (!(error instanceof Error && error.message.includes('already exists'))) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update product',
          variant: 'destructive'
        });
      }
      
      throw error;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
      
      supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting product from DB:', error);
            toast({
              title: 'Database Sync Error',
              description: `Product deleted locally but failed to sync with database: ${error.message}`,
              variant: 'destructive'
            });
          } else {
            console.log('Product deleted from DB:', productId);
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
      throw error;
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct
  };
};
