import React, { useState, useEffect } from 'react';
import { Plus, Package, Filter, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePOS, Product } from '@/context/POSContext';
import ProductCard from '@/components/ProductCard';
import { useToast } from '@/hooks/use-toast';

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct, resetToInitialProducts, refreshFromDB } = usePOS();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [debugMessage, setDebugMessage] = useState('');

  const [formState, setFormState] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    originalPrice: '',
    offerPrice: '',
    studentPrice: '',
    duration: '',
    membershipHours: '',
  });

  const resetForm = () => {
    setFormState({
      name: '',
      price: '',
      category: '',
      stock: '',
      originalPrice: '',
      offerPrice: '',
      studentPrice: '',
      duration: '',
      membershipHours: '',
    });
    setIsEditMode(false);
    setSelectedProduct(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormState({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      offerPrice: product.offerPrice?.toString() || '',
      studentPrice: product.studentPrice?.toString() || '',
      duration: product.duration || '',
      membershipHours: product.membershipHours?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    try {
      deleteProduct(id);
      toast({
        title: 'Product Deleted',
        description: 'The product has been removed successfully.',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const { name, price, category, stock, originalPrice, offerPrice, studentPrice, duration, membershipHours } = formState;
      
      if (!name || !price || !category || !stock) {
        toast({
          title: 'Error',
          description: 'Please fill out all required fields',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }
      
      const productData: Omit<Product, 'id'> = {
        name,
        price: Number(price),
        category: category as 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership',
        stock: Number(stock),
      };
      
      if (originalPrice) productData.originalPrice = Number(originalPrice);
      if (offerPrice) productData.offerPrice = Number(offerPrice);
      if (studentPrice) productData.studentPrice = Number(studentPrice);
      
      if (category === 'membership') {
        if (duration) productData.duration = duration as 'weekly' | 'monthly';
        if (membershipHours) productData.membershipHours = Number(membershipHours);
      }
      
      console.log('Submitting product data:', productData);
      
      if (isEditMode && selectedProduct) {
        await updateProduct({ ...productData, id: selectedProduct.id });
        toast({
          title: 'Product Updated',
          description: 'The product has been updated successfully.',
        });
      } else {
        await addProduct(productData);
        toast({
          title: 'Product Added',
          description: 'The product has been added successfully.',
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save product. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleResetProducts = () => {
    try {
      setIsResetting(true);
      setDebugMessage('Resetting products...');
      
      const resetProducts = resetToInitialProducts ? resetToInitialProducts() : [];
      
      toast({
        title: 'Products Reset',
        description: `Reset to ${resetProducts.length} initial products`,
      });
      
      setDebugMessage(`Reset complete. Products: ${resetProducts.length}`);
    } catch (error) {
      console.error('Reset error:', error);
      setDebugMessage(`Reset error: ${error}`);
      toast({
        title: 'Error',
        description: 'Failed to reset products',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleRefreshProducts = async () => {
    try {
      setIsRefreshing(true);
      setDebugMessage('Refreshing from database...');
      
      const refreshedProducts = refreshFromDB ? await refreshFromDB() : [];
      
      toast({
        title: 'Products Refreshed',
        description: `Loaded ${refreshedProducts.length} products from database`,
      });
      
      setDebugMessage(`Refresh complete. Products: ${refreshedProducts.length}`);
    } catch (error) {
      console.error('Refresh error:', error);
      setDebugMessage(`Refresh error: ${error}`);
      toast({
        title: 'Error',
        description: 'Failed to refresh products',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getCategoryCounts = () => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach(product => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();
  
  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);
  
  const lowStockProducts = products.filter(product => 
    product.stock <= 10 && 
    product.category !== 'membership' &&
    product.category !== 'challenges'
  );

  useEffect(() => {
    console.log('Products component rendered with', products.length, 'products');
    setDebugMessage(`Current products: ${products.length}. Filtered: ${filteredProducts.length}`);
  }, [products, filteredProducts.length]);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex space-x-2">
          <Button onClick={handleRefreshProducts} variant="outline" disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            Refresh DB
          </Button>
          <Button onClick={handleResetProducts} variant="outline" disabled={isResetting}>
            <RotateCcw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} /> 
            Reset
          </Button>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <p className="font-medium">Debug Info:</p>
        <p>Total products: {products.length} | Current tab: {activeTab} | Products in view: {filteredProducts.length}</p>
        <p>Categories: {Object.entries(categoryCounts).map(([cat, count]) => `${cat}: ${count}`).join(', ')}</p>
        <p>{debugMessage}</p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)*</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleChange}
                  placeholder="Enter price in INR"
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category*</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="drinks">Drinks</SelectItem>
                    <SelectItem value="tobacco">Tobacco</SelectItem>
                    <SelectItem value="challenges">Challenges</SelectItem>
                    <SelectItem value="membership">Membership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock*</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formState.stock}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  min="0"
                  required
                />
              </div>

              {formState.category === 'membership' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      value={formState.originalPrice}
                      onChange={handleChange}
                      placeholder="Enter original price"
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="offerPrice">Offer Price (₹)</Label>
                    <Input
                      id="offerPrice"
                      name="offerPrice"
                      type="number"
                      value={formState.offerPrice}
                      onChange={handleChange}
                      placeholder="Enter offer price"
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="studentPrice">Student Price (₹)</Label>
                    <Input
                      id="studentPrice"
                      name="studentPrice"
                      type="number"
                      value={formState.studentPrice}
                      onChange={handleChange}
                      placeholder="Enter student price"
                      min="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formState.duration}
                      onValueChange={(value) => handleSelectChange('duration', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="membershipHours">Membership Hours</Label>
                    <Input
                      id="membershipHours"
                      name="membershipHours"
                      type="number"
                      value={formState.membershipHours}
                      onChange={handleChange}
                      placeholder="Enter membership hours"
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Filter className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Inventory Alert:</span> The following products are low in stock:
                {lowStockProducts.map((product, index) => (
                  <span key={product.id} className="font-medium">
                    {index === 0 ? ' ' : ', '}
                    {product.name} ({product.stock} left)
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({categoryCounts.all || 0})</TabsTrigger>
          <TabsTrigger value="food">Food ({categoryCounts.food || 0})</TabsTrigger>
          <TabsTrigger value="drinks">Drinks ({categoryCounts.drinks || 0})</TabsTrigger>
          <TabsTrigger value="tobacco">Tobacco ({categoryCounts.tobacco || 0})</TabsTrigger>
          <TabsTrigger value="challenges">Challenges ({categoryCounts.challenges || 0})</TabsTrigger>
          <TabsTrigger value="membership">Membership ({categoryCounts.membership || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard
                    product={product}
                    isAdmin={true}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No Products Found</h3>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'all'
                  ? "You haven't added any products yet."
                  : `No products in the ${activeTab} category.`}
              </p>
              <Button className="mt-4" onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Products;
