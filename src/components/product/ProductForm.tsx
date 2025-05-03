
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/types/pos.types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

interface ProductFormProps {
  isEditMode: boolean;
  selectedProduct: Product | null;
  onSubmit: (e: React.FormEvent, formData: ProductFormState) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export interface ProductFormState {
  name: string;
  price: string;
  category: string;
  stock: string;
  originalPrice: string;
  offerPrice: string;
  studentPrice: string;
  duration: string;
  membershipHours: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isEditMode,
  selectedProduct,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const { categories } = usePOS();
  const [formState, setFormState] = useState<ProductFormState>({
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
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && selectedProduct) {
      setFormState({
        name: selectedProduct.name,
        price: selectedProduct.price.toString(),
        category: selectedProduct.category,
        stock: selectedProduct.stock.toString(),
        originalPrice: selectedProduct.originalPrice?.toString() || '',
        offerPrice: selectedProduct.offerPrice?.toString() || '',
        studentPrice: selectedProduct.studentPrice?.toString() || '',
        duration: selectedProduct.duration || '',
        membershipHours: selectedProduct.membershipHours?.toString() || '',
      });
    } else {
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
    }
    // Clear validation errors when selected product changes
    setValidationErrors({});
  }, [isEditMode, selectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when it changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field when it changes
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    if (!formState.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formState.price) {
      errors.price = 'Price is required';
    } else if (parseFloat(formState.price) < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    if (!formState.category) {
      errors.category = 'Category is required';
    }
    
    if (!formState.stock) {
      errors.stock = 'Stock is required';
    } else if (parseInt(formState.stock) < 0) {
      errors.stock = 'Stock cannot be negative';
    }
    
    // Membership specific validations
    if (formState.category === 'membership') {
      if (formState.duration === '') {
        errors.duration = 'Duration is required for membership products';
      }
      
      if (!formState.membershipHours) {
        errors.membershipHours = 'Membership hours are required';
      } else if (parseInt(formState.membershipHours) <= 0) {
        errors.membershipHours = 'Membership hours must be greater than 0';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(e, formState);
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="grid gap-4 py-4">
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please correct the errors below before submitting
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="name" className={validationErrors.name ? 'text-destructive' : ''}>
            Product Name*
          </Label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className={validationErrors.name ? 'border-destructive' : ''}
            required
          />
          {validationErrors.name && (
            <p className="text-xs text-destructive mt-1">{validationErrors.name}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="price" className={validationErrors.price ? 'text-destructive' : ''}>
            Price (₹)*
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formState.price}
            onChange={handleChange}
            placeholder="Enter price in INR"
            className={validationErrors.price ? 'border-destructive' : ''}
            min="0"
            required
          />
          {validationErrors.price && (
            <p className="text-xs text-destructive mt-1">{validationErrors.price}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="category" className={validationErrors.category ? 'text-destructive' : ''}>
            Category*
          </Label>
          <Select
            value={formState.category}
            onValueChange={(value) => handleSelectChange('category', value)}
            required
          >
            <SelectTrigger className={validationErrors.category ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validationErrors.category && (
            <p className="text-xs text-destructive mt-1">{validationErrors.category}</p>
          )}
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="stock" className={validationErrors.stock ? 'text-destructive' : ''}>
            Stock*
          </Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formState.stock}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            className={validationErrors.stock ? 'border-destructive' : ''}
            min="0"
            required
          />
          {validationErrors.stock && (
            <p className="text-xs text-destructive mt-1">{validationErrors.stock}</p>
          )}
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
              <Label 
                htmlFor="duration" 
                className={validationErrors.duration ? 'text-destructive' : ''}
              >
                Duration*
              </Label>
              <Select
                value={formState.duration}
                onValueChange={(value) => handleSelectChange('duration', value)}
              >
                <SelectTrigger className={validationErrors.duration ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.duration && (
                <p className="text-xs text-destructive mt-1">{validationErrors.duration}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label 
                htmlFor="membershipHours"
                className={validationErrors.membershipHours ? 'text-destructive' : ''}
              >
                Membership Hours*
              </Label>
              <Input
                id="membershipHours"
                name="membershipHours"
                type="number"
                value={formState.membershipHours}
                onChange={handleChange}
                placeholder="Enter membership hours"
                className={validationErrors.membershipHours ? 'border-destructive' : ''}
                min="0"
              />
              {validationErrors.membershipHours && (
                <p className="text-xs text-destructive mt-1">{validationErrors.membershipHours}</p>
              )}
            </div>
          </>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
