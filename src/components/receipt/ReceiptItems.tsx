
import React, { useState } from 'react';
import { Bill, CartItem } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Plus, Save, X } from 'lucide-react';

interface ReceiptItemsProps {
  bill: Bill;
  onUpdateItems?: (items: CartItem[]) => void;
  editable?: boolean;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ bill, onUpdateItems, editable = false }) => {
  const [items, setItems] = useState<CartItem[]>(bill.items);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState<Partial<CartItem>>({
    name: '',
    price: 0,
    quantity: 1,
    type: 'product',
  });

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
    updatedItems.splice(index, 1);
    setItems(updatedItems);
    
    if (onUpdateItems) {
      onUpdateItems(updatedItems);
    }
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.price && newItem.quantity) {
      const itemToAdd: CartItem = {
        id: `manual-${Date.now()}`,
        name: newItem.name || '',
        price: newItem.price || 0,
        quantity: newItem.quantity || 1,
        total: (newItem.price || 0) * (newItem.quantity || 1),
        type: newItem.type || 'product',
      };
      
      const updatedItems = [...items, itemToAdd];
      setItems(updatedItems);
      
      // Reset form
      setNewItem({
        name: '',
        price: 0,
        quantity: 1,
        type: 'product',
      });
      setShowAddForm(false);
      
      if (onUpdateItems) {
        onUpdateItems(updatedItems);
      }
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
          <h4 className="text-sm font-medium mb-2">Add New Item</h4>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Item Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Type</label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value={newItem.type || 'product'}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value as 'product' | 'session'})}
                >
                  <option value="product">Product</option>
                  <option value="session">Session</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400">Price</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value={newItem.price || 0}
                  onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Quantity</label>
                <input
                  type="number"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  value={newItem.quantity || 1}
                  min="1"
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                />
              </div>
            </div>
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
                // Editing mode
                <>
                  <TableCell>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                      value={editingItem?.name || ''}
                      onChange={(e) => setEditingItem({...editingItem!, name: e.target.value})}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-right"
                      value={editingItem?.price || 0}
                      onChange={(e) => setEditingItem({...editingItem!, price: parseFloat(e.target.value)})}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-right"
                      value={editingItem?.quantity || 1}
                      min="1"
                      onChange={(e) => setEditingItem({...editingItem!, quantity: parseInt(e.target.value)})}
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
                      <span className="text-xs text-gray-400">{item.type}</span>
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
