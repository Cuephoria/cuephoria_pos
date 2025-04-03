
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Product } from '@/types/pos.types';

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
  }, [isEditMode, selectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, formState);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Product Name*</Label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Price (₹)*</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formState.price}
            onChange={handleChange}
            placeholder="Enter price in INR"
            min="0"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category*</Label>
          <Select
            value={formState.category}
            onValueChange={(value) => handleSelectChange('category', value)}
            required
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
          <Label htmlFor="stock">Stock*</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            value={formState.stock}
            onChange={handleChange}
            placeholder="Enter stock quantity"
            min="0"
            required
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
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formState.duration}
                onValueChange={(value) => handleSelectChange('duration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="membershipHours">Membership Hours</Label>
              <Input
                id="membershipHours"
                name="membershipHours"
                type="number"
                value={formState.membershipHours}
                onChange={handleChange}
                placeholder="Enter membership hours"
                min="0"
              />
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
