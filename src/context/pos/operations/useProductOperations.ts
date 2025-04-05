
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Product } from '@/types/pos.types';

export const useProductOperations = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Add a new product
  const addProduct = async (productData: Partial<Product>): Promise<Product> => {
    try {
      setIsLoading(true);
      
      // Generate a random ID for the product
      const productId = crypto.randomUUID();
      
      // Create the new product with required fields
      const newProduct: Product = {
        id: productId,
        name: productData.name || '', // Required field, provide default
        price: productData.price || 0, // Required field, provide default
        category: productData.category || 'food', // Required field, provide default
        stock: productData.stock || 0, // Required field, provide default
        image: productData.image,
        originalPrice: productData.originalPrice,
        offerPrice: productData.offerPrice,
        studentPrice: productData.studentPrice,
        duration: productData.duration,
        membershipHours: productData.membershipHours
      };
      
      // Update the local state
      setProducts([...products, newProduct]);
      
      // Show success toast
      toast({
        title: "Product added",
        description: `${newProduct.name} has been added successfully`,
      });
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Could not add product. Please try again.",
        variant: "destructive"
      });
      throw new Error('Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing product
  const updateProduct = async (
    productId: string, 
    updatedData: Partial<Product>
  ): Promise<Product> => {
    try {
      setIsLoading(true);
      
      // Find the product to update
      const productIndex = products.findIndex(p => p.id === productId);
      
      if (productIndex === -1) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Update the product
      const updatedProduct = {
        ...products[productIndex],
        ...updatedData
      };
      
      // Update the local state
      const updatedProducts = [...products];
      updatedProducts[productIndex] = updatedProduct;
      setProducts(updatedProducts);
      
      // Show success toast
      toast({
        title: "Product updated",
        description: `${updatedProduct.name} has been updated successfully`,
      });
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Could not update product. Please try again.",
        variant: "destructive"
      });
      throw new Error('Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Find the product to delete
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      // Remove the product from local state
      setProducts(products.filter(p => p.id !== productId));
      
      // Show success toast
      toast({
        title: "Product deleted",
        description: `${product.name} has been deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Could not delete product. Please try again.",
        variant: "destructive"
      });
      throw new Error('Failed to delete product');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading
  };
};
