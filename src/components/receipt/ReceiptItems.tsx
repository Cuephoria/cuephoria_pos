
import React from 'react';
import { Bill } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ReceiptItemsProps {
  bill: Bill;
  showTooltips?: boolean;
}

const ReceiptItems: React.FC<ReceiptItemsProps> = ({ bill, showTooltips = false }) => {
  return (
    <div className="space-y-1 mb-4">
      <div className="text-sm font-medium border-b pb-1 mb-2">Items</div>
      <div className="max-h-[250px] overflow-y-auto">
        {bill.items.map((item, index) => (
          <div key={index} className="receipt-item text-sm py-1 hover:bg-gray-800 rounded px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span>{item.name}</span>
                {item.quantity > 1 && <span className="text-gray-500 ml-1">x{item.quantity}</span>}
                
                {showTooltips && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1 text-gray-500 hover:text-gray-400">
                          <Info className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="w-64 p-2">
                        <div className="space-y-1">
                          <p><strong>Item ID:</strong> {item.id}</p>
                          <p><strong>Type:</strong> {item.type}</p>
                          <p><strong>Unit Price:</strong> ₹{item.price.toFixed(2)}</p>
                          <p><strong>Quantity:</strong> {item.quantity}</p>
                          <p><strong>Total:</strong> ₹{item.total.toFixed(2)}</p>
                          {item.category && <p><strong>Category:</strong> {item.category}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <CurrencyDisplay amount={item.total} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceiptItems;
