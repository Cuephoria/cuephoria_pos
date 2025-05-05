
import React, { ReactNode, RefObject, useState } from 'react';
import { Bill, Customer } from '@/context/POSContext';
import ReceiptHeader from './ReceiptHeader';
import CustomerInfo from './CustomerInfo';
import ReceiptItems from './ReceiptItems';
import ReceiptSummary from './ReceiptSummary';
import ReceiptFooter from './ReceiptFooter';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Info, Save } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ReceiptContentProps {
  bill: Bill;
  customer: Customer;
  receiptRef: RefObject<HTMLDivElement>;
  onUpdateBill?: (updatedBill: Bill) => Promise<boolean>;
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({ 
  bill, 
  customer, 
  receiptRef,
  onUpdateBill 
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBill, setEditedBill] = useState<Bill>({ ...bill });

  // Check if bill is valid
  if (!bill || !bill.id) {
    return (
      <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold">Error: Invalid Bill Data</h3>
          <p className="mt-2">Unable to display receipt. Bill information is missing or invalid.</p>
        </div>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedBill({ ...bill });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (onUpdateBill && await onUpdateBill(editedBill)) {
      setIsEditing(false);
    }
  };

  const handleInputChange = (field: keyof Bill, value: any) => {
    setEditedBill(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
      <ReceiptHeader bill={isEditing ? editedBill : bill} />
      <CustomerInfo customer={customer} />
      
      <ReceiptItems bill={bill} showTooltips={true} />
      
      {user?.isAdmin && onUpdateBill && (
        <div className="flex justify-end mb-2">
          {isEditing ? (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEditToggle} size="sm">
                Cancel
              </Button>
              <Button variant="default" onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleEditToggle} size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>
      )}
      
      {isEditing && user?.isAdmin ? (
        <div className="space-y-3 mb-4 border p-3 rounded-md">
          <div className="flex items-center space-x-2">
            <label className="w-1/3 text-sm">Subtotal:</label>
            <Input 
              type="number"
              value={editedBill.subtotal}
              onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
              className="w-2/3"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="w-1/3 text-sm">Discount {editedBill.discountType === 'percentage' ? '(%)' : '(₹)'}:</label>
            <Input 
              type="number"
              value={editedBill.discount}
              onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
              className="w-2/3"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="w-1/3 text-sm">Discount Type:</label>
            <select
              value={editedBill.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value as 'percentage' | 'fixed')}
              className="w-2/3 p-2 border rounded"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="w-1/3 text-sm">Loyalty Points Used:</label>
            <Input 
              type="number"
              value={editedBill.loyaltyPointsUsed}
              onChange={(e) => handleInputChange('loyaltyPointsUsed', parseInt(e.target.value) || 0)}
              className="w-2/3"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="w-1/3 text-sm">Payment Method:</label>
            <select
              value={editedBill.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'cash' | 'upi')}
              className="w-2/3 p-2 border rounded"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            <p>Total will be recalculated based on subtotal, discount, and loyalty points.</p>
          </div>
        </div>
      ) : (
        <ReceiptSummary bill={bill} />
      )}
      
      <ReceiptFooter />
    </div>
  );
};

export default ReceiptContent;
