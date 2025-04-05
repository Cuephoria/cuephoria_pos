
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product } from '@/types/pos.types';
import ProductCard from '@/components/ProductCard';
import NoProductsFound from './NoProductsFound';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className={`${isMobile ? 'overflow-x-auto' : ''} bg-slate-800 rounded-md mb-4`}>
        <TabsList className="bg-transparent w-full flex flex-nowrap justify-start">
          <TabsTrigger value="all" className="text-white data-[state=active]:bg-slate-900">
            All ({categoryCounts.all || 0})
          </TabsTrigger>
          <TabsTrigger value="food" className="text-white data-[state=active]:bg-slate-900">
            Food ({categoryCounts.food || 0})
          </TabsTrigger>
          <TabsTrigger value="drinks" className="text-white data-[state=active]:bg-slate-900">
            Drinks ({categoryCounts.drinks || 0})
          </TabsTrigger>
          <TabsTrigger value="tobacco" className="text-white data-[state=active]:bg-slate-900">
            Tobacco ({categoryCounts.tobacco || 0})
          </TabsTrigger>
          <TabsTrigger value="challenges" className="text-white data-[state=active]:bg-slate-900">
            Challenges ({categoryCounts.challenges || 0})
          </TabsTrigger>
          <TabsTrigger value="membership" className="text-white data-[state=active]:bg-slate-900">
            Membership ({categoryCounts.membership || 0})
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value={activeTab} className="mt-0">
        <ScrollArea className="h-full max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex h-full">
                  <ProductCard
                    product={product}
                    isAdmin={isAdmin}
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
