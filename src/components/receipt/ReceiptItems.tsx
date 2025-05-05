
import React from 'react';
import { CartItem } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReceiptItemsProps {
  items: CartItem[];
  editable?: boolean;
  onUpdateQuantity?: (itemId: string, newQuantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ 
  items, 
  editable = false,
  onUpdateQuantity,
  onRemoveItem
}) => {
  return (
    <div className="border-t border-b border-gray-200 py-3 mb-3">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="pb-2">{editable ? 'Product' : 'Item'}</th>
            <th className="pb-2 text-center">Qty</th>
            <th className="pb-2 text-right">Price</th>
            <th className="pb-2 text-right">Amount</th>
            {editable && <th className="w-10"></th>}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`${item.id}-${index}`} className="border-t border-gray-100 first:border-0">
              <td className="py-2">{item.name}</td>
              <td className="py-2 text-center">
                {editable && onUpdateQuantity ? (
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  item.quantity
                )}
              </td>
              <td className="py-2 text-right"><CurrencyDisplay amount={item.price} /></td>
              <td className="py-2 text-right"><CurrencyDisplay amount={item.price * item.quantity} /></td>
              {editable && onRemoveItem && (
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReceiptItems;
