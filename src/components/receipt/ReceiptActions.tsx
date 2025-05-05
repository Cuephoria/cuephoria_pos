
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft, Save, RefreshCw, Trash2 } from 'lucide-react';

interface ReceiptActionsProps {
  onPrint?: () => void;
  onDownload?: () => void;
  onClose?: () => void;
  isPrinting?: boolean;
  isDownloading?: boolean;
  onSave?: () => Promise<void>;
  onReset?: () => void;
  onDelete?: () => Promise<boolean>;
  hasChanges?: boolean;
}

const ReceiptActions: React.FC<ReceiptActionsProps> = ({ 
  onPrint, 
  onDownload, 
  onClose, 
  isPrinting, 
  isDownloading,
  onSave,
  onReset,
  onDelete,
  hasChanges
}) => {
  if (onSave) {
    // Edit mode actions
    return (
      <div className="bg-gray-100 p-4 flex flex-col gap-3">
        <div className="flex gap-3 justify-center">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="flex items-center gap-1 w-full"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Changes
          </Button>
          <Button 
            onClick={onSave}
            disabled={!hasChanges}
            className="flex items-center gap-1 w-full bg-cuephoria-purple hover:bg-cuephoria-purple/80"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
        {onDelete && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex items-center gap-1 justify-center"
          >
            <Trash2 className="h-4 w-4" />
            Delete Bill
          </Button>
        )}
      </div>
    );
  }

  // View/print mode actions
  return (
    <div className="bg-gray-100 p-4 flex flex-col gap-3">
      <div className="flex gap-3 justify-center">
        {onPrint && (
          <Button 
            variant="outline" 
            onClick={onPrint}
            disabled={isPrinting}
            className="flex items-center gap-1 w-full"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Printing...' : 'Print Receipt'}
          </Button>
        )}
        {onDownload && (
          <Button 
            onClick={onDownload}
            disabled={isDownloading}
            className="flex items-center gap-1 w-full bg-cuephoria-purple hover:bg-cuephoria-purple/80"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
        )}
      </div>
      {onClose && (
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="flex items-center gap-1 justify-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to POS
        </Button>
      )}
    </div>
  );
};

export default ReceiptActions;
