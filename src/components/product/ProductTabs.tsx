
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product } from '@/types/pos.types';
import ProductCard from '@/components/ProductCard';
import NoProductsFound from './NoProductsFound';

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
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4 flex flex-wrap gap-1 justify-start sm:justify-center">
        <TabsTrigger value="all">All ({categoryCounts.all || 0})</TabsTrigger>
        <TabsTrigger value="food">Food ({categoryCounts.food || 0})</TabsTrigger>
        <TabsTrigger value="drinks">Drinks ({categoryCounts.drinks || 0})</TabsTrigger>
        <TabsTrigger value="tobacco">Tobacco ({categoryCounts.tobacco || 0})</TabsTrigger>
        <TabsTrigger value="challenges">Challenges ({categoryCounts.challenges || 0})</TabsTrigger>
        <TabsTrigger value="membership">Membership ({categoryCounts.membership || 0})</TabsTrigger>
      </TabsList>
      
      <TabsContent value={activeTab} className="mt-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex h-full">
                <ProductCard
                  product={product}
                  isAdmin={true}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <NoProductsFound activeTab={activeTab} onAddProduct={onAddProduct} />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
