
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ProductForm, { ProductFormState } from './ProductForm';
import { Product } from '@/types/pos.types';

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  selectedProduct: Product | null;
  onSubmit: (e: React.FormEvent, formData: ProductFormState) => void;
  isSubmitting: boolean;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onOpenChange,
  isEditMode,
  selectedProduct,
  onSubmit,
  isSubmitting
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <ProductForm
          isEditMode={isEditMode}
          selectedProduct={selectedProduct}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
