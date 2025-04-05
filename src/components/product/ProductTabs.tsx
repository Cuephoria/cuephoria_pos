
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product } from '@/types/pos.types';
import ProductCard from '@/components/ProductCard';
import NoProductsFound from './NoProductsFound';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full h-full flex flex-col">
      <div className="overflow-x-auto pb-1">
        <TabsList className="mb-4 flex flex-wrap gap-1 justify-start sm:justify-center">
          <TabsTrigger value="all">All ({categoryCounts.all || 0})</TabsTrigger>
          <TabsTrigger value="food">Food ({categoryCounts.food || 0})</TabsTrigger>
          <TabsTrigger value="drinks">Drinks ({categoryCounts.drinks || 0})</TabsTrigger>
          <TabsTrigger value="tobacco">Tobacco ({categoryCounts.tobacco || 0})</TabsTrigger>
          <TabsTrigger value="challenges">Challenges ({categoryCounts.challenges || 0})</TabsTrigger>
          <TabsTrigger value="membership">Membership ({categoryCounts.membership || 0})</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value={activeTab} className="mt-2 flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-2">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
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
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default ProductTabs;
