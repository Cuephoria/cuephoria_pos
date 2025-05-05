
import React, { useState, useRef, MutableRefObject } from 'react';
import { Bill, Customer, Product } from '@/types/pos.types';
import CustomerInfo from './CustomerInfo';
import ReceiptHeader from './ReceiptHeader';
import ReceiptTitle from './ReceiptTitle';
import ReceiptItems from './ReceiptItems';
import ReceiptSummary from './ReceiptSummary';
import ReceiptFooter from './ReceiptFooter';
import ReceiptActions from './ReceiptActions';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/ui/currency';

interface ReceiptContentProps {
  bill: Bill;
  customer: Customer;
  receiptRef: MutableRefObject<HTMLDivElement | null>;
  onUpdateBill?: (bill: Bill) => Promise<boolean>;
  onDeleteBill?: (billId: string, customerId: string) => Promise<boolean>;
  printMode?: boolean;
  products?: Product[];
  allowAddProducts?: boolean;
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({
  bill,
  customer,
  receiptRef,
  onUpdateBill,
  onDeleteBill,
  printMode = false,
  products = [],
  allowAddProducts = false
}) => {
  const [editedBill, setEditedBill] = useState<Bill>({ ...bill });
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductDialog, setShowProductDialog] = useState(false);

  const filteredProducts = products.filter(product => 
    product.category !== 'membership' && 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    const existingItemIndex = editedBill.items.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // If product already exists in bill, increase quantity
      const updatedItems = [...editedBill.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      
      // Recalculate subtotal and total
      const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setEditedBill({
        ...editedBill,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal - (editedBill.discountValue || 0)
      });
    } else {
      // Add new product to bill
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      };
      
      const updatedItems = [...editedBill.items, newItem];
      const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setEditedBill({
        ...editedBill,
        items: updatedItems,
        subtotal: newSubtotal,
        total: newSubtotal - (editedBill.discountValue || 0)
      });
    }
    
    setShowProductDialog(false);
    setSearchQuery('');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = editedBill.items.filter(item => item.id !== itemId);
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setEditedBill({
      ...editedBill,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal - (editedBill.discountValue || 0)
    });
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    
    const updatedItems = editedBill.items.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setEditedBill({
      ...editedBill,
      items: updatedItems,
      subtotal: newSubtotal,
      total: newSubtotal - (editedBill.discountValue || 0)
    });
  };

  const handleSave = async () => {
    if (onUpdateBill) {
      await onUpdateBill(editedBill);
    }
  };

  const handleReset = () => {
    setEditedBill({ ...bill });
  };

  return (
    <div className="relative bg-white">
      <div
        ref={receiptRef}
        className={`bg-white p-6 ${printMode ? 'w-full' : 'w-auto'}`}
      >
        <ReceiptHeader />
        <ReceiptTitle date={new Date(bill.createdAt)} />
        <CustomerInfo customer={customer} />
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Items</h3>
            {allowAddProducts && onUpdateBill && (
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Products to Bill</DialogTitle>
                  </DialogHeader>
                  <div className="my-4">
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-4"
                    />
                    <ScrollArea className="h-[300px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredProducts.map(product => (
                          <div 
                            key={product.id} 
                            className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                            onClick={() => handleAddProduct(product)}
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <Badge className="mt-1">{product.category}</Badge>
                            </div>
                            <CurrencyDisplay amount={product.price} />
                          </div>
                        ))}
                        {filteredProducts.length === 0 && (
                          <p className="text-gray-500 text-center col-span-2 py-8">
                            No products found
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <ReceiptItems 
            items={editedBill.items} 
            editable={!!onUpdateBill}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
          />
        </div>
        
        <ReceiptSummary 
          subtotal={editedBill.subtotal} 
          discount={editedBill.discountValue || 0} 
          total={editedBill.total}
          paymentMethod={editedBill.paymentMethod}
          pointsUsed={editedBill.loyaltyPointsUsed}
        />
        
        <ReceiptFooter />
      </div>

      {!printMode && onUpdateBill && (
        <ReceiptActions 
          onSave={handleSave} 
          onReset={handleReset}
          onDelete={onDeleteBill ? () => onDeleteBill(bill.id, bill.customerId) : undefined}
          hasChanges={JSON.stringify(bill) !== JSON.stringify(editedBill)}
        />
      )}
    </div>
  );
};

export default ReceiptContent;
