
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product } from '@/types/pos.types';
import ProductCard from '@/components/ProductCard';
import NoProductsFound from './NoProductsFound';
import { useAuth } from '@/context/AuthContext';
import { usePOS } from '@/context/POSContext';

interface ProductTabsProps {
  products: Product[];
  activeTab: string;
  onTabChange: (value: string) => void;
  categoryCounts: Record<string, number>;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddProduct: () => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  products,
  activeTab,
  onTabChange,
  categoryCounts,
  onEdit,
  onDelete,
  onAddProduct
}) => {
  const { user } = useAuth();
  const { categories } = usePOS();
  const isAdmin = user?.isAdmin || false;
  
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category.toLowerCase() === activeTab.toLowerCase());

  // Ensure we have uncategorized tab available
  const displayCategories = [...categories];
  if (!displayCategories.includes('uncategorized')) {
    displayCategories.push('uncategorized');
  }

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4 flex flex-wrap gap-1 justify-start sm:justify-center">
        <TabsTrigger value="all">All ({categoryCounts.all || 0})</TabsTrigger>
        {displayCategories.map(category => (
          <TabsTrigger key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCounts[category] || 0})
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex h-full">
                <ProductCard
                  product={product}
                  isAdmin={isAdmin} // Pass the user's admin status
                  onEdit={onEdit}
                  onDelete={isAdmin ? onDelete : undefined} // Only allow delete for admins
                  className="w-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <NoProductsFound activeTab={activeTab} onAddProduct={isAdmin ? onAddProduct : undefined} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
