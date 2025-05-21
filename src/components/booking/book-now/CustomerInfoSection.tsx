
import React from 'react';
import CustomerInfoForm from '@/components/booking/CustomerInfoForm';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  isExistingCustomer: boolean;
  customerId?: string;
}

interface CustomerInfoSectionProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
}

const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  customerInfo,
  onChange
}) => {
  return <CustomerInfoForm customerInfo={customerInfo} onChange={onChange} />;
};

export default CustomerInfoSection;
