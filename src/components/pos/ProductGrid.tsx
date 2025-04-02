
import React, { useState } from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Product } from '@/context/POSContext';
import ProductCard from '@/components/ProductCard';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(product => product.category === activeTab);

  const searchedProducts = searchQuery.trim() === ''
    ? filteredProducts
    : filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      <CardHeader className="pb-3 bg-gradient-to-r from-transparent to-cuephoria-blue/10">
        <CardTitle className="text-xl font-heading">Products</CardTitle>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8 font-quicksand"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="animate-scale-in">
        <TabsList className="px-6 bg-gradient-to-r from-cuephoria-purple/30 to-cuephoria-blue/20">
          <TabsTrigger value="all" className="font-heading">All</TabsTrigger>
          <TabsTrigger value="gaming" className="font-heading">Gaming</TabsTrigger>
          <TabsTrigger value="food" className="font-heading">Food</TabsTrigger>
          <TabsTrigger value="drinks" className="font-heading">Drinks</TabsTrigger>
          <TabsTrigger value="tobacco" className="font-heading">Tobacco</TabsTrigger>
          <TabsTrigger value="challenges" className="font-heading">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="flex-grow overflow-auto px-6 mt-4">
          {searchedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchedProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`animate-scale-in delay-${index % 5}`} 
                  style={{animationDelay: `${(index % 5) * 100}ms`}}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <h3 className="text-xl font-medium font-heading">No Products Found</h3>
              <p className="text-muted-foreground mt-2">
                Try a different search or category
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
};

export default ProductGrid;
