
import React, { useState, useEffect } from 'react';
import { Bill, CartItem, Product } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Plus, Save, X } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ReceiptItemsProps {
  bill: Bill;
  onUpdateItems?: (items: CartItem[]) => void;
  editable?: boolean;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ bill, onUpdateItems, editable = false }) => {
  const { products, updateProduct } = usePOS();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>(bill.items);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [availableStock, setAvailableStock] = useState<number>(0);
  
  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    setEditingItem({ ...items[index] });
  };

  const handleSaveItem = () => {
    if (editingItemIndex !== null && editingItem) {
      const updatedItems = [...items];
      // Recalculate total
      const updatedItem = {
        ...editingItem,
        total: editingItem.price * editingItem.quantity
      };
      updatedItems[editingItemIndex] = updatedItem;
      setItems(updatedItems);
      setEditingItemIndex(null);
      setEditingItem(null);
      
      if (onUpdateItems) {
        onUpdateItems(updatedItems);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingItemIndex(null);
    setEditingItem(null);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...items];
    const removedItem = updatedItems[index];
    
    // If this is a product with stock, we need to restore the stock
    if (removedItem.type === 'product') {
      const product = products.find(p => p.id === removedItem.id);
      if (product) {
        // Update the product stock (increase it back)
        updateProduct({
          ...product,
          stock: product.stock + removedItem.quantity
        });
      }
    }
    
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    
    // Auto-fill product information
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setAvailableStock(selectedProduct.stock || 0);
      // Reset quantity to 1 when a new product is selected
      setNewItemQuantity(1);
    }
  };
  
  const handleAddItem = () => {
    if (!selectedProductId) {
      toast({
        title: "Selection Required",
        description: "Please select a product from the list",
        variant: "destructive"
      });
      return;
    }
    
    const selectedProduct = products.find(p => p.id === selectedProductId);
    
    if (!selectedProduct) {
      toast({
        title: "Product Not Found",
        description: "The selected product could not be found",
        variant: "destructive"
      });
      return;
    }
    
    if (newItemQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    if (newItemQuantity > selectedProduct.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedProduct.stock} items available in stock`,
        variant: "destructive"
      });
      return;
    }
    
    const itemToAdd: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: newItemQuantity,
      total: selectedProduct.price * newItemQuantity,
      type: 'product',
      category: selectedProduct.category
    };
    
    const updatedItems = [...items, itemToAdd];
    setItems(updatedItems);
    
    // Update product stock
    updateProduct({
      ...selectedProduct,
      stock: selectedProduct.stock - newItemQuantity
    });
    
    // Reset form
    setSelectedProductId('');
    setNewItemQuantity(1);
    setShowAddForm(false);
    
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  if (!editable) {
    // Original read-only version
    return (
      <div className="space-y-1 mb-4">
        <div className="text-sm font-medium border-b pb-1 mb-2">Items</div>
        {items.map((item, index) => (
          <div key={index} className="receipt-item text-sm">
            <div>
              <span>{item.name}</span>
              {item.quantity > 1 && <span className="text-gray-600"> x{item.quantity}</span>}
            </div>
            <CurrencyDisplay amount={item.total} />
          </div>
        ))}
      </div>
    );
  }

  // Editable version with table
  return (
    <div className="space-y-3 mb-4">
      <div className="text-sm font-medium border-b pb-1 flex justify-between items-center">
        <span>Items</span>
        {editable && !showAddForm && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs" 
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Item
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-gray-800/30 p-3 rounded-md mb-2 border border-gray-700">
          <h4 className="text-sm font-medium mb-2">Add Product</h4>
          <div className="space-y-2">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Select Product</label>
              <Select 
                value={selectedProductId} 
                onValueChange={handleProductSelect}
              >
                <SelectTrigger className="w-full bg-gray-700 border border-gray-600 rounded">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600 text-white max-h-60">
                  {products
                    .filter(p => p.category !== 'membership' && p.stock > 0)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(product => (
                      <SelectItem key={product.id} value={product.id} className="py-2">
                        <div className="flex flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-gray-400">
                            Price: <CurrencyDisplay amount={product.price} /> | 
                            Category: {product.category} | 
                            Stock: {product.stock}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs text-gray-400">Quantity</label>
              <Input
                type="number"
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                value={newItemQuantity}
                min="1"
                max={availableStock}
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
              />
              {selectedProductId && (
                <p className="text-xs text-gray-400 mt-1">
                  Available stock: {availableStock}
                </p>
              )}
            </div>
            
            {selectedProductId && (
              <div className="border border-gray-700 rounded p-2 bg-gray-700/30 mt-2">
                <h5 className="text-xs font-medium mb-1">Selected Product</h5>
                {(() => {
                  const product = products.find(p => p.id === selectedProductId);
                  if (!product) return <p className="text-xs text-gray-400">Product not found</p>;
                  
                  return (
                    <div className="space-y-1 text-xs">
                      <p><span className="text-gray-400">Name:</span> {product.name}</p>
                      <p><span className="text-gray-400">Price:</span> <CurrencyDisplay amount={product.price} /></p>
                      <p><span className="text-gray-400">Category:</span> {product.category}</p>
                      <p><span className="text-gray-400">Stock:</span> {product.stock}</p>
                      <p><span className="text-gray-400">Total:</span> <CurrencyDisplay amount={product.price * newItemQuantity} /></p>
                    </div>
                  );
                })()}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-7 px-2 text-xs bg-cuephoria-purple hover:bg-cuephoria-purple/80" 
                onClick={handleAddItem}
                disabled={!selectedProductId || newItemQuantity < 1 || newItemQuantity > availableStock}
              >
                Add Item
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table className="border border-gray-700 rounded-md overflow-hidden">
        <TableHeader className="bg-gray-800">
          <TableRow>
            <TableHead className="text-xs font-medium text-gray-300">Item</TableHead>
            <TableHead className="text-xs font-medium text-gray-300 text-right">Price</TableHead>
            <TableHead className="text-xs font-medium text-gray-300 text-right">Qty</TableHead>
            <TableHead className="text-xs font-medium text-gray-300 text-right">Total</TableHead>
            {editable && <TableHead className="w-20"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index} className="hover:bg-gray-700/50">
              {editingItemIndex === index ? (
                // Editing mode - only quantity can be edited
                <>
                  <TableCell>
                    <div className="font-medium">{editingItem?.name}</div>
                    <div className="text-xs text-gray-400">{editingItem?.category}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={editingItem?.price || 0} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-right"
                      value={editingItem?.quantity || 1}
                      min="1"
                      onChange={(e) => {
                        if (!editingItem) return;
                        const newQuantity = parseInt(e.target.value) || 1;
                        const product = products.find(p => p.id === editingItem.id);
                        
                        // Calculate max available quantity (current stock + current quantity in item)
                        const currentQuantityInItem = items[editingItemIndex].quantity;
                        const maxAvailable = (product?.stock || 0) + currentQuantityInItem;
                        
                        if (newQuantity > maxAvailable) {
                          toast({
                            title: "Insufficient Stock",
                            description: `Only ${maxAvailable} items available in stock`,
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        setEditingItem({...editingItem, quantity: newQuantity});
                      }}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <CurrencyDisplay amount={(editingItem?.price || 0) * (editingItem?.quantity || 1)} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleSaveItem}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </>
              ) : (
                // View mode
                <>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-gray-400">{item.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={item.price} /></TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right"><CurrencyDisplay amount={item.total} /></TableCell>
                  {editable && (
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditItem(index)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleRemoveItem(index)}>
                        <Trash className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  )}
                </>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReceiptItems;
