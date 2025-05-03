
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Product } from '@/types/pos.types';
import ProductCard from '@/components/ProductCard';
import NoProductsFound from './NoProductsFound';
import { useAuth } from '@/context/AuthContext';
import { usePOS } from '@/context/POSContext';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [scrollAmount, setScrollAmount] = useState(0);
  const [showScroll, setShowScroll] = useState(false);
  const [tabsRef, setTabsRef] = useState<HTMLDivElement | null>(null);
  
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);

  // Check if we need scroll buttons
  useEffect(() => {
    if (tabsRef) {
      const checkScroll = () => {
        setShowScroll(tabsRef.scrollWidth > tabsRef.clientWidth);
      };
      
      checkScroll();
      window.addEventListener('resize', checkScroll);
      
      return () => {
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [tabsRef, categories]);

  // Handle scrolling tabs
  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsRef) return;
    
    const scrollValue = direction === 'left' ? -200 : 200;
    tabsRef.scrollBy({ left: scrollValue, behavior: 'smooth' });
  };

  // Animation variants for products
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const productVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="relative w-full">
      <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="relative">
          {showScroll && (
            <>
              <button 
                onClick={() => handleScroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 backdrop-blur-sm text-primary-foreground shadow-lg hover:bg-primary/50 transition-all duration-200 -ml-4"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => handleScroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 backdrop-blur-sm text-primary-foreground shadow-lg hover:bg-primary/50 transition-all duration-200 -mr-4"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          
          <div className="overflow-hidden relative">
            <div 
              ref={setTabsRef}
              className="flex overflow-x-auto pb-1 pt-1 cuephoria-scrollbar-hide"
            >
              <TabsList className="mb-2 flex flex-nowrap gap-1 justify-start bg-background/50 backdrop-blur-sm px-2 py-1 rounded-xl border border-primary/20">
                <TabsTrigger 
                  value="all" 
                  className="cuephoria-filter-tag"
                >
                  All ({categoryCounts.all || 0})
                </TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="cuephoria-filter-tag"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({categoryCounts[category] || 0})
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </div>
        
        <TabsContent value={activeTab} className="mt-6 min-h-[300px]">
          {filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {filteredProducts.map((product) => (
                <motion.div 
                  key={product.id} 
                  className="flex h-full"
                  variants={productVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <ProductCard
                    product={product}
                    isAdmin={isAdmin}
                    onEdit={onEdit}
                    onDelete={isAdmin ? onDelete : undefined}
                    className="w-full transform transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <NoProductsFound activeTab={activeTab} onAddProduct={isAdmin ? onAddProduct : undefined} />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductTabs;
