
import React, { useState } from 'react';
import { Plus, Package, Filter, Tag } from 'lucide-react';
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
  const { products, addProduct, updateProduct, deleteProduct } = usePOS();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  const [formState, setFormState] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    originalPrice: '',
    offerPrice: '',
    studentPrice: '',
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
    });
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast({
      title: 'Product Deleted',
      description: 'The product has been removed successfully.',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, price, category, stock, originalPrice, offerPrice, studentPrice } = formState;
    
    if (!name || !price || !category || !stock) {
      toast({
        title: 'Error',
        description: 'Please fill out all required fields',
        variant: 'destructive',
      });
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
    
    if (isEditMode && selectedProduct) {
      updateProduct({ ...productData, id: selectedProduct.id });
      toast({
        title: 'Product Updated',
        description: 'The product has been updated successfully.',
      });
    } else {
      addProduct(productData);
      toast({
        title: 'Product Added',
        description: 'The product has been added successfully.',
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => product.category === activeTab);
  
  const lowStockProducts = products.filter(product => product.stock <= 10 && product.category !== 'membership');

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleChange}
                  placeholder="Enter price in INR"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
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
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formState.stock}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
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
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Update Product' : 'Add Product'}
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
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="food">Food</TabsTrigger>
          <TabsTrigger value="drinks">Drinks</TabsTrigger>
          <TabsTrigger value="tobacco">Tobacco</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAdmin={true}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                />
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
